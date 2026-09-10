import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";
import { verifyJwt } from "@/lib/jwt";

export const dynamic = "force-dynamic";

const PLAN_LIMITS = {
  free: 5,
  basic: 20,
  pro: 60,
  ultimate: Infinity,
};

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
        { error: true, message: "Email is required to check subscription." },
        { status: 401 }
      );
    }

    const db = await getDB();
    const user = (await db.collection("user").findOne({ email })) ||
                 (await db.collection("users").findOne({ email }));

    const plan = user?.plan || user?.subscription?.plan || "free";
    const limit = PLAN_LIMITS[plan] ?? 5;

    // Count artworks published by this artist
    const artworkCount = await db.collection("artworks").countDocuments({
      $or: [
        { artistEmail: email },
        { userEmail: email },
        { email },
      ],
    });

    const isUnlimited = limit === Infinity;
    const canUploadMore = isUnlimited || artworkCount < limit;

    return NextResponse.json({
      success: true,
      email,
      plan,
      artworkLimit: isUnlimited ? "Unlimited" : limit,
      limitNumber: limit,
      artworkCount,
      remainingSlots: isUnlimited ? "Unlimited" : Math.max(0, limit - artworkCount),
      canUploadMore,
      subscription: user?.subscription || {
        plan: "free",
        status: "active",
        price: 0,
      },
    });
  } catch (err) {
    console.error("[SUBSCRIPTION API GET ERROR]:", err);
    return NextResponse.json(
      { error: true, message: "Failed to fetch subscription", details: err?.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = getEmailFromRequest(req, body);

    if (!email) {
      return NextResponse.json(
        { error: true, message: "Authentication required to update subscription." },
        { status: 401 }
      );
    }

    const { plan, interval = "monthly" } = body;
    const validPlans = ["basic", "pro", "ultimate"];

    if (!validPlans.includes(plan?.toLowerCase())) {
      return NextResponse.json(
        { error: true, message: "Invalid plan selected. Choose basic, pro, or ultimate." },
        { status: 400 }
      );
    }

    const normalizedPlan = plan.toLowerCase();
    const priceMap = {
      basic: interval === "yearly" ? 8 * 12 : 10,
      pro: interval === "yearly" ? 16 * 12 : 20,
      ultimate: interval === "yearly" ? 40 * 12 : 50,
    };

    const db = await getDB();
    const subscriptionData = {
      plan: normalizedPlan,
      status: "active",
      interval,
      price: priceMap[normalizedPlan],
      activatedAt: new Date(),
      expiresAt: new Date(Date.now() + (interval === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000),
    };

    await db.collection("user").updateOne(
      { email },
      {
        $set: {
          plan: normalizedPlan,
          subscription: subscriptionData,
          updatedAt: new Date(),
        },
      }
    );

    await db.collection("users").updateOne(
      { email },
      {
        $set: {
          plan: normalizedPlan,
          subscription: subscriptionData,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${normalizedPlan.toUpperCase()} plan!`,
      plan: normalizedPlan,
      subscription: subscriptionData,
    });
  } catch (err) {
    console.error("[SUBSCRIPTION API POST ERROR]:", err);
    return NextResponse.json(
      { error: true, message: "Failed to update subscription", details: err?.message },
      { status: 500 }
    );
  }
}
