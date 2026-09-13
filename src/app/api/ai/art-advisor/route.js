import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { messages = [], userPrompt = "" } = await req.json().catch(() => ({}));

    const activePrompt = userPrompt || (messages[messages.length - 1]?.content) || "Hello! Can you recommend some beautiful artworks for my home?";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: true, message: "Gemini API key is not configured in server environment." },
        { status: 500 }
      );
    }

    // Query active unsold artworks from MongoDB
    const db = await getDB();
    const availableArtworks = await db
      .collection("artworks")
      .find({ isSold: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(35)
      .toArray();

    const catalog = availableArtworks.map((a) => ({
      id: a._id?.toString(),
      title: a.title || "Untitled Masterpiece",
      price: Number(a.price || 0),
      category: a.category || "Painting",
      artistName: a.artistName || "Featured Artist",
      image: a.image || "",
      tags: Array.isArray(a.tags) ? a.tags : [],
      dominantColors: Array.isArray(a.dominantColors) ? a.dominantColors : [],
      description: a.description ? a.description.substring(0, 160) + "..." : "",
    }));

    const systemPrompt = `
You are "ArtHub AI Advisor" — an articulate, warm, and sophisticated fine-art curator and interior art consultant.
Your mission is to help art lovers, collectors, and homeowners find the ideal artwork from ArtHub's authentic collection based on room decor, wall colors, lighting, mood, theme, or budget.

CURRENT AVAILABLE ARTHUB GALLERY CATALOG:
${JSON.stringify(catalog, null, 2)}

CURATOR INSTRUCTIONS:
1. Speak warmly, eloquently, and informatively like a top gallery director.
2. Analyze the user's inquiry (e.g. wall color, living room, office, mood, budget, or art style).
3. Recommend 1 to 3 suitable artworks from the catalog above that match their vision or budget.
4. For each recommended piece, include a thoughtful "curatorNote" explaining WHY it harmonizes with their space (e.g., color contrast, mood synergy, stylistic balance).
5. If their budget or specific request isn't an exact match, recommend the closest creative alternatives and explain why they'd still look fantastic.
6. Only recommend artworks that exist in the provided catalog with valid IDs, images, and prices.

OUTPUT FORMAT (STRICT JSON):
{
  "reply": (string) Your conversational curator response (supports markdown for bolding and style),
  "recommendedArtworks": [
    {
      "id": (string matching id from catalog),
      "title": (string),
      "price": (number),
      "category": (string),
      "artistName": (string),
      "image": (string url),
      "curatorNote": (string explaining why this artwork fits their space/request)
    }
  ],
  "suggestedPrompts": [
    (array of 3 short clickable follow-up suggestions for the user)
  ]
}
`;

    // Format conversation history for Gemini
    const geminiContents = [
      {
        parts: [
          { text: systemPrompt },
          { text: `User Inquiry: ${activePrompt}` },
        ],
      },
    ];

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: geminiContents,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errData = await geminiRes.json().catch(() => ({}));
      console.error("[GEMINI ADVISOR ERROR]:", errData);
      return NextResponse.json(
        {
          error: true,
          message: errData?.error?.message || "Failed to generate curator recommendation.",
        },
        { status: geminiRes.status }
      );
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json(
        { error: true, message: "No response received from AI advisor." },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(rawText);

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (err) {
    console.error("[AI ART ADVISOR ROUTE ERROR]:", err);
    return NextResponse.json(
      { error: true, message: err.message || "Failed to process advisor request." },
      { status: 500 }
    );
  }
}
