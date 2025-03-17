import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Add paths that should be accessible without authentication
const publicPaths = ["/login", "/register", "/", "/favicon.ico"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow public paths
  if (publicPaths.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = getSessionCookie(request, {
    cookieName: "session_token",
    cookiePrefix: "paper_ai",
    useSecureCookies: process.env.NODE_ENV === "production",
  });

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure paths that should be protected
export const config = {
  matcher: [
    "/userdashboard/:path*",
    "/room/:path*",
    "/api/room/:path*",
    "/api/user/:path*",
  ],
};
