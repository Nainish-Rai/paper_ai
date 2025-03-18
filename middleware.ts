import { NextResponse, type NextRequest } from "next/server";
import type { AuthSession } from "@/lib/auth/types";

// Add paths that should be accessible without authentication
const publicPaths = ["/login", "/register", "/", "/favicon.ico"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow public paths
  if (publicPaths.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("paper_ai_session_token");
  if (!sessionCookie) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", encodeURIComponent(request.url));
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // Verify session in protected API routes
    if (path.startsWith("/api/")) {
      // Add auth verification headers
      const response = NextResponse.next();
      response.headers.set("X-Auth-Token", sessionCookie.value);
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", encodeURIComponent(request.url));
    return NextResponse.redirect(redirectUrl);
  }
}

// Configure paths that should be protected
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/room/:path*",
    "/api/room/:path*",
    "/api/documents/:path*",
    "/api/auth/user",
  ],
};
