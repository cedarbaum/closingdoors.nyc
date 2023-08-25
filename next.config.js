const withPWA = require("next-pwa")({
  dest: "public",
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/us-ny-subway",
        permanent: true,
      },
    ];
  },
});

module.exports = nextConfig;
