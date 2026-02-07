/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://ai-trend-tracker-production.up.railway.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;
