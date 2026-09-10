import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id || "").trim();
    const db = await getDB();

    let query = {
      $or: [
        { id: decodedId },
        { email: decodedId },
        { email: decodedId.toLowerCase() },
      ],
    };
    if (ObjectId.isValid(decodedId)) {
      try {
        query.$or.push({ _id: new ObjectId(decodedId) });
      } catch {
        // invalid ObjectId format
      }
    }

    const artist = await db.collection("user").findOne(query);

    const artworkQuery = {
      $or: [
        { userId: decodedId },
        { artistId: decodedId },
      ],
    };
    if (artist?.email) {
      artworkQuery.$or.push({ artistEmail: artist.email }, { userEmail: artist.email });
    }
    if (ObjectId.isValid(id)) {
      artworkQuery.$or.push({ userId: new ObjectId(id) }, { artistId: new ObjectId(id) });
    }

    const artworks = await db.collection("artworks").find(artworkQuery).toArray();
    const totalArtworks = artworks.length;

    // Calculate total earnings from sold artworks or orders
    const orderQuery = {
      $or: [
        { artistId: id },
        ...(artist?.email ? [{ artistEmail: artist.email }] : []),
      ],
    };
    const orders = await db.collection("orders").find(orderQuery).toArray();
    const totalEarnings = orders.reduce((sum, ord) => sum + (Number(ord.amount) || 0), 0);

    return NextResponse.json({
      totalArtworks,
      totalEarnings,
      totalSales: orders.length,
    });
  } catch (err) {
    console.error("[ARTISTS API ERROR] stats GET:", err);
    return NextResponse.json(
      { error: true, message: "Failed to retrieve artist stats", details: err?.message },
      { status: 500 }
    );
  }
}
