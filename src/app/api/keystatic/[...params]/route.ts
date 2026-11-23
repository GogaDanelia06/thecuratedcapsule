import { makeRouteHandler } from "@keystatic/next/route-handler";
import config, { usesGitHubStorage } from "../../../../../keystatic.config";
import { adminAccess } from "@/lib/admin-auth";

const notFound = () => new Response(null, { status: 404 });

// Local storage writes to disk, which a deployed site cannot do; keep the API
// closed there until GitHub storage is configured.
const enabled = usesGitHubStorage || process.env.NODE_ENV === "development";

const handlers = enabled
  ? makeRouteHandler({ config })
  : { POST: notFound, GET: notFound };

// Check at the write boundary as well as at the dashboard entrance.
export async function GET(request: Request) {
  return adminAccess(request.headers.get("authorization")) ?? handlers.GET(request);
}

export async function POST(request: Request) {
  return adminAccess(request.headers.get("authorization")) ?? handlers.POST(request);
}
