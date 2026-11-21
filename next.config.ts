import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.e2b.app"],
  experimental: {
    serverActions: {
      allowedOrigins: ["*.e2b.app", "*.workers.dev", "localhost:3000"],
    },
  },
};

export default nextConfig;

if (process.env.NODE_ENV === "development") {
  import("@opennextjs/cloudflare")
    .then((m) => m.initOpenNextCloudflareForDev())
    .catch(() => undefined);
}
