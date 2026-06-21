import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/downtown/shopping',
        destination: '/articles/shopping-in-downtown-zionsville',
        permanent: true,
      },
      {
        source: '/articles/things-to-do',
        destination: '/things-to-do',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
