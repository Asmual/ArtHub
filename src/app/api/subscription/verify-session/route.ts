import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { sessionId } = await req.json().catch(() => ({}));

    if (!sessionId) {
      return NextResponse.json(
        { error: true, message: "Stripe session ID is required." },
        { status: 400 }
      );
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: true, message: "Stripe secret key is not configured in server environment." },
        { status: 500 }
      );
    }
    const stripe = new Stripe(secretKey);

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: true, message: "Stripe session not found." },
        { status: 404 }
      );
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        {
          error: true,
          message: `Payment not completed. Status: ${session.payment_status}`,
        },
        { status: 400 }
      );
    }

    const { plan, interval, artistEmail, amount, artLimit } = session.metadata || {};

    if (!plan || !artistEmail) {
      return NextResponse.json(
        { error: true, message: "Invalid session metadata." },
        { status: 400 }
      );
    }

    const db = await getDB();
    const durationDays = interval === "yearly" ? 365 : 30;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const subscriptionRecord = {
      plan: plan.toLowerCase(),
      status: "active",
      interval: interval || "monthly",
      amount: Number(amount || 0),
      artLimit: artLimit || (plan === "ultimate" ? "Unlimited" : plan === "pro" ? 60 : 20),
      stripeSessionId: sessionId,
      stripePaymentIntent: session.payment_intent || null,
      customerEmail: artistEmail,
      activatedAt: now,
      expiresAt: expiresAt,
      updatedAt: now,
    };

    // Update user record in both user collections
    await db.collection("user").updateOne(
      { email: artistEmail },
      {
        $set: {
          role: "artist",
          plan: plan.toLowerCase(),
          subscription: subscriptionRecord,
          updatedAt: now,
        },
      }
    );

    await db.collection("users").updateOne(
      { email: artistEmail },
      {
        $set: {
          role: "artist",
          plan: plan.toLowerCase(),
          subscription: subscriptionRecord,
          updatedAt: now,
        },
      }
    );

    // Save transaction in subscriptions ledger for admin records
    await db.collection("subscriptions").insertOne({
      ...subscriptionRecord,
      createdAt: now,
    });

    return NextResponse.json({
      success: true,
      message: "Subscription verified and activated successfully.",
      plan: plan.toLowerCase(),
      subscription: subscriptionRecord,
    });
  } catch (err) {
    console.error("[VERIFY SESSION ERROR]:", err);
    return NextResponse.json(
      { error: true, message: err.message || "Failed to verify Stripe payment." },
      { status: 500 }
    );
  }
}
