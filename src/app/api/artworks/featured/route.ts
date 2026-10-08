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

    const serialized = artworks.map((art) => {
      const isSold = Boolean(
        art.isSold === true ||
        art.status === "sold" ||
        art.status === "out_of_stock" ||
        (typeof art.quantity === "number" && art.quantity <= 0)
      );
      const stock = typeof art.quantity === "number" ? art.quantity : (isSold ? 0 : 1);
      return {
        ...art,
        _id: art._id.toString(),
        quantity: stock,
        isSold,
        status: isSold ? "sold" : (art.status || "available"),
        createdAt: art.createdAt
          ? new Date(art.createdAt).toISOString()
          : new Date().toISOString(),
      };
    });

    return NextResponse.json(serialized);
  } catch (err) {
    console.error("[API ROUTE ERROR] Featured artworks error:", err.message);
    return NextResponse.json([], { status: 500 });
  }
}
