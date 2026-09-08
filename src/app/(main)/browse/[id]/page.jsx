import { getDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import ArtworkDetailsClient from "@/components/artwork/ArtworkDetailsClient";

export default async function ArtworkDetailsPage({ params }) {
  const { id } = await params;
 
  if (!id || !ObjectId.isValid(id)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#2f3f48] flex items-center justify-center text-slate-700 dark:text-white">
        <p className="text-lg font-semibold">Invalid Artwork Identifier!</p>
      </div>
    );
  }

  let artwork = null;

  try {
    const db = await getDB();
   
    const data = await db.collection("artworks").findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          title: 1,
          description: 1,
          image: 1,
          price: 1,
          category: 1,
          isSold: 1,
          buyerId: 1,
          buyerEmail: 1,
          artistEmail: 1,
          userEmail: 1,
          userId: 1,
          artistId: 1,
          artist: 1,
          artistName: 1,
          specialty: 1,
          createdAt: 1,
        }
      }
    );

    if (data) {
      const rawArtistId = data.userId || data.artistId || data.artist;
      let artistData = null;

      if (rawArtistId) {
        try {
          const artistObjId = typeof rawArtistId === "string" && ObjectId.isValid(rawArtistId)
            ? new ObjectId(rawArtistId)
            : rawArtistId;
         
          const userDoc = await db.collection("user").findOne(
            { _id: artistObjId },
            { projection: { name: 1, email: 1, role: 1, specialty: 1 } }
          );
         
          if (userDoc) {
            artistData = {
              ...userDoc,
              _id: userDoc._id.toString()
            };
          }
        } catch (artistFetchError) {
          console.error(`[DATABASE] Relational integrity failure matching artist blueprint context: ${artistFetchError.message}`);
        }
      }

      // Serialize MongoDB ObjectIds to strings before passing to client component
      artwork = {
        ...data,
        _id: data._id.toString(),
        userId: data.userId ? data.userId.toString() : null,
        artistId: data.artistId ? data.artistId.toString() : null,
        buyerId: data.buyerId ? data.buyerId.toString() : null,
        buyerEmail: data.buyerEmail || null,
        artistEmail: data.artistEmail || data.userEmail || artistData?.email || null,
        userEmail: data.userEmail || null,
        createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
        artist: artistData,
        resolvedArtistId: artistData?._id || (typeof rawArtistId === "string" ? rawArtistId : rawArtistId?.toString()) || null
      };
    }
  } catch (primaryFetchError) {
    console.error(`[DATABASE] Core runtime operational failure executing findOne on artwork schema collection: ${primaryFetchError.message}`);
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#2f3f48] flex items-center justify-center text-slate-700 dark:text-white">
        <p className="text-lg font-semibold">Artwork Not Found!</p>
      </div>
    );
  }

  return <ArtworkDetailsClient artwork={artwork} />;
}