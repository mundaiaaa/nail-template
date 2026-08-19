import { NextResponse, type NextRequest } from "next/server";

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "nailbook.tw";

// Rewrites {slug}.{PLATFORM_DOMAIN} requests to /s/{slug}/... internally.
// The root platform domain (and localhost, for local dev) pass through
// untouched so /admin, /login, /s/{slug} etc. keep working directly —
// matching the "path-based fallback locally" approach chosen for dev.
export function proxy(req: NextRequest) {
  const hostname = (req.headers.get("host") ?? "").split(":")[0];

  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const isPlatformRoot = hostname === PLATFORM_DOMAIN || hostname === `www.${PLATFORM_DOMAIN}`;

  if (isLocalhost || isPlatformRoot || !hostname) {
    return NextResponse.next();
  }

  if (hostname.endsWith(`.${PLATFORM_DOMAIN}`)) {
    const slug = hostname.slice(0, -(PLATFORM_DOMAIN.length + 1));
    if (slug && slug !== "www") {
      const url = req.nextUrl.clone();
      url.pathname = `/s/${slug}${req.nextUrl.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads/).*)"],
};
