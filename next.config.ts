import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the admin be opened at 127.0.0.1 as well as localhost in development.
  allowedDevOrigins: ["127.0.0.1"],
  reactCompiler: true,
};

export default nextConfig;
