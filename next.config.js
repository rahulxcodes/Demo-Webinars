/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production deployment configuration
  output: 'standalone',
  
  // Port configuration for Replit deployment
  env: {
    PORT: '5000',
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    STREAM_API_KEY: process.env.STREAM_API_KEY,
    STREAM_SECRET: process.env.STREAM_SECRET,
  },
  
  // Transpile Stream.io packages for compatibility
  transpilePackages: ['@stream-io/video-react-sdk'],
  
  // Configure for Replit environment  
  serverExternalPackages: [],
  
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Experimental features
  experimental: {
    // allowedDevOrigins is deprecated in Next.js 15.4.4
    // Cross-origin handling is now automatic
  },
}

export default nextConfig