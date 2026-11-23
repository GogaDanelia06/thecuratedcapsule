import { createHash, timingSafeEqual } from "node:crypto";

function matches(actual: string, expected: string) {
  return timingSafeEqual(
    createHash("sha256").update(actual).digest(),
    createHash("sha256").update(expected).digest(),
  );
}

export function adminAccess(authorization: string | null): Response | null {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const headers = {
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": "noindex, nofollow",
  };

  // Fail closed in every environment, including local development.
  if (!username || !password) {
    return new Response("Admin access is not configured.", { status: 503, headers });
  }

  const token = authorization?.match(/^Basic ([A-Za-z0-9+/]+={0,2})$/i)?.[1];
  if (token) {
    const credentials = Buffer.from(token, "base64").toString("utf8");
    const separator = credentials.indexOf(":");
    if (separator >= 0) {
      const validUser = matches(credentials.slice(0, separator), username);
      const validPassword = matches(credentials.slice(separator + 1), password);
      if (validUser && validPassword) return null;
    }
  }

  return new Response("Admin sign-in required.", {
    status: 401,
    headers: {
      ...headers,
      "WWW-Authenticate": 'Basic realm="The Curated Capsule Admin", charset="UTF-8"',
    },
  });
}
