
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  async rewrites() {
    return [
      { source: '/legals', destination: '/legal' },
      { source: '/delete-account', destination: '/account-deletion' },
    ]
  },
}

module.exports = nextConfig
