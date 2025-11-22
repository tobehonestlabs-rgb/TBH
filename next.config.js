/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    unoptimized: true, // Required for static export
  },
  // Static export for Netlify
  output: 'export',
  trailingSlash: true,
}

module.exports = nextConfig

