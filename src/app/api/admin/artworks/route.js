import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDB();
    const artworks = await db
      .collection("artworks")
      .find({})
      .sort({ createdAt: -1 })
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

    return NextResponse.json(normalized);
  } catch (err) {
    console.error("[ADMIN API ERROR] artworks GET:", err);
    return NextResponse.json(
      { error: true, message: "Failed to fetch artworks", details: err?.message },
      { status: 500 }
    );
  }
}
