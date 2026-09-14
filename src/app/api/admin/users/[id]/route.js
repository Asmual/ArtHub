import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { isBlocked, role, status } = body;

    const db = await getDB();
    let query = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { id }] };
    }

    const updateDoc = { updatedAt: new Date() };
    if (typeof isBlocked === "boolean") {
      updateDoc.isBlocked = isBlocked;
      updateDoc.status = isBlocked ? "blocked" : "active";
    }
    if (status) {
      updateDoc.status = status;
    }
    if (role) {
      updateDoc.role = role;
    }

    const result = await db.collection("user").findOneAndUpdate(
      query,
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    const updatedUser = result && result.value ? result.value : result;
    if (!updatedUser) {
      return NextResponse.json({ error: true, message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully.",
      user: { ...updatedUser, _id: updatedUser._id?.toString() },
    });
  } catch (err) {
    console.error("[ADMIN API ERROR] users PATCH:", err);
    return NextResponse.json(
      { error: true, message: "Failed to update user", details: err?.message },
      { status: 500 }
    );
  }
}

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
