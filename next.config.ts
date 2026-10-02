import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  poweredByHeader: false,
  agentRules: false,
  // Keep the Spark WASM and native stores off the Next bundler.
  serverExternalPackages: ["@breeztech/breez-sdk-spark", "better-sqlite3", "pg"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ]
  },
}

export default nextConfig
