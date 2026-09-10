import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const db = await getDB();

    let query = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    }

    const art = await db.collection("artworks").findOne(query);
    if (!art) {
      return NextResponse.json({ error: true, message: "Artwork not found" }, { status: 404 });
    }

    const stock = typeof art.quantity === "number" ? art.quantity : 10;
    return NextResponse.json({
      ...art,
      _id: art._id?.toString(),
      quantity: stock,
      isSold: stock === 0,
    });
  } catch (err) {
    console.error("[ARTWORKS API ERROR] GET [id]:", err);
    return NextResponse.json(
      { error: true, message: "Failed to fetch artwork", details: err?.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const db = await getDB();

    let query = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    }

    const existing = await db.collection("artworks").findOne(query);
    if (!existing) {
      return NextResponse.json({ error: true, message: "Artwork not found" }, { status: 404 });
    }

    const updateDoc = { ...body, updatedAt: new Date() };
    delete updateDoc._id;

    if (typeof updateDoc.quantity === "number") {
      updateDoc.isSold = updateDoc.quantity === 0;
    }

    const result = await db.collection("artworks").findOneAndUpdate(
      { _id: existing._id },
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    const updated = result && result.value ? result.value : result;
    return NextResponse.json({
      success: true,
      message: "Artwork updated successfully",
      artwork: updated ? { ...updated, _id: updated._id?.toString() } : null,
    });
  } catch (err) {
    console.error("[ARTWORKS API ERROR] PUT [id]:", err);
    return NextResponse.json(
      { error: true, message: "Failed to update artwork", details: err?.message },
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
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    }

    const result = await db.collection("artworks").deleteOne(query);
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: true, message: "Artwork not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Artwork deleted successfully." });
  } catch (err) {
    console.error("[ARTWORKS API ERROR] DELETE [id]:", err);
    return NextResponse.json(
      { error: true, message: "Failed to delete artwork", details: err?.message },
      { status: 500 }
    );
  }
}
