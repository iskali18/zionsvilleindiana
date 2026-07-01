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
        source: '/downtown/dining',
        destination: '/articles/dining-in-downtown-zionsville',
        permanent: true,
      },
      {
        source: '/articles/things-to-do',
        destination: '/things-to-do',
        permanent: true,
      },
      {
        source: '/articles/zionsville-coffee-shops',
        destination: '/articles/coffee-shops',
        permanent: true,
      },
    ]
  },
}

export default nextConfig