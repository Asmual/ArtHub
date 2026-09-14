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
    const users = await db
      .collection("user")
      .find({}, { projection: { password: 0, hashedPassword: 0 } })
      .toArray();

    const serialized = users.map((u) => ({
      ...u,
      _id: u._id?.toString(),
    }));

    return NextResponse.json(serialized);
  } catch (err) {
    console.error("[ADMIN API ERROR] users GET:", err);
    return NextResponse.json(
      { error: true, message: "Failed to fetch users", details: err?.message },
      { status: 500 }
    );
  }
}
