import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";
import { signJwt } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: true, message: "Email is required to generate token." },
        { status: 400 }
      );
    }

    const db = await getDB();
    // In BetterAuth or ArtHub MongoDB, the collection is named 'user'
    let user = await db.collection("user").findOne({ email });
    if (!user) {
      user = await db.collection("users").findOne({ email });
    }

    if (!user) {
      return NextResponse.json(
        { error: true, message: "User not found in application database." },
        { status: 404 }
      );
    }

    const role = user.role || "user";
    const token = signJwt({
      id: user._id?.toString() || user.id,
      email: user.email,
      role: role,
    });

    return NextResponse.json({
      success: true,
      token,
      role,
    });
  } catch (err) {
    console.error("[INTERNAL API ERROR] generate-token route:", err);
    return NextResponse.json(
      { error: true, message: "Internal token generation failed.", details: err?.message },
      { status: 500 }
    );
  }
}
