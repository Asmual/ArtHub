import { getDB } from "@/lib/mongodb";
import { verifyJwt } from "@/lib/jwt";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

/**
 * Resolves the authenticated user from cookies or Authorization header
 */
export async function getAuthenticatedUser(req) {
  try {
    const db = await getDB();

    // 1. Check Authorization header (Bearer JWT)
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyJwt(token);
      if (decoded && decoded.email) {
        let userDoc = await db.collection("user").findOne({ email: decoded.email.toLowerCase() });
        if (!userDoc) {
          userDoc = await db.collection("users").findOne({ email: decoded.email.toLowerCase() });
        }
        if (userDoc) {
          return {
            id: userDoc._id.toString(),
            email: userDoc.email,
            role: userDoc.role || "user",
            name: userDoc.name || "",
          };
        }
        return {
          id: decoded.id || "",
          email: decoded.email,
          role: decoded.role || "user",
          name: decoded.name || "",
        };
      }
    }

    // 2. Check BetterAuth session token in cookies
    const sessionCookie =
      req.cookies.get("better-auth.session_token")?.value ||
      req.cookies.get("__Secure-better-auth.session_token")?.value;

    if (sessionCookie) {
      const sessionDoc = await db.collection("session").findOne({ token: sessionCookie });
      if (sessionDoc && new Date(sessionDoc.expiresAt) > new Date()) {
        const userId = sessionDoc.userId;
        let userDoc = null;
        try {
          userDoc = await db.collection("user").findOne({ _id: new ObjectId(userId) });
        } catch {
          userDoc = await db.collection("user").findOne({ _id: userId });
        }
        if (!userDoc) {
          try {
            userDoc = await db.collection("users").findOne({ _id: new ObjectId(userId) });
          } catch {
            userDoc = await db.collection("users").findOne({ _id: userId });
          }
        }
        if (userDoc) {
          return {
            id: userDoc._id.toString(),
            email: userDoc.email,
            role: userDoc.role || "user",
            name: userDoc.name || "",
          };
        }
      }
    }

    return null;
  } catch (err) {
    console.error("[API GUARD ERROR]:", err);
    return null;
  }
}

/**
 * Enforces admin-only access on Next.js API routes.
 * Returns { error: false, user } if authorized, or { error: true, response } if unauthorized.
 */
export async function requireAdmin(req) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return {
      error: true,
      response: NextResponse.json(
        { error: true, message: "Authentication required." },
        { status: 401 }
      ),
    };
  }
  if (user.role !== "admin") {
    return {
      error: true,
      response: NextResponse.json(
        { error: true, message: "Forbidden: Administrator privileges required." },
        { status: 403 }
      ),
    };
  }
  return { error: false, user };
}
