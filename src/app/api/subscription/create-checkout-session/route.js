import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getDB } from "@/lib/mongodb";
import { verifyJwt } from "@/lib/jwt";

export const dynamic = "force-dynamic";


const PLAN_CONFIGS = {
  basic: {
    name: "ArtHub Basic Artist Plan",
    monthlyPrice: 10,
    yearlyPrice: 8 * 12, // $96 ($8/mo)
    artLimit: "Up to 20 Artworks",
    commission: "10% Platform Commission",
    description: "Upload up to 20 artworks, 10% platform fee, Full HD display, direct collector inquiries",
  },
  pro: {
    name: "ArtHub Pro Artist Plan",
    monthlyPrice: 20,
    yearlyPrice: 16 * 12, // $192 ($16/mo)
    artLimit: "Up to 60 Artworks",
    commission: "5% Platform Commission",
    description: "Upload up to 60 artworks, 5% platform fee, Verified Artist Badge, 2K display, priority placement",
  },
  ultimate: {
    name: "ArtHub Ultimate Studio Plan",
    monthlyPrice: 50,
    yearlyPrice: 40 * 12, // $480 ($40/mo)
    artLimit: "Unlimited Artworks",
    commission: "0% Platform Commission",
    description: "Unlimited artworks, 0% platform fee, Gold Master Badge, 4K display, 24/7 dedicated curator",
  },
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

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = getEmailFromRequest(req, body);

    if (!email) {
      return NextResponse.json(
        { error: true, message: "Please log in to proceed with subscription checkout." },
        { status: 401 }
      );
    }

    // Role check: Only Artists (and Admins) may purchase artist subscription packages
    const db = await getDB();
    const user = (await db.collection("user").findOne({ email })) ||
                 (await db.collection("users").findOne({ email }));

    if (user && user.role !== "artist" && user.role !== "admin") {
      return NextResponse.json(
        {
          error: true,
          requiresArtistUpgrade: true,
          message: "Subscription packages are exclusively for Artist accounts. Please upgrade your account to an Artist profile before purchasing.",
        },
        { status: 403 }
      );
    }

    const { plan, interval = "monthly", name = "", phone = "" } = body;
    const normalizedPlan = (plan || "").toLowerCase();
    const config = PLAN_CONFIGS[normalizedPlan];

    if (!config) {
      return NextResponse.json(
        { error: true, message: "Invalid subscription plan selected." },
        { status: 400 }
      );
    }

    const priceInDollars = interval === "yearly" ? config.yearlyPrice : config.monthlyPrice;
    const unitAmountCents = Math.round(priceInDollars * 100);

    const clientBaseUrl = (
      process.env.BETTER_AUTH_URL ||
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      "http://localhost:3000"
    ).replace(/\/$/, "");

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: true, message: "Stripe secret key is not configured in server environment." },
        { status: 500 }
      );
    }
    const stripe = new Stripe(secretKey);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${config.name} (${interval === "yearly" ? "Annual" : "Monthly"})`,
              description: config.description,
              images: [
                "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
              ],
            },
            unit_amount: unitAmountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${clientBaseUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientBaseUrl}/pricing/checkout?plan=${normalizedPlan}&interval=${interval}&canceled=true`,
      metadata: {
        type: "artist_subscription",
        plan: normalizedPlan,
        interval,
        artistEmail: email,
        artistName: name || "",
        artistPhone: phone || "",
        amount: String(priceInDollars),
        artLimit: config.artLimit,
      },
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    console.error("[SUBSCRIPTION CHECKOUT ERROR]:", err);
    return NextResponse.json(
      { error: true, message: err.message || "Failed to initiate Stripe subscription checkout." },
      { status: 500 }
    );
  }
}
