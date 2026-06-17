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
    ]
  },
}

export default nextConfig
