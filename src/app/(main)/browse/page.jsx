import { Suspense } from "react";
import { ObjectId } from "mongodb";
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
  // const page = Math.max(1, Number(params?.page || 1));
  // const limit = Math.max(1, Number(params?.limit || 12));

  let artworks = [];
  let totalCount = 0;

  try {
    const db = await getDB();
    const finalFilter = {};

    // 1. Search Logic (Title, Category, Artist Name, or Artist Email)
    if (search.trim() && search !== "undefined" && search !== "null") {
      const sanitizedSearch = escapeRegex(search.trim());
      const searchRegex = new RegExp(sanitizedSearch, "i");

      // Resolve matching artist users from user collection
      const matchingArtists = await db
        .collection("user")
        .find(
          { $or: [{ name: searchRegex }, { email: searchRegex }] },
          { projection: { _id: 1, email: 1 } }
        )
        .toArray();

      const matchedArtistIds = matchingArtists.map((a) => a._id.toString());
      const matchedArtistOids = matchingArtists.map((a) => a._id);
      const matchedArtistEmails = matchingArtists.map((a) => a.email).filter(Boolean);

      finalFilter.$or = [
        { title: searchRegex },
        { artistName: searchRegex },
        { category: searchRegex },
        ...(matchedArtistIds.length > 0
          ? [
              { userId: { $in: [...matchedArtistIds, ...matchedArtistOids] } },
              { artistId: { $in: [...matchedArtistIds, ...matchedArtistOids] } },
            ]
          : []),
        ...(matchedArtistEmails.length > 0
          ? [
              { artistEmail: { $in: matchedArtistEmails } },
              { userEmail: { $in: matchedArtistEmails } },
            ]
          : []),
      ];
    }

    // 2. Dynamic Category Match (Supports 'all' bypass)
    if (
      category.trim() &&
      category !== "undefined" &&
      category !== "null" &&
      category !== "all"
    ) {
      finalFilter.category = {
        $regex: escapeRegex(category.trim()),
        $options: "i",
      };
    }

    // 3. Price Range Boundaries Validation
    if (minPrice || maxPrice) {
      finalFilter.price = {};
      if (minPrice && !isNaN(minPrice))
        finalFilter.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(maxPrice))
        finalFilter.price.$lte = Number(maxPrice);
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
    // const skip = (page - 1) * limit;

    // Execute concurrent tracking operations to optimize database processing time
    const [data, total] = await Promise.all([
      db
        .collection("artworks")
        .find(finalFilter, {
          projection: {
            title: 1,
            image: 1,
            price: 1,
            category: 1,
            isSold: 1,
            artistName: 1,
            userId: 1,
            artistEmail: 1,
            userEmail: 1,
            createdAt: 1,
          },
        })
        .sort(sortOpt)
        .toArray(),

      db.collection("artworks").countDocuments(finalFilter),
    ]);

    // Auto-populate artistName from users collection if missing
    const missingArtistUserIds = data
      .filter((a) => !a.artistName && a.userId)
      .map((a) => a.userId);
    const missingArtistEmails = data
      .filter((a) => !a.artistName && (a.artistEmail || a.userEmail))
      .map((a) => a.artistEmail || a.userEmail);

    const artistNameMap = new Map();
    if (missingArtistUserIds.length > 0 || missingArtistEmails.length > 0) {
      const userOids = [];
      const userStrIds = [];
      missingArtistUserIds.forEach((uid) => {
        try {
          userOids.push(new ObjectId(uid));
        } catch {
          userStrIds.push(uid);
        }
      });

      const matchedUsers = await db
        .collection("user")
        .find({
          $or: [
            ...(userOids.length > 0 ? [{ _id: { $in: userOids } }] : []),
            ...(userStrIds.length > 0 ? [{ _id: { $in: userStrIds } }] : []),
            ...(missingArtistEmails.length > 0
              ? [{ email: { $in: missingArtistEmails } }]
              : []),
          ],
        })
        .toArray();

      matchedUsers.forEach((u) => {
        if (u._id) artistNameMap.set(u._id.toString(), u.name);
        if (u.email) artistNameMap.set(u.email.toLowerCase(), u.name);
      });
    }

    // Format BSON objects into safe serializable JSON streams
    artworks = data.map((item) => {
      const resolvedArtistName =
        item.artistName ||
        (item.userId && artistNameMap.get(item.userId.toString())) ||
        (item.artistEmail && artistNameMap.get(item.artistEmail.toLowerCase())) ||
        (item.userEmail && artistNameMap.get(item.userEmail.toLowerCase())) ||
        "Unknown Artist";

      return {
        _id: item._id.toString(),
        title: item.title,
        image: item.image,
        price: item.price,
        category: item.category,
        isSold: item.isSold,
        artistName: resolvedArtistName,
        createdAt: item.createdAt
          ? new Date(item.createdAt).toISOString()
          : new Date().toISOString(),
      };
    });

    totalCount = total;
  } catch (collectionFetchError) {
    console.error(
      `[DATABASE] Structural dataset compilation error inside artworks stream execution: ${collectionFetchError.message}`,
    );
  }

  return (
    <Suspense
      key={JSON.stringify(params)} // Forces Suspense to trigger loading state when URL search parameters change
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-[#2f3f48] flex items-center justify-center">
          <p className="text-slate-600 dark:text-white text-sm font-medium animate-pulse">
            Querying Catalog Databases...
          </p>
        </div>
      }
    >
      <BrowseArtworksClient
        initialArtworks={artworks}
        totalArtworks={totalCount}
        currentPage={1}
        totalPages={1}
      />
    </Suspense>
  );
}
