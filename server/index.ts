// NEXT.JS STARTUP SCRIPT - PURE NEXT.JS DEPLOYMENT READY
// This script ensures clean Next.js startup without Express/Vite dependencies

import { spawn } from 'child_process';

console.log("🚀 STARTING NEXT.JS: Professional webinar platform");
console.log("   Next.js 15.4.4 development server starting on port 5000...");
console.log("   Ready for Vercel deployment - no Express/Vite dependencies");

// Start Next.js development server directly
const nextDev = spawn('npx', ['next', 'dev', '-p', '5000'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: { ...process.env, NODE_ENV: 'development' }
});

nextDev.on('error', (error) => {
  console.error('❌ Failed to start Next.js:', error);
  console.log('🔧 Trying alternative startup method...');
  
  // Fallback: try with direct next command
  const fallback = spawn('next', ['dev', '-p', '5000'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  fallback.on('error', (fallbackError) => {
    console.error('❌ Fallback failed:', fallbackError);
    process.exit(1);
  });
});

nextDev.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Next.js exited with code ${code}`);
  }
  process.exit(code || 0);
});