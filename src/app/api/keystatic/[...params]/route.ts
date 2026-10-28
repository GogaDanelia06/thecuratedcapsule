import { makeRouteHandler } from "@keystatic/next/route-handler";
import config, { usesGitHubStorage } from "../../../../../keystatic.config";

const notFound = () => new Response(null, { status: 404 });

// Local storage writes to disk, which a deployed site cannot do; keep the API
// closed there until GitHub storage is configured.
const enabled = usesGitHubStorage || process.env.NODE_ENV === "development";

export const { POST, GET } = enabled
  ? makeRouteHandler({ config })
  : { POST: notFound, GET: notFound };
