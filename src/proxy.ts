import { NextResponse, type NextRequest } from "next/server";
import { requestAuthenticated } from "@/lib/admin-auth";

export function proxy(request: NextRequest) {
  // Keep the session on the same host used by Keystatic's local OAuth flow.
  if (
    process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github" &&
    request.headers.get("host")?.split(":")[0] === "localhost"
  ) {
    const url = request.nextUrl.clone();
    url.hostname = "127.0.0.1";
    return NextResponse.redirect(url);
  }
  const path = request.nextUrl.pathname;
  const publicLogin = path === "/admin/login" || path === "/admin/session";
  if (!publicLogin && !requestAuthenticated(request)) {
    if (path.startsWith("/api/"))
      return new NextResponse("Admin sign-in required.", { status: 401 });
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", path + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
export const config = { matcher: ["/admin/:path*", "/keystatic/:path*", "/api/keystatic/:path*"] };
