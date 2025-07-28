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
}

export default nextConfig