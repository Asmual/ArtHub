import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const db = await getDB();

    let query = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { id }] };
    }

    const result = await db.collection("user").deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: true, message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User deleted successfully." });
  } catch (err) {
    console.error("[ADMIN API ERROR] users DELETE:", err);
    return NextResponse.json(
      { error: true, message: "Failed to delete user", details: err?.message },
      { status: 500 }
    );
  }
}
