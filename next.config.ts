import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/acquisition/vehicle/inventory/:listingId",
        destination: "/inventory/:listingId",
        permanent: true,
      },
    ];
  },
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
