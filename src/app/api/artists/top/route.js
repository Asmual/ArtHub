import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";

// Cache route response for 60 seconds
export const revalidate = 60;

export async function GET() {
  try {
    const db = await getDB();
    const artists = await db
      .collection("user")
      .find({ role: "artist" })
      .project({ password: 0, hashedPassword: 0 })
      .toArray();

    const artworkCollection = db.collection("artworks");
    const artistsWithStats = await Promise.all(
      artists.map(async (artist) => {
        const artistStrId = artist._id.toString();
        const artworkQuery = {
          $or: [
            { userId: artistStrId },
            { artistId: artistStrId },
            { userId: artist._id },
            { artistId: artist._id },
            { artistEmail: artist.email },
            { userEmail: artist.email },
          ],
        };

        const artworks = await artworkCollection.find(artworkQuery).toArray();
        const totalArtworks = artworks.length;
        const totalSold = artworks.filter((a) => a.isSold === true).length;

        return {
          ...artist,
          _id: artist._id.toString(),
          totalArtworks,
          totalSold: artist.totalSold ?? totalSold,
        };
      })
    );

    artistsWithStats.sort((a, b) => b.totalSold - a.totalSold);
    return NextResponse.json(artistsWithStats.slice(0, 4));
  } catch (err) {
    console.error("[API ROUTE ERROR] Top artists error:", err.message);
    return NextResponse.json([], { status: 500 });
  }
}
