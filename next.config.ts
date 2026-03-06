import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "logo.clearbit.com" },
      { hostname: "avatars.githubusercontent.com" },
      { hostname: "lh3.googleusercontent.com" },
    ],
  },
  serverExternalPackages: ["pdf-parse", "@react-pdf/renderer"],
};

export default nextConfig;
