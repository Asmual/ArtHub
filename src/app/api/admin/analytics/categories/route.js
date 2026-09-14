import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const authCheck = await requireAdmin(req);
    if (authCheck.error) {
      return authCheck.response;
    }

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
