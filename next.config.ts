import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: { "/api/learning/*": ["./private/learning-published/**/*"], "/annienexus": ["./data/macro/latest.json"] },
};

export default nextConfig;
