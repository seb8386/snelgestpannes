import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // La configuration pour ignorer le linter se place dans un bloc séparé ou est gérée nativement
};

export default nextConfig;