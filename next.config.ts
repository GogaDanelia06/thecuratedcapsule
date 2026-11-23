import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the admin be opened at 127.0.0.1 as well as localhost in development.
  allowedDevOrigins: ["127.0.0.1"],
  reactCompiler: true,
  // The original cover story moved into the article database.
  async redirects() {
    return [{ source: "/stories/:slug", destination: "/articles/:slug", permanent: true }];
  },
};

export default nextConfig;
