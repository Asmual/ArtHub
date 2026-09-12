import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const toOid = (id) => {
  try {
    return ObjectId.isValid(id) ? new ObjectId(id) : null;
  } catch {
    return null;
  }
};

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Missing sessionId parameter." },
        { status: 400 }
      );
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { success: false, message: "Stripe secret key not configured." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { success: false, message: "Payment has not been completed." },
        { status: 400 }
      );
    }

    const db = await getDB();
    const orderCollection = db.collection("orders");
    const userCollection = db.collection("user");
    const artworkCollection = db.collection("artworks");

    const existingOrder = await orderCollection.findOne({ transactionId: session.id });
    if (existingOrder) {
      return NextResponse.json({
        success: true,
        data: existingOrder,
        message: "Order already verified and registered.",
      });
    }

    const { artworkId, buyerId, buyerEmail, artistEmail, artworkTitle } = session.metadata || {};

    const artworkOid = toOid(artworkId);
    const artworkDoc = artworkOid
      ? await artworkCollection.findOne({ $or: [{ _id: artworkOid }, { _id: artworkId }] })
      : await artworkCollection.findOne({ _id: artworkId });

    const finalArtistEmail = (artistEmail || artworkDoc?.artistEmail || artworkDoc?.userEmail || "").trim().toLowerCase();
    const finalBuyerEmail = (buyerEmail || session.customer_email || "").trim().toLowerCase();
    const resolvedBuyerId = toOid(buyerId) || buyerId || null;

    const structuredOrderPayload = {
      transactionId: session.id,
      type: "purchase",
      artworkId: artworkDoc ? artworkDoc._id : (artworkOid || artworkId),
      artworkTitle: artworkTitle || artworkDoc?.title || "Original Artwork",
      artworkImage: artworkDoc?.image || "",
      artworkDetails: artworkDoc ? {
        _id: artworkDoc._id,
        title: artworkDoc.title,
        image: artworkDoc.image,
        price: artworkDoc.price,
        category: artworkDoc.category,
        artistName: artworkDoc.artistName || artworkDoc.artist?.name,
        artistEmail: finalArtistEmail,
      } : null,
      buyerId: resolvedBuyerId,
      buyerEmail: finalBuyerEmail,
      artistEmail: finalArtistEmail,
      amount: session.amount_total / 100,
      price: session.amount_total / 100,
      currency: session.currency || "usd",
      status: "paid",
      paymentMethod: session.payment_method_types?.[0] || "card",
      date: new Date(),
      createdAt: new Date(),
    };

    await orderCollection.insertOne(structuredOrderPayload);

    // Increment purchases count for buyer
    if (finalBuyerEmail) {
      await userCollection.updateOne(
        { email: finalBuyerEmail },
        { $inc: { purchasesCount: 1 } }
      );
    }

    // Decrement artwork quantity and mark as sold if zero
    if (artworkDoc) {
      const currentQty = typeof artworkDoc.quantity === "number" ? artworkDoc.quantity : 1;
      const newQty = Math.max(0, currentQty - 1);
      await artworkCollection.updateOne(
        { _id: artworkDoc._id },
        {
          $set: {
            quantity: newQty,
            isSold: newQty === 0,
            soldAt: new Date(),
            buyerEmail: finalBuyerEmail,
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: structuredOrderPayload,
      message: "Order successfully confirmed and artwork registered.",
    });
  } catch (error) {
    console.error("[INTERNAL PAYMENT API ERROR] verify-payment-sync:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Payment verification failed." },
      { status: 500 }
    );
  }
}
