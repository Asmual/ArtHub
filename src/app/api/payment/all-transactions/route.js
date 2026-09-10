import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDB();
    const orders = await db
      .collection("orders")
      .find({})
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    const serialized = orders.map((ord) => ({
      ...ord,
      _id: ord._id?.toString(),
    }));

    return NextResponse.json(serialized);
  } catch (err) {
    console.error("[PAYMENT API ERROR] all-transactions GET:", err);
    return NextResponse.json(
      { error: true, message: "Failed to fetch transactions", details: err?.message },
      { status: 500 }
    );
  }
}
