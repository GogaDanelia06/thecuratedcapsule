export function requestOrigin(request: Request) {
  const url = new URL(request.url);
  if (
    process.env.NODE_ENV === "development" &&
    request.headers.get("host")?.split(":")[0] === "127.0.0.1"
  )
    url.hostname = "127.0.0.1";
  return url.origin;
}
export function sameOrigin(request: Request) {
  return request.headers.get("origin") === requestOrigin(request);
}
