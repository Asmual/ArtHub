import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";
import { verifyJwt } from "@/lib/jwt";

export const dynamic = "force-dynamic";

function getEmailFromRequest(req, body = {}) {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = verifyJwt(token);
    if (decoded?.email) return decoded.email;
  }
  const { searchParams } = new URL(req.url);
  return searchParams.get("email") || body?.email || null;
}

export async function GET(req) {
  try {
    const email = getEmailFromRequest(req);
    if (!email) {
      return NextResponse.json(
        { error: true, message: "Authorization token or email query is required." },
        { status: 401 }
      );
    }

    const db = await getDB();
    let user = await db.collection("user").findOne(
      { email },
      { projection: { password: 0, hashedPassword: 0 } }
    );
    if (!user) {
      user = await db.collection("users").findOne(
        { email },
        { projection: { password: 0, hashedPassword: 0 } }
      );
    }

    if (!user) {
      return NextResponse.json({ error: true, message: "User profile not found." }, { status: 404 });
    }

    return NextResponse.json({
      ...user,
      _id: user._id?.toString(),
    });
  } catch (err) {
    console.error("[PROFILE API ERROR] GET:", err);
    return NextResponse.json(
      { error: true, message: "Failed to fetch profile.", details: err?.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = getEmailFromRequest(req, body);

    if (!email) {
      return NextResponse.json(
        { error: true, message: "Authorization token or email is required." },
        { status: 401 }
      );
    }

    const db = await getDB();
    const { name, image, bio, specialty, speciality, phone } = body;

    const updateFields = { updatedAt: new Date() };
    if (name !== undefined) updateFields.name = name;
    if (image !== undefined) updateFields.image = image;
    if (bio !== undefined) updateFields.bio = bio;
    if (phone !== undefined) updateFields.phone = phone;

    const finalSpecialty = specialty !== undefined ? specialty : speciality;
    if (finalSpecialty !== undefined) {
      updateFields.specialty = finalSpecialty;
      updateFields.speciality = finalSpecialty;
    }

    const result = await db.collection("user").updateOne(
      { email },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      await db.collection("users").updateOne(
        { email },
        { $set: updateFields }
      );
    }

    const updatedUser = await db.collection("user").findOne(
      { email },
      { projection: { password: 0, hashedPassword: 0 } }
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser ? { ...updatedUser, _id: updatedUser._id?.toString() } : null,
    });
  } catch (err) {
    console.error("[PROFILE API ERROR] PUT:", err);
    return NextResponse.json(
      { error: true, message: "Failed to update profile.", details: err?.message },
      { status: 500 }
    );
  }
}
