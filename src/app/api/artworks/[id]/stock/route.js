import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { delta, quantity } = body;

    const db = await getDB();
    let query = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    }

    const existing = await db.collection("artworks").findOne(query);
    if (!existing) {
      return NextResponse.json({ error: true, message: "Artwork not found" }, { status: 404 });
    }

    let newQuantity;
    if (typeof quantity === "number") {
      newQuantity = Math.max(0, quantity);
    } else if (typeof delta === "number") {
      const currentQty = typeof existing.quantity === "number" ? existing.quantity : 10;
      newQuantity = Math.max(0, currentQty + delta);
    } else {
      return NextResponse.json(
        { error: true, message: "Quantity or delta must be provided." },
        { status: 400 }
      );
    }

    const isSold = newQuantity === 0;

    const result = await db.collection("artworks").findOneAndUpdate(
      { _id: existing._id },
      { $set: { quantity: newQuantity, isSold, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    const updated = result && result.value ? result.value : result;
    return NextResponse.json({
      success: true,
      data: updated ? { ...updated, _id: updated._id?.toString() } : null,
    });
  } catch (err) {
    console.error("[ARTWORKS API ERROR] stock PATCH:", err);
    return NextResponse.json(
      { error: true, message: "Failed to update stock", details: err?.message },
      { status: 500 }
    );
  }
}
