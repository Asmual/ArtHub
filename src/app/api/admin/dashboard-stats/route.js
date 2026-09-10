import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDB();

    const [totalUsers, verifiedArtworks, transactionsCount, revenueResult, recentSales] = await Promise.all([
      db.collection("user").countDocuments().catch(() => 0),
      db.collection("artworks").countDocuments().catch(() => 0),
      db.collection("orders").countDocuments().catch(() => 0),
      db
        .collection("orders")
        .aggregate([
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$amount" },
            },
          },
        ])
        .toArray()
        .catch(() => []),
      db
        .collection("orders")
        .find({})
        .sort({ date: -1, createdAt: -1 })
        .limit(5)
        .toArray()
        .catch(() => []),
    ]);

    const serializedSales = recentSales.map((sale) => ({
      ...sale,
      _id: sale._id?.toString(),
    }));

    return NextResponse.json({
      totalUsers,
      verifiedArtworks,
      transactionsCount,
      platformRevenue: revenueResult[0]?.totalRevenue || 0,
      recentSales: serializedSales,
    });
  } catch (err) {
    console.error("[ADMIN API ERROR] dashboard-stats:", err);
    return NextResponse.json(
      { error: true, message: "Failed to load dashboard statistics", details: err?.message },
      { status: 500 }
    );
  }
}
