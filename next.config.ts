import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.e2b.app"],
  serverExternalPackages: ["pg-mem", "pg"],
  experimental: {
    serverActions: {
      allowedOrigins: ["*.e2b.app", "*.workers.dev", "localhost:3000", "localhost:8787", "127.0.0.1:8787"],
    },
  },
};

export default nextConfig;

if (process.env.NODE_ENV === "development") {
  import("@opennextjs/cloudflare")
    .then((m) => m.initOpenNextCloudflareForDev())
    .catch(() => undefined);
}
