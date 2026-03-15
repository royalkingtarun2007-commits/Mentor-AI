import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check cookie (set by backend) OR skip and let client handle auth
  const token = request.cookies.get("accessToken") || 
                request.cookies.get("access_token");

  if (!token) {
    // Don't redirect — let the page handle auth check client-side
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/notes/:path*", "/chat/:path*"],
};