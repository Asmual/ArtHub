/**
 * In-memory token cache to prevent redundant fetches across components
 */
let cachedToken = null;
let cachedEmail = null;
let tokenExpiry = 0;

/**
 * Resilient helper to obtain an active JWT authorization token.
 * Supports both getAuthToken(email) and getAuthToken(base, email).
 * 1. Checks memory cache.
 * 2. Attempts local Next.js internal API (/api/users/generate-token) which is instant and immune to cold starts.
 * 3. Falls back to external Express backend if needed.
 */
export async function getAuthToken(arg1, arg2) {
  const email = (typeof arg2 === "string" && arg2.includes("@")) ? arg2 : arg1;
  if (!email) {
    throw new Error("Authentication token generation requires a valid email.");
  }

  const now = Date.now();
  // Return cached token if valid for at least 60 more seconds
  if (cachedToken && cachedEmail === email && tokenExpiry > now + 60000) {
    return cachedToken;
  }

  // 1. Try local Next.js internal API first
  try {
    const res = await fetch("/api/users/generate-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.token) {
        cachedToken = data.token;
        cachedEmail = email;
        tokenExpiry = now + 6 * 60 * 60 * 1000; // 6 hours
        return data.token;
      }
    }
  } catch (internalErr) {
    console.warn("[AUTH] Internal token route warning, falling back to external server:", internalErr?.message);
  }

  // 2. Fallback to external backend endpoint
  const base = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/api/users/generate-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.token) {
        cachedToken = data.token;
        cachedEmail = email;
        tokenExpiry = now + 6 * 60 * 60 * 1000;
        return data.token;
      }
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.message || `Token generation failed with HTTP ${res.status}`);
  } catch (externalErr) {
    console.error("[AUTH] External token generation error:", externalErr);
    throw externalErr;
  }
}
