import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDB();
    const categories = await db
      .collection("artworks")
      .aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ])
      .toArray();

    const formatted = categories.map((cat) => ({
      _id: cat._id || "Other",
      count: cat.count,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("[ADMIN API ERROR] analytics/categories GET:", err);
    return NextResponse.json([], { status: 200 });
  }
}
