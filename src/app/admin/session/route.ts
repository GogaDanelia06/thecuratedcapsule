import { NextResponse } from "next/server";
import { ADMIN_COOKIE, SESSION_SECONDS, createSession, credentialsValid } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const url = new URL(request.url);
  // Next normalizes loopback to localhost internally during development.
  if (
    process.env.NODE_ENV === "development" &&
    request.headers.get("host")?.split(":")[0] === "127.0.0.1"
  )
    url.hostname = "127.0.0.1";
  if (request.headers.get("origin") !== url.origin)
    return new Response("Invalid origin", { status: 403 });
  const form = await request.formData();
  const next = String(form.get("next") || "/keystatic");
  const destination =
    /^\/(keystatic|admin\/preview)(\/|\?|$)/.test(next) && !next.includes("\\")
      ? next
      : "/keystatic";
  if (form.get("action") === "logout") {
    const response = NextResponse.redirect(new URL("/admin/login", url), 303);
    response.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  }
  const configured = Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);
  if (
    !configured ||
    !credentialsValid(String(form.get("username") || ""), String(form.get("password") || ""))
  ) {
    // Slow repeated attempts without depending on process-local rate-limit state.
    await new Promise((resolve) => setTimeout(resolve, 700));
    const target = new URL("/admin/login", url);
    target.searchParams.set("error", configured ? "credentials" : "configuration");
    target.searchParams.set("next", destination);
    return NextResponse.redirect(target, 303);
  }
  const response = NextResponse.redirect(new URL(destination, url), 303);
  response.cookies.set(ADMIN_COOKIE, createSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return response;
}
