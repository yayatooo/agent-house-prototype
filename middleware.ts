import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";
import type { UserRole } from "@/app/db/schema";

const { auth } = NextAuth(authConfig);

/**
 * Route access rules.
 * Key: path prefix | Value: roles that can access it (empty = any authenticated user)
 */
const ROLE_ROUTES: Record<string, UserRole[]> = {
  "/dashboard/admin": ["ADMINISTRATOR"],
  "/dashboard/office": ["ADMINISTRATOR", "OFFICE_ADMIN"],
  "/dashboard/owner": ["ADMINISTRATOR", "OFFICE_ADMIN", "PROPERTY_OWNER"],
  "/dashboard/sales": ["ADMINISTRATOR", "OFFICE_ADMIN", "SALES"],
  "/dashboard": [], // any authenticated user
};

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;

  // Public routes
  const isPublicRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname === "/";

  if (isPublicRoute) return;

  // Not logged in — redirect to login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return Response.redirect(loginUrl);
  }

  // Check role-based access
  const userRole = session.user.role;
  for (const [prefix, roles] of Object.entries(ROLE_ROUTES)) {
    if (nextUrl.pathname.startsWith(prefix)) {
      if (roles.length === 0) break; // any authenticated user allowed
      if (!roles.includes(userRole)) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      break;
    }
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
