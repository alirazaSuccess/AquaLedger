import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET
);

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only protect Admin pages
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("auth_token")?.value;

    // No login token
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Verify JWT
      const { payload } = await jwtVerify(token, secret);

      // Only ADMIN can access admin pages
      if (payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error("Admin middleware authentication error:", error);

      // Invalid or expired token
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};