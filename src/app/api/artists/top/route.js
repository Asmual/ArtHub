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
    const orderCollection = db.collection("orders");

    const allOrders = await orderCollection.find({}).toArray();

    const artistsWithStats = await Promise.all(
      artists.map(async (artist) => {
        const artistStrId = artist._id.toString();
        const cleanName = (artist.name || "").trim();

        const artworkConditions = [
          { userId: artistStrId },
          { artistId: artistStrId },
          { userId: artist._id },
          { artistId: artist._id },
        ];
        if (artist.email) {
          artworkConditions.push(
            { artistEmail: artist.email },
            { artistEmail: artist.email.toLowerCase() },
            { userEmail: artist.email }
          );
        }
        if (cleanName) {
          artworkConditions.push({
            artistName: { $regex: new RegExp(`^${cleanName}$`, "i") },
          });
        }

        const artworks = await artworkCollection
          .find({ $or: artworkConditions })
          .toArray();

        const artworkIdSet = new Set(artworks.map((a) => a._id.toString()));
        const artworkTitleSet = new Set(artworks.map((a) => a.title).filter(Boolean));

        const matchedOrders = allOrders.filter((ord) => {
          if (ord.artistId && (ord.artistId === artistStrId || ord.artistId === artist._id)) return true;
          if (artist.email && (ord.artistEmail?.toLowerCase() === artist.email.toLowerCase() || ord.artwork?.artistEmail?.toLowerCase() === artist.email.toLowerCase() || ord.artworkDetails?.artistEmail?.toLowerCase() === artist.email.toLowerCase())) return true;
          if (cleanName && (ord.artworkDetails?.artistName?.toLowerCase() === cleanName.toLowerCase() || ord.artwork?.artistName?.toLowerCase() === cleanName.toLowerCase())) return true;
          if (ord.artworkId && artworkIdSet.has(ord.artworkId.toString())) return true;
          if (ord.artworkTitle && artworkTitleSet.has(ord.artworkTitle)) return true;
          return false;
        });

        const totalSold = matchedOrders.length;
        const totalEarnings = matchedOrders.reduce(
          (sum, ord) => sum + (Number(ord.amount || ord.price) || 0),
          0
        );

        return {
          ...artist,
          _id: artistStrId,
          totalArtworks: artworks.length,
          totalSold,
          totalSales: totalSold,
          totalEarnings,
          totalRevenue: totalEarnings,
        };
      })
    );

    // Sort by sales descending, then by total artworks descending
    artistsWithStats.sort((a, b) => (b.totalSold - a.totalSold) || (b.totalArtworks - a.totalArtworks));
    return NextResponse.json(artistsWithStats.slice(0, 4));
  } catch (err) {
    console.error("[API ROUTE ERROR] Top artists error:", err.message);
    return NextResponse.json([], { status: 500 });
  }
}
