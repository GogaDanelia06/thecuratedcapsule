import { cookies } from "next/headers";
import { adminAccess } from "@/lib/admin-auth";
export async function GET(request: Request) {
  const denied = adminAccess(request);
  if (denied) return denied;
  const url = new URL(request.url);
  const path = url.searchParams.get("path") || "";
  if (
    !/^\/images\/articles\/[a-zA-Z0-9_./ -]+\.(png|jpe?g|webp|gif|avif)$/i.test(path) ||
    path.includes("..")
  )
    return new Response("Invalid image", { status: 400 });
  const token = (await cookies()).get("keystatic-gh-access-token")?.value;
  if (!token) return new Response("GitHub sign-in required", { status: 401 });
  const target = new URL(
    `https://api.github.com/repos/GogaDanelia06/thecuratedcapsule/contents/public${path.split("/").map(encodeURIComponent).join("/")}`,
  );
  target.searchParams.set("ref", url.searchParams.get("branch") || "main");
  const response = await fetch(target, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.raw+json" },
    cache: "no-store",
  });
  if (!response.ok)
    return new Response("Image unavailable", { status: response.status === 404 ? 404 : 502 });
  const ext = path.split(".").at(-1)!.toLowerCase();
  return new Response(response.body, {
    headers: {
      "Content-Type": `image/${ext === "jpg" ? "jpeg" : ext}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
