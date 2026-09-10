import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";

// Cache route response for 60 seconds
export const revalidate = 60;

export async function GET() {
  try {
    const db = await getDB();
    const artworks = await db
      .collection("artworks")
      .aggregate([
        { $match: { isDraft: { $ne: true } } },
        { $sample: { size: 8 } },
      ])
      .toArray();

    const serialized = artworks.map((art) => ({
      ...art,
      _id: art._id.toString(),
      createdAt: art.createdAt
        ? new Date(art.createdAt).toISOString()
        : new Date().toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (err) {
    console.error("[API ROUTE ERROR] Featured artworks error:", err.message);
    return NextResponse.json([], { status: 500 });
  }
}
