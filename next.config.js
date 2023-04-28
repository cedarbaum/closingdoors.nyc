/** @type {import('next').NextConfig} */
const nextConfig = {
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
  rewrites() {
    return {
      beforeFiles: [
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "www.subwaygpt.app",
            },
          ],
          destination: "/chat",
        },
      ],
    };
  },
};

module.exports = nextConfig;
