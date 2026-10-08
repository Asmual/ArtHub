import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const escapeRegex = (string) => {
  return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (
      searchParams.get("query") ||
      searchParams.get("q") ||
      searchParams.get("search") ||
      ""
    ).trim();

    if (!query || query === "undefined" || query === "null") {
      return NextResponse.json([]);
    }

    const db = await getDB();
    const sanitizedQuery = escapeRegex(query);
    const regex = new RegExp(sanitizedQuery, "i");

    // Match artist users from user collection
    const matchingArtists = await db
      .collection("user")
      .find(
        { $or: [{ name: regex }, { email: regex }] },
        { projection: { _id: 1, name: 1, email: 1 } }
      )
      .toArray();

    const matchedArtistIds = matchingArtists.map((a) => a._id.toString());
    const matchedArtistOids = matchingArtists.map((a) => a._id);
    const matchedArtistEmails = matchingArtists.map((a) => a.email).filter(Boolean);

    const filter = {
      isDraft: { $ne: true },
      $or: [
        { title: regex },
        { artistName: regex },
        { category: regex },
        ...(matchedArtistIds.length > 0
          ? [
              { userId: { $in: [...matchedArtistIds, ...matchedArtistOids] } },
              { artistId: { $in: [...matchedArtistIds, ...matchedArtistOids] } },
            ]
          : []),
        ...(matchedArtistEmails.length > 0
          ? [
              { artistEmail: { $in: matchedArtistEmails } },
              { userEmail: { $in: matchedArtistEmails } },
            ]
          : []),
      ],
    };

    const artworks = await db
      .collection("artworks")
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const artistNameMap = new Map();
    matchingArtists.forEach((a) => {
      artistNameMap.set(a._id.toString(), a.name);
      if (a.email) artistNameMap.set(a.email.toLowerCase(), a.name);
    });

    const serialized = artworks.map((art) => ({
      ...art,
      _id: art._id.toString(),
      artistName:
        art.artistName ||
        (art.userId && artistNameMap.get(art.userId.toString())) ||
        (art.artistEmail && artistNameMap.get(art.artistEmail.toLowerCase())) ||
        (art.userEmail && artistNameMap.get(art.userEmail.toLowerCase())) ||
        "Original Artist",
      createdAt: art.createdAt
        ? new Date(art.createdAt).toISOString()
        : new Date().toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (err) {
    console.error("[API ROUTE ERROR] Artwork search error:", err.message);
    return NextResponse.json([], { status: 500 });
  }
}
