import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";
import { verifyJwt } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    let email = searchParams.get("email");

    if (!email) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const decoded = verifyJwt(authHeader.split(" ")[1]);
        if (decoded?.email) email = decoded.email;
      }
    }

    if (!email) {
      return NextResponse.json(
        { error: true, message: "Authorization token or email query required" },
        { status: 401 }
      );
    }

    const db = await getDB();
    const orders = await db
      .collection("orders")
      .find({
        $or: [
          { buyerEmail: email.toLowerCase() },
          { buyerEmail: email },
        ],
      })
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    const serialized = orders.map((ord) => ({
      ...ord,
      _id: ord._id?.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: serialized,
      orders: serialized,
    });
  } catch (err) {
    console.error("[PAYMENT API ERROR] my-orders GET:", err);
    return NextResponse.json(
      { error: true, message: "Failed to load orders", details: err?.message },
      { status: 500 }
    );
  }
}
