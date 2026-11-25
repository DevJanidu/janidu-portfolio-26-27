import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Small in-memory cache so repeated clicks on the same review return instantly.
const translationCache = new Map<string, string>();

export async function POST(request: Request) {
  let body: { text?: string; target?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const text = body.text?.trim() ?? "";
  const target = (body.target?.trim() || "en").slice(0, 5);

  if (!text || text.length > 2000) {
    return NextResponse.json(
      { error: "Text must be between 1 and 2000 characters." },
      { status: 400 }
    );
  }

  const cacheKey = `${target}::${text}`;
  const cached = translationCache.get(cacheKey);
  if (cached) {
    return NextResponse.json({ translatedText: cached });
  }

  try {
    // Use Google Translate's public GTX endpoint (auto-detects Sinhala, Spanish, etc. to English)
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.searchParams.set("client", "gtx");
    url.searchParams.set("sl", "auto");
    url.searchParams.set("tl", target);
    url.searchParams.set("dt", "t");
    url.searchParams.set("q", text);

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      throw new Error(`Translator responded with ${res.status}`);
    }

    const data: unknown = await res.json();
    if (!Array.isArray(data) || !Array.isArray(data[0])) {
      throw new Error("Unexpected translator response format.");
    }

    const translatedText = (data[0] as unknown[])
      .map((segment) => (Array.isArray(segment) ? String(segment[0] ?? "") : ""))
      .join("")
      .trim();

    if (!translatedText) {
      throw new Error("Empty translation returned.");
    }

    if (translationCache.size > 200) {
      translationCache.clear();
    }
    translationCache.set(cacheKey, translatedText);

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("Review translation failed:", error);
    return NextResponse.json(
      { error: "Could not translate right now. Please try again." },
      { status: 502 }
    );
  }
}
