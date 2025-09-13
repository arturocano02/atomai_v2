/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper static generation
  output: 'standalone',
  // Handle API routes properly
  async rewrites() {
    return [];
  },
  // Handle environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
