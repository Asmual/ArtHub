import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { role } = body;

    const allowedRoles = ["user", "artist", "admin"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: true, message: "Invalid role assigned." },
        { status: 400 }
      );
    }

    const db = await getDB();
    let query = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { id }] };
    }

    const result = await db.collection("user").findOneAndUpdate(
      query,
      { $set: { role, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    const updatedUser = result && result.value ? result.value : result;
    return NextResponse.json({
      success: true,
      data: updatedUser ? { ...updatedUser, _id: updatedUser._id?.toString() } : null,
    });
  } catch (err) {
    console.error("[ADMIN API ERROR] users role PATCH:", err);
    return NextResponse.json(
      { error: true, message: "Failed to update role", details: err?.message },
      { status: 500 }
    );
  }
}
