import { NextRequest, NextResponse } from "next/server";

const LOCALES = ["en", "ar", "ru"];
const DEFAULT_LOCALE = "ar";

function isMissingLocale(pathname: string): boolean {
  // Extract the first segment of the path
  const pathParts = pathname.split("/").filter(Boolean);
  const firstSegment = pathParts[0];

  // If the first segment is a valid locale, return false
  if (LOCALES.includes(firstSegment)) {
    return false;
  }

  // List of paths to exclude from locale redirection
  const excludedPaths = [
    "/_next/",
    "/api/",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    "/images/",
    "/assets/",
    "/public/",
    "/data/",
    "/logo",
    "/sw.js",
    "/workbox-",
    "/manifest.json",
  ];

  return !excludedPaths.some((excluded) => pathname.startsWith(excluded));
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  console.log(`[Middleware] Processing: ${pathname}`);

  // Skip if locale is already present or path should be excluded
  if (!isMissingLocale(pathname)) {
    console.log(`[Middleware] Skipping: ${pathname}`);
    return NextResponse.next();
  }

  // Special case: if someone tries to access /[locale], redirect to default locale
  if (pathname.startsWith("/[locale]")) {
    const newPath = pathname.replace("/[locale]", `/${DEFAULT_LOCALE}`);
    console.log(`[Middleware] Redirecting dynamic segment to: ${newPath}`);
    return NextResponse.redirect(new URL(newPath + search, request.url));
  }

  // Construct new URL with default locale
  const newPath = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  console.log(`[Middleware] Redirecting to: ${newPath}`);

  return NextResponse.redirect(new URL(newPath + search, request.url), 307);
}

export const config = {
  matcher: [
    "/((?!_next/|api/|static/|favicon.ico|robots.txt|sitemap.xml|images/|assets/|public/|data/|logo|\\[locale\\]).*)",
  ],
};
