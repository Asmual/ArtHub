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
    const artworks = await db
      .collection("artworks")
      .find({
        $or: [
          { userId: artistStrId },
          { artistId: artistStrId },
          { userId: userDoc._id },
          { artistId: userDoc._id },
          { artistEmail: userDoc.email },
          { userEmail: userDoc.email },
        ],
      })
      .toArray();

    const totalSold = artworks.filter((a) => a.isSold === true).length;
    const totalArtworks = artworks.length;
    const totalEarnings = artworks
      .filter((a) => a.isSold === true)
      .reduce((sum, a) => sum + Number(a.price || 0), 0);

    const serializedArtworks = artworks.map((art) => ({
      ...art,
      _id: art._id.toString(),
      artistName: art.artistName || userDoc.name,
      createdAt: art.createdAt
        ? new Date(art.createdAt).toISOString()
        : new Date().toISOString(),
    }));

    return NextResponse.json({
      artist: {
        ...userDoc,
        _id: artistStrId,
        totalArtworks,
        totalSold: userDoc.totalSold ?? totalSold,
        totalEarnings,
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
