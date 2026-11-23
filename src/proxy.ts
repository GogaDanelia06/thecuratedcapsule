import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { databaseConfigured, databaseConfig } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/api/keystatic"))
    return new NextResponse("This editor has been replaced.", { status: 410 });
  if (path.startsWith("/keystatic")) return NextResponse.redirect(new URL("/admin", request.url));
  let response = NextResponse.next({ request });
  const publicRoute = path === "/admin/login" || path === "/admin/session";
  const redirectLogin = () => {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", path + request.nextUrl.search);
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    redirect.headers.set("Cache-Control", "private, no-store");
    return redirect;
  };
  if (!databaseConfigured()) {
    if (!publicRoute) return redirectLogin();
  } else {
    const { url, key } = databaseConfig();
    const client = createServerClient(url, key, {
      cookieOptions: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (values) => {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!publicRoute && !user) return redirectLogin();
  }
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
export const config = { matcher: ["/admin/:path*", "/keystatic/:path*", "/api/keystatic/:path*"] };
