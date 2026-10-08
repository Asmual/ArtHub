import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await getDB();

    let query: any = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    }

    const art: any = await db.collection("artworks").findOne(query);
    if (!art) {
      return NextResponse.json({ error: true, message: "Artwork not found" }, { status: 404 });
    }

    const isSold = Boolean(
      art.isSold === true ||
      art.status === "sold" ||
      art.status === "out_of_stock" ||
      (typeof art.quantity === "number" && art.quantity <= 0)
    );
    const stock = typeof art.quantity === "number" ? art.quantity : (isSold ? 0 : 1);
    return NextResponse.json({
      ...art,
      _id: art._id?.toString(),
      quantity: stock,
      isSold,
      status: isSold ? "sold" : (art.status || "available"),
    });
  } catch (err: any) {
    console.error("[ARTWORKS API ERROR] GET [id]:", err);
    return NextResponse.json(
      { error: true, message: "Failed to fetch artwork", details: err?.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const db = await getDB();

    let query: any = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    }

    const existing: any = await db.collection("artworks").findOne(query);
    if (!existing) {
      return NextResponse.json({ error: true, message: "Artwork not found" }, { status: 404 });
    }

    // Role & Ownership check
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: true, message: "Authentication required to edit artwork." }, { status: 401 });
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
          { error: true, message: "Forbidden: You are only allowed to edit your own artworks." },
          { status: 403 }
        );
      }
    }

    const updateDoc: any = { ...body, updatedAt: new Date() };
    delete updateDoc._id;

    if (typeof updateDoc.quantity === "number") {
      updateDoc.isSold = updateDoc.quantity === 0;
      updateDoc.status = updateDoc.isSold ? "sold" : "available";
    } else if (typeof updateDoc.isSold === "boolean") {
      if (updateDoc.isSold) {
        updateDoc.quantity = 0;
        updateDoc.status = "sold";
      } else {
        updateDoc.status = "available";
        if (existing.quantity === 0 || !existing.quantity) {
          updateDoc.quantity = 1;
        }
      }
    }

    const result = await db.collection("artworks").findOneAndUpdate(
      { _id: existing._id },
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    const updated: any = result && (result as any).value ? (result as any).value : result;
    return NextResponse.json({
      success: true,
      message: "Artwork updated successfully",
      artwork: updated ? { ...updated, _id: updated._id?.toString() } : null,
    });
  } catch (err: any) {
    console.error("[ARTWORKS API ERROR] PUT [id]:", err);
    return NextResponse.json(
      { error: true, message: "Failed to update artwork", details: err?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await getDB();

    let query: any = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    }

    const existing: any = await db.collection("artworks").findOne(query);
    if (!existing) {
      return NextResponse.json({ error: true, message: "Artwork not found" }, { status: 404 });
    }

    // Role & Ownership check
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: true, message: "Authentication required to delete artwork." }, { status: 401 });
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
          { error: true, message: "Forbidden: You are only allowed to delete your own artworks." },
          { status: 403 }
        );
      }
    }

    const result = await db.collection("artworks").deleteOne({ _id: existing._id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: true, message: "Artwork not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Artwork deleted successfully." });
  } catch (err: any) {
    console.error("[ARTWORKS API ERROR] DELETE [id]:", err);
    return NextResponse.json(
      { error: true, message: "Failed to delete artwork", details: err?.message },
      { status: 500 }
    );
  }
}
