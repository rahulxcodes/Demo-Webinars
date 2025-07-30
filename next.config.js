/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production deployment configuration
  output: 'standalone',
  
  // Transpile Stream.io packages for compatibility
  transpilePackages: ['@stream-io/video-react-sdk'],
  
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Environment variables are automatically available in Next.js
  // No need to explicitly define them in config
}

export default nextConfig