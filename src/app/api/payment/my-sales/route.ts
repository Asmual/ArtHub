import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";
import { verifyJwt } from "@/lib/jwt";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    let email = searchParams.get("email");
    let artistId = searchParams.get("artistId") || searchParams.get("id");

    if (!email) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const decoded = verifyJwt(authHeader.split(" ")[1]);
        if (decoded?.email) email = decoded.email;
        if (decoded?.id) artistId = decoded.id;
      }
    }

    if (!email && !artistId) {
      return NextResponse.json(
        { error: true, message: "Authorization token or email query required" },
        { status: 401 }
      );
    }

    const db = await getDB();
    const orderCollection = db.collection("orders");

    // Find artist user to get their ID and artworks if possible
    let userDoc = null;
    if (email) {
      userDoc = await db.collection("user").findOne({
        $or: [{ email: email.toLowerCase() }, { email }],
      });
    } else if (artistId && ObjectId.isValid(artistId)) {
      userDoc = await db.collection("user").findOne({
        _id: new ObjectId(artistId),
      });
    }

    const matchedEmails = new Set();
    if (email) {
      matchedEmails.add(email);
      matchedEmails.add(email.toLowerCase());
    }
    if (userDoc?.email) {
      matchedEmails.add(userDoc.email);
      matchedEmails.add(userDoc.email.toLowerCase());
    }

    const emailList = Array.from(matchedEmails);

    const userIds = new Set();
    if (artistId) userIds.add(artistId);
    if (userDoc?._id) {
      userIds.add(userDoc._id.toString());
    }

    // Collect all artwork IDs belonging to this artist
    const artworkConditions = [
      ...emailList.map((em) => ({ artistEmail: em })),
      ...emailList.map((em) => ({ userEmail: em })),
      ...Array.from(userIds).map((uid) => ({ userId: uid })),
      ...Array.from(userIds).map((uid) => ({ artistId: uid })),
    ];

    const artworkQuery = artworkConditions.length > 0 ? { $or: artworkConditions } : {};
    const artworks = await db.collection("artworks").find(artworkQuery).project({ _id: 1 }).toArray();
    const artworkIdList = artworks.map((a) => a._id.toString());

    const orderConditions = [
      ...emailList.map((em) => ({ artistEmail: em })),
      ...emailList.map((em) => ({ "artwork.artistEmail": em })),
      ...Array.from(userIds).map((uid) => ({ artistId: uid })),
      ...Array.from(userIds).map((uid) => ({ "artwork.artistId": uid })),
      ...artworkIdList.map((aid) => ({ artworkId: aid })),
    ];

    const orderQuery = orderConditions.length > 0 ? { $or: orderConditions } : { _id: null };

    const sales = await orderCollection
      .find(orderQuery)
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    const serialized = sales.map((sale) => ({
      ...sale,
      _id: sale._id?.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: serialized,
      sales: serialized,
    });
  } catch (err) {
    console.error("[PAYMENT API ERROR] my-sales GET:", err);
    return NextResponse.json(
      { error: true, message: "Failed to load sales records", details: err?.message },
      { status: 500 }
    );
  }
}
