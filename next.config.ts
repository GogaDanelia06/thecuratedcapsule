import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keystatic uses the loopback address for its local GitHub OAuth flow.
  allowedDevOrigins: ["127.0.0.1"],
  reactCompiler: true,
};

export default nextConfig;
