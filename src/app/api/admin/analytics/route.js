import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDB();

    const [totalUsers, totalArtists, totalArtworks, revenueData] = await Promise.all([
      db.collection("user").countDocuments({ role: { $in: ["user", "buyer"] } }).catch(() => 0),
      db.collection("user").countDocuments({ role: "artist" }).catch(() => 0),
      db.collection("artworks").countDocuments().catch(() => 0),
      db
        .collection("orders")
        .aggregate([
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$amount" },
              totalSales: { $sum: 1 },
            },
          },
        ])
        .toArray()
        .catch(() => []),
    ]);

    const analytics = revenueData[0] || {};

    return NextResponse.json({
      totalUsers,
      totalArtists,
      totalArtworks,
      totalRevenue: analytics.totalRevenue || 0,
      totalSales: analytics.totalSales || 0,
    });
  } catch (err) {
    console.error("[ADMIN API ERROR] analytics GET:", err);
    return NextResponse.json(
      { error: true, message: "Failed to compile analytics", details: err?.message },
      { status: 500 }
    );
  }
}
