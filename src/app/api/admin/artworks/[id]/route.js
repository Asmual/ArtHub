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
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    }

    const result = await db.collection("artworks").deleteOne(query);
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: true, message: "Artwork not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Artwork deleted successfully." });
  } catch (err) {
    console.error("[ADMIN API ERROR] artworks DELETE:", err);
    return NextResponse.json(
      { error: true, message: "Failed to delete artwork", details: err?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const db = await getDB();

    let query = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    }

    const updateDoc = { updatedAt: new Date() };
    if (typeof body.isVerified === "boolean") {
      updateDoc.isVerified = body.isVerified;
    }
    if (typeof body.isDraft === "boolean") {
      updateDoc.isDraft = body.isDraft;
    }

    const result = await db.collection("artworks").findOneAndUpdate(
      query,
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    const updated = result && result.value ? result.value : result;
    return NextResponse.json({
      success: true,
      data: updated ? { ...updated, _id: updated._id?.toString() } : null,
    });
  } catch (err) {
    console.error("[ADMIN API ERROR] artworks PATCH:", err);
    return NextResponse.json(
      { error: true, message: "Failed to update artwork", details: err?.message },
      { status: 500 }
    );
  }
}
