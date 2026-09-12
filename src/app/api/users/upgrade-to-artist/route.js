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

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = getEmailFromRequest(req, body);

    if (!email) {
      return NextResponse.json(
        { error: true, message: "User email or authorization token is required." },
        { status: 401 }
      );
    }

    const db = await getDB();
    const user = (await db.collection("user").findOne({ email })) ||
                 (await db.collection("users").findOne({ email }));

    if (!user) {
      return NextResponse.json(
        { error: true, message: "User account not found." },
        { status: 404 }
      );
    }

    const now = new Date();
    const updateData = {
      role: "artist",
      updatedAt: now,
    };

    // Initialize free tier if user has no subscription plan recorded
    if (!user.plan && !user.subscription?.plan) {
      updateData.plan = "free";
      updateData.subscription = {
        plan: "free",
        status: "active",
        interval: "free",
        amount: 0,
        artLimit: 5,
        activatedAt: now,
        updatedAt: now,
      };
    }

    await db.collection("user").updateOne({ email }, { $set: updateData });
    await db.collection("users").updateOne({ email }, { $set: updateData });

    const updatedUser = (await db.collection("user").findOne(
      { email },
      { projection: { password: 0, hashedPassword: 0 } }
    )) || (await db.collection("users").findOne(
      { email },
      { projection: { password: 0, hashedPassword: 0 } }
    ));

    return NextResponse.json({
      success: true,
      message: "Account successfully upgraded to Artist!",
      role: "artist",
      user: updatedUser,
    });
  } catch (err) {
    console.error("[UPGRADE TO ARTIST API ERROR]:", err);
    return NextResponse.json(
      { error: true, message: "Failed to upgrade account to artist.", details: err?.message },
      { status: 500 }
    );
  }
}
