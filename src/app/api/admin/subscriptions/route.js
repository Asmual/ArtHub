import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const PLAN_LIMITS = {
  free: 5,
  basic: 20,
  pro: 60,
  ultimate: Infinity,
};

export async function GET() {
  try {
    const db = await getDB();

    // Fetch all artists and users
    const users = await db
      .collection("user")
      .find({}, { projection: { password: 0, hashedPassword: 0 } })
      .toArray();

    // Get artwork counts for each user
    const artworks = await db.collection("artworks").find({}).toArray();
    const artworkCountMap = {};

    artworks.forEach((art) => {
      const email = art.artistEmail || art.userEmail || art.email;
      if (email) {
        artworkCountMap[email] = (artworkCountMap[email] || 0) + 1;
      }
    });

    const enriched = users.map((u) => {
      const plan = u.plan || u.subscription?.plan || "free";
      const limit = PLAN_LIMITS[plan] ?? 5;
      const artworkCount = artworkCountMap[u.email] || 0;

      return {
        _id: u._id?.toString(),
        name: u.name || "ArtHub User",
        email: u.email,
        role: u.role || "user",
        image: u.image,
        plan,
        artworkLimit: limit === Infinity ? "Unlimited" : limit,
        limitNumber: limit,
        artworkCount,
        status: u.subscription?.status || (plan === "free" ? "active" : "active"),
        subscription: u.subscription || null,
        createdAt: u.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      subscriptions: enriched,
    });
  } catch (err) {
    console.error("[ADMIN SUBSCRIPTIONS API GET ERROR]:", err);
    return NextResponse.json(
      { error: true, message: "Failed to fetch subscriptions", details: err?.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, plan, action, status } = body;

    if (!email) {
      return NextResponse.json(
        { error: true, message: "User email is required." },
        { status: 400 }
      );
    }

    const db = await getDB();
    const now = new Date();

    let targetPlan = plan ? plan.toLowerCase() : undefined;
    let targetStatus = status || "active";

    // Action-specific shortcuts
    if (action === "unsubscribe" || action === "cancel") {
      targetPlan = "free";
      targetStatus = "canceled";
    } else if (action === "suspend" || action === "block") {
      targetStatus = "suspended";
    } else if (action === "reactivate") {
      targetStatus = "active";
    }

    const updateDoc = {
      updatedAt: now,
    };

    if (targetPlan) {
      updateDoc.plan = targetPlan;
    }

    const currentSub = (await db.collection("user").findOne({ email }))?.subscription || {};
    updateDoc.subscription = {
      ...currentSub,
      plan: targetPlan || currentSub.plan || "free",
      status: targetStatus,
      updatedAt: now,
    };

    await db.collection("user").updateOne({ email }, { $set: updateDoc });
    await db.collection("users").updateOne({ email }, { $set: updateDoc });

    return NextResponse.json({
      success: true,
      message: "Subscription updated successfully.",
      email,
      plan: updateDoc.plan,
      status: targetStatus,
    });
  } catch (err) {
    console.error("[ADMIN SUBSCRIPTIONS API PUT ERROR]:", err);
    return NextResponse.json(
      { error: true, message: "Failed to update subscription", details: err?.message },
      { status: 500 }
    );
  }
}
