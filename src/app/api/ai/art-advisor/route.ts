import { NextResponse } from "next/server";
import { getDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { messages = [], userPrompt = "" } = await req.json().catch(() => ({}));

    const activePrompt = userPrompt || (messages[messages.length - 1]?.content) || "Hello! Can you recommend some beautiful artworks for my home?";

    const apiKey = process.env.GEMINI_API_KEY;

    let catalog = [];
    try {
      const db = await getDB();
      const availableArtworks = await db
        .collection("artworks")
        .find({ isSold: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(35)
        .toArray();

      catalog = availableArtworks.map((a) => ({
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
    } catch (dbErr) {
      console.warn("[ADVISOR DB CATALOG WARN]:", dbErr.message);
    }

    if (apiKey) {
      const candidateModels = ["gemini-3.7-flash", "gemini-2.5-flash", "gemini-1.5-flash"];

      const systemPrompt = `
You are "ArtHub AI Advisor" — an articulate, warm, and sophisticated fine-art curator and interior art consultant.
Your mission is to help art lovers, collectors, and homeowners find the ideal artwork from ArtHub's authentic collection based on room decor, wall colors, lighting, mood, theme, or budget.

CURRENT AVAILABLE ARTHUB GALLERY CATALOG:
${JSON.stringify(catalog, null, 2)}

CURATOR INSTRUCTIONS:
1. Speak warmly, eloquently, and informatively like a top gallery director.
2. Analyze the user's inquiry (e.g. wall color, living room, office, mood, budget, or art style).
3. Recommend 1 to 3 suitable artworks from the catalog above that match their vision or budget.
4. For each recommended piece, include a thoughtful "curatorNote" explaining WHY it harmonizes with their space.
5. If their budget or specific request isn't an exact match, recommend the closest creative alternatives.
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

      for (const model of candidateModels) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          const geminiRes = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(10000),
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: systemPrompt },
                    { text: `User Inquiry: ${activePrompt}` },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.7,
              },
            }),
          });

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              const parsed = JSON.parse(rawText);
              return NextResponse.json({
                success: true,
                data: parsed,
                source: "gemini",
              });
            }
          }
        } catch (callErr) {
          console.warn(`[GEMINI ADVISOR ${model}]:`, callErr.message);
        }
      }
    }

    // Intelligent Fallback with real catalog items
    const lowerPrompt = activePrompt.toLowerCase();
    const matchedArtworks = catalog.filter((a) => {
      const text = `${a.title} ${a.category} ${a.tags.join(" ")} ${a.description}`.toLowerCase();
      return lowerPrompt.split(" ").some((w) => w.length > 3 && text.includes(w));
    });

    const selected = (matchedArtworks.length > 0 ? matchedArtworks : catalog).slice(0, 3);

    const fallbackAdvisor = {
      reply: `I have curated exquisite original pieces from our collection that harmonize beautifully with your inquiry. Each artwork offers distinct textural depth and visual storytelling that brings modern elegance to your interior space.`,
      recommendedArtworks: selected.map((a) => ({
        id: a.id,
        title: a.title,
        price: a.price,
        category: a.category,
        artistName: a.artistName,
        image: a.image,
        curatorNote: `Features wonderful emotional balance, nuanced composition, and an inviting color palette that complements your space.`,
      })),
      suggestedPrompts: [
        "Show me vibrant abstract paintings",
        "Artwork recommendations under $250",
        "Calming pieces for a modern bedroom"
      ],
    };

    return NextResponse.json({
      success: true,
      data: fallbackAdvisor,
      source: "curator-intelligence",
    });
  } catch (err) {
    console.error("[AI ART ADVISOR ROUTE ERROR]:", err);
    return NextResponse.json({
      success: true,
      data: {
        reply: "Welcome to ArtHub! I would love to help you discover authentic original artwork that matches your personal aesthetic and interior design.",
        recommendedArtworks: [],
        suggestedPrompts: [
          "Show me vibrant abstract paintings",
          "Artwork recommendations under $250",
          "Modern minimal art for living room"
        ],
      },
    });
  }
}
