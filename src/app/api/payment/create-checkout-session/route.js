import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verifyJwt } from "@/lib/jwt";

export const dynamic = "force-dynamic";

const isValidStripeImageUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const urlRegex = /^https:\/\/[a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}\/.*\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i;
  return urlRegex.test(url) && !url.includes("localhost") && !url.includes("127.0.0.1");
};

function getEmailFromRequest(req, body = {}) {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = verifyJwt(token);
    if (decoded?.email) return decoded.email;
  }
  return body?.email?.trim() || null;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { artworkId, price, name, phone } = body;
    const userEmail = getEmailFromRequest(req, body);

    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: "Valid email is required to proceed with checkout." },
        { status: 400 }
      );
    }

    if (!artworkId || !ObjectId.isValid(artworkId)) {
      return NextResponse.json(
        { success: false, message: "Invalid artwork ID provided." },
        { status: 400 }
      );
    }

    const db = await getDB();
    const artworkCollection = db.collection("artworks");
    const artwork = await artworkCollection.findOne({ _id: new ObjectId(artworkId) });

    if (!artwork) {
      return NextResponse.json(
        { success: false, message: "Artwork not found in inventory." },
        { status: 404 }
      );
    }

    if (artwork.isSold) {
      return NextResponse.json(
        { success: false, message: "This artwork has already been sold." },
        { status: 400 }
      );
    }

    const artistEmail = (artwork.artistEmail || artwork.userEmail || "").trim().toLowerCase();
    if (userEmail.toLowerCase() === artistEmail) {
      return NextResponse.json(
        { success: false, message: "Artists cannot purchase their own artwork." },
        { status: 400 }
      );
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { success: false, message: "Stripe secret key is not configured in server environment." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(secretKey);

    const clientBaseUrl = (
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      process.env.CLIENT_URL ||
      "http://localhost:3000"
    ).replace(/\/$/, "");

    const productData = {
      name: artwork.title || "Original Artwork",
      description: artwork.category ? `Category: ${artwork.category}` : "Original ArtHub Piece",
    };

    if (artwork.image && isValidStripeImageUrl(artwork.image)) {
      productData.images = [artwork.image];
    }

    const sessionAmount = Math.round(Number(price || artwork.price) * 100);
    if (isNaN(sessionAmount) || sessionAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid artwork price amount." },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: productData,
            unit_amount: sessionAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${clientBaseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientBaseUrl}/checkout/cancel?artworkId=${artworkId}`,
      metadata: {
        artworkId: artworkId.toString(),
        buyerEmail: userEmail,
        buyerName: name?.trim() || "",
        buyerPhone: phone?.trim() || "",
        artworkTitle: artwork.title || "Original Artwork",
        artistEmail: artistEmail,
        price: String(price || artwork.price),
      },
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("[INTERNAL PAYMENT API ERROR] create-checkout-session:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
