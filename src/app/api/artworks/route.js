import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const db = await getDB();
    const filter = {};

    if (email) {
      filter.$or = [
        { artistEmail: email },
        { userEmail: email },
        { email },
      ];
    }

    if (category && category !== "all") {
      filter.category = { $regex: category, $options: "i" };
    }

    const totalArtworks = await db.collection("artworks").countDocuments(filter);
    const artworks = await db
      .collection("artworks")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const normalized = artworks.map((art) => {
      const stock = typeof art.quantity === "number" ? art.quantity : 10;
      return {
        ...art,
        _id: art._id?.toString(),
        quantity: stock,
        isSold: stock === 0,
      };
    });

    return NextResponse.json({
      success: true,
      artworks: normalized,
      totalArtworks,
      totalPages: Math.ceil(totalArtworks / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("[ARTWORKS API ERROR] GET:", err);
    return NextResponse.json(
      { error: true, message: "Failed to fetch artworks", details: err?.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const db = await getDB();

    const qty = typeof body.quantity === "number" ? body.quantity : 10;
    const doc = {
      ...body,
      quantity: qty,
      isSold: qty === 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("artworks").insertOne(doc);
    return NextResponse.json({
      success: true,
      message: "Artwork listed successfully",
      artwork: { ...doc, _id: result.insertedId.toString() },
    });
  } catch (err) {
    console.error("[ARTWORKS API ERROR] POST:", err);
    return NextResponse.json(
      { error: true, message: "Failed to create artwork", details: err?.message },
      { status: 500 }
    );
  }
}
