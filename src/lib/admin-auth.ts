import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "capsule-admin";
export const SESSION_SECONDS = 60 * 60 * 24 * 7;
function signature(value: string) {
  return createHmac("sha256", process.env.ADMIN_PASSWORD || "")
    .update(value)
    .digest("hex");
}
function equal(a: string, b: string) {
  return timingSafeEqual(Buffer.from(signature(a)), Buffer.from(signature(b)));
}
export function credentialsValid(username: string, password: string) {
  const validUser = equal(username, process.env.ADMIN_USERNAME || "");
  const validPassword = equal(password, process.env.ADMIN_PASSWORD || "");
  return Boolean(
    process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && validUser && validPassword,
  );
}
export function createSession() {
  const payload = `${process.env.ADMIN_USERNAME}:${Date.now() + SESSION_SECONDS * 1000}`;
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${signature(encoded)}`;
}
export function sessionValid(token?: string) {
  if (!token || !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) return false;
  const [encoded, mac, extra] = token.split(".");
  if (!encoded || !mac || extra || !equal(mac, signature(encoded))) return false;
  const payload = Buffer.from(encoded, "base64url").toString();
  const separator = payload.lastIndexOf(":");
  return (
    payload.slice(0, separator) === process.env.ADMIN_USERNAME &&
    Number(payload.slice(separator + 1)) > Date.now()
  );
}
export function requestAuthenticated(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${ADMIN_COOKIE}=`))
    ?.slice(ADMIN_COOKIE.length + 1);
  return sessionValid(token);
}
export function adminAccess(request: Request): Response | null {
  return requestAuthenticated(request)
    ? null
    : new Response("Your admin session has expired. Please sign in again at /admin/login.", {
        status: 401,
        headers: { "Cache-Control": "private, no-store" },
      });
}
