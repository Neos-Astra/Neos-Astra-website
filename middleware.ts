import { auth } from "./src/superadmin/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public login routes — redirect if already logged in
  if (pathname === "/superadmin/login" || pathname === "/admin/login") {
    if (session?.user) {
      const targetUrl = session.user.role === "SUPER_ADMIN" ? "/superadmin" : "/admin";
      return NextResponse.redirect(new URL(targetUrl, req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  // Require authentication for all /superadmin and /admin routes
  if (!session?.user) {
    const loginUrl = new URL("/superadmin/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Staff Admin attempting to access Super Admin manage-admins page
  if (pathname.startsWith("/superadmin/admins") && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/superadmin/:path*", "/admin/:path*"],
};

