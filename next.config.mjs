/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const isProd = process.env.NEXT_PUBLIC_NODE_ENV === 'production' || process.env.NODE_ENV === 'production';
    
    if (isProd) return [];

    return [
      {
        source: '/api/:path*',
        destination: '127.0.0',
      },
    ];
  },
};

export default nextConfig;
