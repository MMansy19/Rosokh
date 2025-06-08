import { NextRequest, NextResponse } from "next/server";

const LOCALES = ["en", "ar", "ru"];
const DEFAULT_LOCALE = "ar";

function isMissingLocale(pathname: string): boolean {
  // Check if the pathname already includes a locale
  if (
    LOCALES.some(
      (locale) =>
        pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
    )
  ) {
    return false;
  }
  // Exclude static files, API routes, and special files
  return (
    !pathname.match(
      /^\/(_next|favicon\.ico|api|public|images|pdfs|assets|pdf-worker|data|sw\.js|manifest\.json)\//,
    ) &&
    pathname !== "/sw.js" &&
    pathname !== "/manifest.json"
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);

  // If accessing root path, redirect to default locale
  if (pathname === "/") {
    const newUrl = new URL(`/${DEFAULT_LOCALE}`, request.url);
    return NextResponse.redirect(newUrl, { status: 307 });
  }

  if (!isMissingLocale(pathname)) {
    return NextResponse.next();
  }

  const locale = DEFAULT_LOCALE;
  const newUrl = new URL(`/${locale}${pathname}`, request.url);

  return NextResponse.redirect(newUrl, { status: 307 });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - images, pdfs, assets, pdf-worker, data (static assets)
     * - sw.js, manifest.json (service worker and manifest)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public|images|pdfs|assets|pdf-worker|data|sw.js|manifest.json).*)",
  ],
};
