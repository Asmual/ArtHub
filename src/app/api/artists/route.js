import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";

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
        const artworks = await artworkCollection
          .find({
            $or: [
              { userId: artistStrId },
              { artistId: artistStrId },
              { userId: artist._id },
              { artistId: artist._id },
              { artistEmail: artist.email },
              { userEmail: artist.email },
            ],
          })
          .toArray();

        return {
          ...artist,
          _id: artist._id.toString(),
          totalArtworks: artworks.length,
          totalSold: artist.totalSold ?? artworks.filter((a) => a.isSold === true).length,
        };
      })
    );

    return NextResponse.json(artistsWithStats);
  } catch (err) {
    console.error("[API ROUTE ERROR] Artists list error:", err.message);
    return NextResponse.json([], { status: 500 });
  }
}
