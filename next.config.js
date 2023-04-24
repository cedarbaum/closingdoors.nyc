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
};

module.exports = nextConfig;
