import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id || "").trim();
    const db = await getDB();

    let userDoc = null;
    if (ObjectId.isValid(decodedId)) {
      try {
        userDoc = await db.collection("user").findOne({ _id: new ObjectId(decodedId) });
      } catch {
        // Fallback to string queries
      }
    }
    if (!userDoc) {
      userDoc = await db.collection("user").findOne({
        $or: [
          { id: decodedId },
          { email: decodedId },
          { email: decodedId.toLowerCase() },
          { name: decodedId },
        ],
      });
    }

    if (!userDoc) {
      return NextResponse.json(
        { error: true, message: "Artist not found" },
        { status: 404 }
      );
    }

    delete userDoc.password;
    delete userDoc.hashedPassword;

    const artistStrId = userDoc._id.toString();
    const cleanName = (userDoc.name || "").trim();

    const artworkConditions = [
      { userId: artistStrId },
      { artistId: artistStrId },
      { userId: userDoc._id },
      { artistId: userDoc._id },
    ];
    if (userDoc.email) {
      artworkConditions.push(
        { artistEmail: userDoc.email },
        { artistEmail: userDoc.email.toLowerCase() },
        { userEmail: userDoc.email }
      );
    }
    if (cleanName) {
      artworkConditions.push({
        artistName: { $regex: new RegExp(`^${cleanName}$`, "i") },
      });
    }

    const artworks = await db
      .collection("artworks")
      .find({ $or: artworkConditions })
      .sort({ createdAt: -1 })
      .toArray();

    // Collect artist artwork IDs and titles to link orders
    const artworkIdList = artworks.map((a) => a._id.toString());
    const artworkTitleList = artworks.map((a) => a.title).filter(Boolean);

    const orderConditions = [
      { artistId: artistStrId },
      { "artwork.artistId": artistStrId },
    ];
    if (userDoc.email) {
      orderConditions.push(
        { artistEmail: userDoc.email },
        { artistEmail: userDoc.email.toLowerCase() },
        { "artwork.artistEmail": userDoc.email },
        { "artworkDetails.artistEmail": userDoc.email }
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

    const orders = await db
      .collection("orders")
      .find({ $or: orderConditions })
      .toArray();

    const totalSold = orders.length;
    const totalArtworks = artworks.length;
    const totalEarnings = orders.reduce(
      (sum, ord) => sum + Number(ord.amount || ord.price || 0),
      0
    );

    const serializedArtworks = artworks.map((art) => {
      const artStrId = art._id.toString();
      const artSales = orders.filter(
        (o) =>
          o.artworkId === artStrId ||
          (art.title && o.artworkTitle === art.title)
      ).length;
      const stock = typeof art.quantity === "number" ? art.quantity : 10;

      return {
        ...art,
        _id: artStrId,
        artistName: art.artistName || userDoc.name,
        quantity: stock,
        isSold: stock === 0,
        salesCount: artSales,
        createdAt: art.createdAt
          ? new Date(art.createdAt).toISOString()
          : new Date().toISOString(),
      };
    });

    return NextResponse.json({
      artist: {
        ...userDoc,
        _id: artistStrId,
        totalArtworks,
        totalSold,
        totalSales: totalSold,
        totalEarnings,
        totalRevenue: totalEarnings,
      },
      artworks: serializedArtworks,
    });
  } catch (err) {
    console.error("[API ROUTE ERROR] Artist profile error:", err.message);
    return NextResponse.json(
      { error: true, message: "Failed to fetch artist profile" },
      { status: 500 }
    );
  }
}
