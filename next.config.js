/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    STREAM_API_KEY: process.env.STREAM_API_KEY,
  },
  transpilePackages: ['@stream-io/video-react-sdk'],
  // Configure for Replit environment  
  serverExternalPackages: [],
  // Fix cross-origin warnings and ensure proper loading
  experimental: {
    allowedDevOrigins: ['127.0.0.1', 'localhost', '.replit.dev'],
  },
  // Disable caching for development
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },
}

export default nextConfig