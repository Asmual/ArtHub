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

function getUserFromRequest(req) {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = verifyJwt(token);
    if (decoded) return decoded;
  }
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("userEmail") || searchParams.get("email");
  const role = searchParams.get("role");
  if (email) {
    return { email: email.trim(), role };
  }
  return null;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const artworkId = searchParams.get("artworkId");

    if (!artworkId) {
      return NextResponse.json({ error: true, message: "Missing artworkId parameter." }, { status: 400 });
    }

    const user = getUserFromRequest(req);
    if (!user || !user.email) {
      return NextResponse.json({
        canReview: false,
        reason: "unauthenticated",
        message: "Please sign in to submit a review.",
      });
    }

    const db = await getDB();
    const userEmailLower = user.email.toLowerCase().trim();

    // Fetch user doc to get accurate role
    const userDoc = await db.collection("user").findOne({ email: userEmailLower });
    const finalRole = (userDoc?.role || user.role || "user").toLowerCase();
    const resolvedUserId = userDoc?._id?.toString() || user.id;

    // 1. Role Restrictions
    if (finalRole === "admin") {
      return NextResponse.json({
        canReview: false,
        reason: "admin",
        message: "Admin accounts cannot post artwork reviews.",
      });
    }

    if (finalRole === "artist") {
      return NextResponse.json({
        canReview: false,
        reason: "artist",
        message: "Artists are not permitted to review artworks.",
      });
    }

    const artOid = toOid(artworkId);
    const artworkDoc = await db.collection("artworks").findOne({
      $or: [
        ...(artOid ? [{ _id: artOid }] : []),
        { _id: artworkId },
        { id: artworkId },
      ],
    });

    let hasPurchased = false;

    if (artworkDoc) {
      if (artworkDoc.buyerEmail && artworkDoc.buyerEmail.toLowerCase().trim() === userEmailLower) {
        hasPurchased = true;
      }
      if (artworkDoc.buyerId && resolvedUserId && artworkDoc.buyerId.toString() === resolvedUserId.toString()) {
        hasPurchased = true;
      }
    }

    if (!hasPurchased) {
      const verifiedOrder = await db.collection("orders").findOne({
        $and: [
          {
            $or: [
              ...(artOid ? [{ artworkId: artOid }, { "artworkDetails._id": artOid }] : []),
              { artworkId: artworkId.toString() },
              { "artworkDetails._id": artworkId.toString() },
            ],
          },
          {
            $or: [
              { buyerEmail: userEmailLower },
              ...(resolvedUserId ? [{ buyerId: resolvedUserId }, ...(artOid ? [{ buyerId: toOid(resolvedUserId) }] : [])] : []),
            ],
          },
          {
            status: { $in: ["paid", "completed", "success"] },
          },
        ],
      });

      if (verifiedOrder) {
        hasPurchased = true;
      }
    }

    if (!hasPurchased) {
      return NextResponse.json({
        canReview: false,
        reason: "not_purchased",
        message: "You must purchase this artwork to unlock review and rating submission.",
      });
    }

    return NextResponse.json({
      canReview: true,
      reason: "eligible",
      message: "You are eligible to review this artwork.",
    });
  } catch (err) {
    console.error("[REVIEWS ELIGIBILITY GET]:", err);
    return NextResponse.json({ error: true, message: err.message }, { status: 500 });
  }
}
