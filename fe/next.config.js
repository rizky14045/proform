/** @type {import('next').NextConfig} */


const nextConfig = {
  // NOTE: Turbopack doesn't support custom Webpack loaders yet
  // The previous @svgr/webpack configuration for SVG imports has been removed
  // You'll need to either:
  // 1. Wait for Turbopack to support custom loaders
  // 2. Use a different approach for SVG imports (e.g., import as URLs)
  // 3. Switch back to Webpack if SVG-as-component is critical
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.lorem.space",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "a0.muscache.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};


module.exports = nextConfig;