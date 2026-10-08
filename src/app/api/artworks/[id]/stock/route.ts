import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { delta, quantity } = body;

    const db = await getDB();
    let query: any = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    }

    const existing: any = await db.collection("artworks").findOne(query);
    if (!existing) {
      return NextResponse.json({ error: true, message: "Artwork not found" }, { status: 404 });
    }

    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: true, message: "Authentication required to update stock." }, { status: 401 });
    }

    if (authUser.role !== "admin") {
      const userEmail = authUser.email.toLowerCase();
      const userId = authUser.id;
      const isOwner = Boolean(
        (existing.userId && existing.userId.toString() === userId) ||
        (existing.artistId && existing.artistId.toString() === userId) ||
        (existing.artistEmail && existing.artistEmail.toLowerCase() === userEmail) ||
        (existing.userEmail && existing.userEmail.toLowerCase() === userEmail) ||
        (existing.email && existing.email.toLowerCase() === userEmail)
      );

      if (!isOwner) {
        return NextResponse.json(
          { error: true, message: "Forbidden: You are only allowed to update stock for your own artworks." },
          { status: 403 }
        );
      }
    }

    let newQuantity;
    if (typeof quantity === "number") {
      newQuantity = Math.max(0, quantity);
    } else if (typeof delta === "number") {
      const currentQty = typeof existing.quantity === "number" ? existing.quantity : (existing.isSold ? 0 : 10);
      newQuantity = Math.max(0, currentQty + delta);
    } else {
      return NextResponse.json(
        { error: true, message: "Quantity or delta must be provided." },
        { status: 400 }
      );
    }

    const isSold = newQuantity === 0;
    const status = isSold ? "sold" : "available";

    const result = await db.collection("artworks").findOneAndUpdate(
      { _id: existing._id },
      { $set: { quantity: newQuantity, isSold, status, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    const updated: any = result && (result as any).value ? (result as any).value : result;
    return NextResponse.json({
      success: true,
      data: updated ? { ...updated, _id: updated._id?.toString() } : null,
    });
  } catch (err: any) {
    console.error("[ARTWORKS API ERROR] stock PATCH:", err);
    return NextResponse.json(
      { error: true, message: "Failed to update stock", details: err?.message },
      { status: 500 }
    );
  }
}
