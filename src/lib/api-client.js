
import { getAuthToken } from "@/lib/auth-utils";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://arthub-server-z4w8.onrender.com").replace(/\/$/, "");

export const fetchBackendToken = async (email) => {
  if (!email) return null;
  try {
    return await getAuthToken(email);
  } catch (err) {
    console.error("Token generation wrapper error:", err);
    return null;
  }
};

export const backendFetch = async (endpoint, options = {}, userEmail = null) => {
  const token = userEmail ? await fetchBackendToken(userEmail) : null;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 1. Try local Next.js internal API first
  try {
    const localUrl = userEmail
      ? `${endpoint}${endpoint.includes("?") ? "&" : "?"}email=${encodeURIComponent(userEmail)}`
      : endpoint;

    const localRes = await fetch(localUrl, {
      ...options,
      headers,
    });

    if (localRes.ok) {
      return localRes;
    }
  } catch (localErr) {
    console.warn("Local API route attempt skipped, trying backend gateway:", localErr?.message);
  }

  // 2. Fallback to external backend
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};