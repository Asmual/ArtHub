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
    if (decoded && decoded.email) return decoded;
  }
  const email = body.userEmail ? body.userEmail.trim() : (body.email ? body.email.trim() : null);
  if (email) {
    return { email, role: body.userRole || body.role, id: body.userId };
  }
  return null;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const artworkId = searchParams.get("artworkId");

    const db = await getDB();
    const collection = db.collection("reviews");

    const filter = {};
    if (artworkId) {
      const oid = toOid(artworkId);
      filter.$or = oid ? [{ artworkId }, { artworkId: oid }] : [{ artworkId }];
    }

    const reviews = await collection.find(filter).sort({ createdAt: -1 }).toArray();

    const normalized = reviews.map((r) => ({
      ...r,
      _id: r._id.toString(),
      rating: typeof r.rating === "number" ? r.rating : 5,
      images: Array.isArray(r.images) ? r.images : [],
    }));

    return NextResponse.json(normalized);
  } catch (err) {
    console.error("[REVIEWS API GET]:", err);
    return NextResponse.json({ error: true, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { artworkId, text, rating, userName, userImage, images } = body;
    const user = getUserFromRequest(req, body);

    if (!artworkId || !text || !text.trim()) {
      return NextResponse.json(
        { error: true, message: "Artwork ID and review text are required." },
        { status: 400 }
      );
    }

    if (!user || !user.email) {
      return NextResponse.json(
        { error: true, message: "Authentication required to post review." },
        { status: 401 }
      );
    }

    const db = await getDB();
    const userCollection = db.collection("user");
    const commentCollection = db.collection("reviews");
    const userEmailLower = user.email.toLowerCase().trim();

    // Check actual role from DB
    const userDoc = await userCollection.findOne({ email: userEmailLower });
    const finalRole = (userDoc?.role || user.role || "user").toLowerCase();
    const resolvedUserId = userDoc?._id?.toString() || user.id;

    if (finalRole === "admin") {
      return NextResponse.json(
        { error: true, message: "Admin accounts cannot post artwork reviews." },
        { status: 403 }
      );
    }

    if (finalRole === "artist") {
      return NextResponse.json(
        { error: true, message: "Artists are not permitted to review artworks." },
        { status: 403 }
      );
    }

    // Purchase verification
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
      return NextResponse.json(
        { error: true, message: "Only verified buyers who purchased this artwork can leave a review." },
        { status: 403 }
      );
    }

    let finalName = userName;
    let finalImage = userImage;

    if (!finalName || !finalImage) {
      if (userDoc) {
        finalName = finalName || userDoc.name;
        finalImage = finalImage || userDoc.image;
      }
    }

    const parsedRating = Math.max(1, Math.min(5, Number(rating) || 5));

    const validImages = Array.isArray(images)
      ? images.filter((img) => typeof img === "string" && img.trim() !== "").slice(0, 3)
      : [];

    const doc = {
      artworkId: artworkId.toString(),
      userEmail: userEmailLower,
      userName: finalName || "Verified Collector",
      userImage: finalImage || "",
      rating: parsedRating,
      text: text.trim(),
      images: validImages,
      isVerifiedBuyer: true,
      createdAt: new Date(),
    };

    const result = await commentCollection.insertOne(doc);

    return NextResponse.json(
      { success: true, ...doc, _id: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (err) {
    console.error("[REVIEWS API POST]:", err);
    return NextResponse.json({ error: true, message: err.message }, { status: 500 });
  }
}
