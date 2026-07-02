import { Suspense } from "react";
import { getDB } from "@/lib/mongodb";
import BrowseArtworksClient from "@/components/artwork/BrowseArtworksClient";

/**
 * Escapes special regex characters to prevent runtime search parameter crashes
 */
const escapeRegex = (string) => {
  return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

/**
 * @page    BrowseArtworksPage
 * @desc    Server component that dynamically reads URL searchParams and fetches filtered dataset directly from MongoDB
 */
export default async function BrowseArtworksPage({ searchParams }) {
  // Await searchParams in Next.js 15+ environments to safely read values
  const params = await searchParams;
  
  const search = params?.search || "";
  const category = params?.category || "";
  const sort = params?.sort || "newest";
  const minPrice = params?.minPrice || "";
  const maxPrice = params?.maxPrice || "";
  const page = Math.max(1, Number(params?.page || 1));
  const limit = Math.max(1, Number(params?.limit || 12));

  let artworks = [];
  let totalCount = 0;

  try {
    const db = await getDB();
    const finalFilter = {};

    // 1. Live Search Logic (Title or Artist Name matching)
    if (search.trim() && search !== "undefined" && search !== "null") {
      const sanitizedSearch = escapeRegex(search.trim());
      const searchRegex = new RegExp(sanitizedSearch, "i");
      finalFilter.$or = [{ title: searchRegex }, { artistName: searchRegex }];
    }

    // 2. Dynamic Category Match (Supports 'all' bypass)
    if (category.trim() && category !== "undefined" && category !== "null" && category !== "all") {
      finalFilter.category = { $regex: escapeRegex(category.trim()), $options: "i" };
    }

    // 3. Price Range Boundaries Validation
    if (minPrice || maxPrice) {
      finalFilter.price = {};
      if (minPrice && !isNaN(minPrice)) finalFilter.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(maxPrice)) finalFilter.price.$lte = Number(maxPrice);
      if (Object.keys(finalFilter.price).length === 0) delete finalFilter.price;
    }

    // 4. Sorting Evaluation Map
    const sortMap = {
      newest: { createdAt: -1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
    };
    const sortOpt = sortMap[sort] || { createdAt: -1 };

    // 5. Pagination Skip Offset Formula
    const skip = (page - 1) * limit;

    // Execute concurrent tracking operations to optimize database processing time
    const [data, total] = await Promise.all([
      db.collection("artworks")
        .find(finalFilter, {
          projection: {
            title: 1,
            image: 1,
            price: 1,
            category: 1,
            isSold: 1,
            artistName: 1,
            createdAt: 1,
          }
        })
        .sort(sortOpt)
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("artworks").countDocuments(finalFilter)
    ]);

    // Format BSON objects into safe serializable JSON streams
    artworks = data.map(item => ({
      ...item,
      _id: item._id.toString(),
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()
    }));
    
    totalCount = total;
   
  } catch (collectionFetchError) {
    console.error(`[DATABASE] Structural dataset compilation error inside artworks stream execution: ${collectionFetchError.message}`);
  }

  return (
    <Suspense 
      key={JSON.stringify(params)} // Forces Suspense to trigger loading state when URL search parameters change
      fallback={
        <div className="min-h-screen bg-[#2f3f48] flex items-center justify-center">
          <p className="text-white text-sm font-medium animate-pulse">Querying Catalog Databases...</p>
        </div>
      }
    >
      <BrowseArtworksClient 
        initialArtworks={artworks} 
        totalArtworks={totalCount}
        currentPage={page}
        totalPages={Math.ceil(totalCount / limit)}
      />
    </Suspense>
  );
}