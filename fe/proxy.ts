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

  // Check authentication via NextAuth token and session cookies
  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "44701d4cea71dda7a51cf998408533d1";

  let token = null;
  try {
    token = await getToken({ req: request, secret });
  } catch (e) {
    // Edge runtime fallback
  }

  const sessionCookie =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value ||
    request.cookies.get("access_token")?.value;

  const isAuthenticated = Boolean(token || sessionCookie);

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

  // 4. Auth pages: redirect to /dashboard if already logged in
  const isAuthPage = AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
