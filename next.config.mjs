/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpiles Leaflet and layout packages to ensure absolute compatibility with Next.js 14 [INDEX]
  transpilePackages: ["react-leaflet", "leaflet"],

  // Enforces structural integrity across lifecycle events
  reactStrictMode: true,

  // Configures optimization rules for production asset routing across network borders [INDEX]
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "onrender.com", // Maps directly to your secured production backend domain
        port: "",
        pathname: "/media/**",
      },
    ],
  },

  // Strips console logging entries entirely during production compiles to prevent tracing data leaks [INDEX]
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
};

export default nextConfig;
