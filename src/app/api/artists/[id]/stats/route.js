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

    const artistStrId = artist?._id?.toString() || decodedId;
    const cleanName = (artist?.name || "").trim();

    const artworkConditions = [
      { userId: artistStrId },
      { artistId: artistStrId },
    ];
    if (artist?.email) {
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

    const artworks = await db.collection("artworks").find({ $or: artworkConditions }).toArray();
    const totalArtworks = artworks.length;
    const artworkIdList = artworks.map((a) => a._id.toString());
    const artworkTitleList = artworks.map((a) => a.title).filter(Boolean);

    // Calculate total earnings from real orders
    const orderConditions = [
      { artistId: artistStrId },
      { "artwork.artistId": artistStrId },
    ];
    if (artist?.email) {
      orderConditions.push(
        { artistEmail: artist.email },
        { artistEmail: artist.email.toLowerCase() },
        { "artwork.artistEmail": artist.email },
        { "artworkDetails.artistEmail": artist.email }
      );
    }
    if (cleanName) {
      orderConditions.push(
        { "artworkDetails.artistName": cleanName },
        { "artwork.artistName": cleanName }
      );
    }
    if (artworkIdList.length > 0) {
      orderConditions.push(
        { artworkId: { $in: artworkIdList } },
        { "artwork._id": { $in: artworkIdList } }
      );
    }
    if (artworkTitleList.length > 0) {
      orderConditions.push(
        { artworkTitle: { $in: artworkTitleList } }
      );
    }

    const orders = await db.collection("orders").find({ $or: orderConditions }).toArray();
    const totalEarnings = orders.reduce(
      (sum, ord) => sum + (Number(ord.amount || ord.price) || 0),
      0
    );

    return NextResponse.json({
      totalArtworks,
      totalEarnings,
      totalSales: orders.length,
      totalSold: orders.length,
    });
  } catch (err) {
    console.error("[ARTISTS API ERROR] stats GET:", err);
    return NextResponse.json(
      { error: true, message: "Failed to retrieve artist stats", details: err?.message },
      { status: 500 }
    );
  }
}
