import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verifyJwt } from "@/lib/jwt";

export const dynamic = "force-dynamic";

const toOid = (id) => {
  try {
    return ObjectId.isValid(id) ? new ObjectId(id) : null;
  } catch {
    return null;
  }
};

function getUserFromRequest(req, body = {}) {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = verifyJwt(token);
    if (decoded) return decoded;
  }
  if (body.userEmail || body.email) {
    return {
      email: (body.userEmail || body.email).trim(),
      role: body.userRole || body.role,
      id: body.userId,
    };
  }
  return null;
}

async function canUserModifyReview(db, review, user) {
  if (!review || !user) return false;

  const userEmailLower = user.email ? user.email.toLowerCase().trim() : "";
  const userIdStr = user.id ? user.id.toString() : (user._id ? user._id.toString() : "");

  // Check admin role from token or user collection
  if (user.role === "admin") return true;
  if (userEmailLower) {
    const userDoc = await db.collection("user").findOne({ email: userEmailLower });
    if (userDoc && userDoc.role === "admin") return true;
  }

  // 1. Author of review
  if (review.userEmail && review.userEmail.toLowerCase().trim() === userEmailLower) {
    return true;
  }

  // 2. Artwork owner/creator
  if (review.artworkId) {
    const artOid = toOid(review.artworkId);
    const artwork = await db.collection("artworks").findOne({
      $or: [
        ...(artOid ? [{ _id: artOid }] : []),
        { _id: review.artworkId },
        { id: review.artworkId },
      ],
    });

    if (artwork) {
      if (artwork.artistEmail && artwork.artistEmail.toLowerCase().trim() === userEmailLower) return true;
      if (artwork.userEmail && artwork.userEmail.toLowerCase().trim() === userEmailLower) return true;
      if (artwork.email && artwork.email.toLowerCase().trim() === userEmailLower) return true;
      if (artwork.userId && artwork.userId.toString() === userIdStr) return true;
      if (artwork.artistId && artwork.artistId.toString() === userIdStr) return true;
    }
  }

  return false;
}

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const db = await getDB();
    const collection = db.collection("reviews");

    const oid = toOid(id);
    const query = oid ? { $or: [{ _id: oid }, { _id: id }] } : { _id: id };

    const review = await collection.findOne(query);
    if (!review) {
      return NextResponse.json({ error: true, message: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...review,
      _id: review._id.toString(),
      rating: typeof review.rating === "number" ? review.rating : 5,
    });
  } catch (err) {
    console.error("[REVIEWS API GET by ID]:", err);
    return NextResponse.json({ error: true, message: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const user = getUserFromRequest(req, body);

    if (!user || !user.email) {
      return NextResponse.json({ error: true, message: "Authentication required." }, { status: 401 });
    }

    const db = await getDB();
    const collection = db.collection("reviews");

    const oid = toOid(id);
    const query = oid ? { $or: [{ _id: oid }, { _id: id }] } : { _id: id };

    const existingReview = await collection.findOne(query);
    if (!existingReview) {
      return NextResponse.json({ error: true, message: "Review not found." }, { status: 404 });
    }

    const isAuthorized = await canUserModifyReview(db, existingReview, user);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: true, message: "Forbidden: You are not authorized to edit this review." },
        { status: 403 }
      );
    }

    const updatePayload = {
      updatedAt: new Date(),
    };
    if (body.text !== undefined && body.text.trim() !== "") {
      updatePayload.text = body.text.trim();
    }
    if (body.rating !== undefined) {
      updatePayload.rating = Math.max(1, Math.min(5, Number(body.rating) || 5));
    }

    await collection.updateOne({ _id: existingReview._id }, { $set: updatePayload });

    return NextResponse.json({
      success: true,
      message: "Review updated successfully.",
      data: {
        ...existingReview,
        ...updatePayload,
        _id: existingReview._id.toString(),
      },
    });
  } catch (err) {
    console.error("[REVIEWS API PUT]:", err);
    return NextResponse.json({ error: true, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const user = getUserFromRequest(req);

    if (!user || !user.email) {
      return NextResponse.json({ error: true, message: "Authentication required." }, { status: 401 });
    }

    const db = await getDB();
    const collection = db.collection("reviews");

    const oid = toOid(id);
    const query = oid ? { $or: [{ _id: oid }, { _id: id }] } : { _id: id };

    const existingReview = await collection.findOne(query);
    if (!existingReview) {
      return NextResponse.json({ error: true, message: "Review not found." }, { status: 404 });
    }

    const isAuthorized = await canUserModifyReview(db, existingReview, user);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: true, message: "Forbidden: You are not authorized to delete this review." },
        { status: 403 }
      );
    }

    await collection.deleteOne({ _id: existingReview._id });

    return NextResponse.json({ success: true, message: "Review deleted successfully." });
  } catch (err) {
    console.error("[REVIEWS API DELETE]:", err);
    return NextResponse.json({ error: true, message: err.message }, { status: 500 });
  }
}
