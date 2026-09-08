import { NextResponse } from "next/server";

// Middleware to safeguard dashboard routes
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // Check for active BetterAuth session token
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  // Redirect unauthenticated requests to login
  if (isDashboardRoute && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Route matching configuration
export const config = {
  matcher: [
    "/dashboard/:path*",
  ],
};
