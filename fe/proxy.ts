import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/procurement",
  "/master",
  "/warehouse",
  "/executive-docket",
  "/tracking",
  "/audit",
  "/user-profile",
];

const AUTH_PREFIXES = ["/auth/login", "/auth/register", "/login"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Strip "/en" prefix if present from old internationalization routes
  if (pathname === "/en" || pathname === "/en/") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  if (pathname.startsWith("/en/")) {
    const strippedPath = pathname.replace(/^\/en/, "") || "/";
    return NextResponse.redirect(new URL(strippedPath, request.url));
  }

  // Check explicit logout or error params to prevent loop
  const isExplicitLogout =
    request.nextUrl.searchParams.has("logout") ||
    request.nextUrl.searchParams.has("force") ||
    request.nextUrl.searchParams.has("error");

  // Fast-path authentication check via NextAuth session cookies (synchronous, 0ms latency)
  // NEVER use c.name.includes("token") as that matches "next-auth.csrf-token" which is always set!
  const hasSessionToken = request.cookies
    .getAll()
    .some((c) => {
      const isSession =
        c.name === "next-auth.session-token" ||
        c.name === "__Secure-next-auth.session-token";
      const val = (c.value || "").trim();
      return isSession && val !== "" && val !== "undefined" && val !== "null";
    });

  const hasAccessToken = request.cookies
    .getAll()
    .some((c) => {
      const isAccess = c.name === "access_token";
      const val = (c.value || "").trim();
      return isAccess && val !== "" && val !== "undefined" && val !== "null";
    });

  let isAuthenticated = hasSessionToken;

  // If no session cookie was found, attempt NextAuth JWT token verification
  if (!isAuthenticated && !isExplicitLogout) {
    const secret =
      process.env.AUTH_SECRET ||
      process.env.NEXTAUTH_SECRET ||
      "44701d4cea71dda7a51cf998408533d1";
    try {
      const token = await getToken({ req: request, secret });
      isAuthenticated = Boolean(token);
    } catch (e) {
      // Fallback
    }
  }

  // Fallback to access_token only for protected pages if present
  if (!isAuthenticated && hasAccessToken && !isExplicitLogout) {
    isAuthenticated = true;
  }

  // If explicit logout on auth page, treat as unauthenticated
  if (isExplicitLogout) {
    isAuthenticated = false;
  }

  // Next.js RSC / prefetch requests: fast return if authenticated
  if (isAuthenticated && (request.nextUrl.searchParams.has("_rsc") || request.headers.get("rsc") === "1")) {
    return NextResponse.next();
  }

  // 2. Redirect root "/"
  if (pathname === "/" || pathname === "") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // 3. Protected routes: redirect to /auth/login if not logged in
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Auth pages: redirect to /dashboard ONLY if genuine NextAuth session token is verified
  const isAuthPage = AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isAuthPage) {
    if (hasSessionToken && !isExplicitLogout) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (isExplicitLogout) {
      // Clean up response cookies
      const res = NextResponse.next();
      res.cookies.delete("access_token");
      res.cookies.delete("token");
      res.cookies.delete("next-auth.session-token");
      res.cookies.delete("__Secure-next-auth.session-token");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (/api/...)
     * - _next/static, _next/image
     * - favicon.ico, ico.ico, logo.png
     * - static images, assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|ico.ico|logo.png|images|assets).*)",
  ],
};
