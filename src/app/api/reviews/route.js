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

function getEmailFromRequest(req, body = {}) {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = verifyJwt(token);
    if (decoded && decoded.email) return decoded.email;
  }
  return body.userEmail ? body.userEmail.trim() : (body.email ? body.email.trim() : null);
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
    const { artworkId, text, rating, userName, userImage } = body;
    const userEmail = getEmailFromRequest(req, body);

    if (!artworkId || !text || !text.trim()) {
      return NextResponse.json(
        { error: true, message: "Artwork ID and review text are required." },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: true, message: "Authentication required to post review." },
        { status: 401 }
      );
    }

    const db = await getDB();
    const userCollection = db.collection("user");
    const commentCollection = db.collection("reviews");

    let finalName = userName;
    let finalImage = userImage;

    if (!finalName || !finalImage) {
      const userDoc = await userCollection.findOne({ email: userEmail });
      if (userDoc) {
        finalName = finalName || userDoc.name;
        finalImage = finalImage || userDoc.image;
      }
    }

    const parsedRating = Math.max(1, Math.min(5, Number(rating) || 5));

    const doc = {
      artworkId: artworkId.toString(),
      userEmail,
      userName: finalName || "Art Collector",
      userImage: finalImage || "",
      rating: parsedRating,
      text: text.trim(),
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
