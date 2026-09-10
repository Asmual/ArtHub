import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDB();
    const salesChart = await db
      .collection("orders")
      .aggregate([
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: { $ifNull: ["$date", "$createdAt", new Date()] },
              },
            },
            revenue: { $sum: "$amount" },
            sales: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 14 },
      ])
      .toArray();

    return NextResponse.json(salesChart);
  } catch (err) {
    console.error("[ADMIN API ERROR] sales-chart GET:", err);
    return NextResponse.json([], { status: 200 });
  }
}
