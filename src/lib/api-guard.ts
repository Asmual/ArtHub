import { getDB } from "@/lib/mongodb";
import { verifyJwt } from "@/lib/jwt";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

/**
 * Resolves the authenticated user from cookies or Authorization header
 */
export async function getAuthenticatedUser(req: NextRequest | Request): Promise<AuthenticatedUser | null> {
  try {
    const db = await getDB();

    // 1. Check Authorization header (Bearer JWT)
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyJwt(token);
      if (decoded && decoded.email) {
        let userDoc: any = await db.collection("user").findOne({ email: decoded.email.toLowerCase() });
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
    let sessionCookie: string | undefined;
    if ("cookies" in req && typeof (req as any).cookies?.get === "function") {
      sessionCookie =
        (req as NextRequest).cookies.get("better-auth.session_token")?.value ||
        (req as NextRequest).cookies.get("__Secure-better-auth.session_token")?.value;
    } else {
      const cookieHeader = req.headers.get("cookie") || "";
      const match =
        cookieHeader.match(/better-auth\.session_token=([^;]+)/) ||
        cookieHeader.match(/__Secure-better-auth\.session_token=([^;]+)/);
      sessionCookie = match ? match[1] : undefined;
    }

    if (sessionCookie) {
      const sessionDoc: any = await db.collection("session").findOne({ token: sessionCookie });
      if (sessionDoc && new Date(sessionDoc.expiresAt) > new Date()) {
        const userId = sessionDoc.userId;
        let userDoc: any = null;
        try {
          userDoc = await db.collection("user").findOne({ _id: new ObjectId(userId) });
        } catch {
          userDoc = await db.collection("user").findOne({ _id: userId } as any);
        }
        if (!userDoc) {
          try {
            userDoc = await db.collection("users").findOne({ _id: new ObjectId(userId) });
          } catch {
            userDoc = await db.collection("users").findOne({ _id: userId } as any);
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
export async function requireAdmin(
  req: NextRequest | Request
): Promise<
  | { error: false; user: AuthenticatedUser; response?: never }
  | { error: true; response: NextResponse; user?: never }
> {
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
