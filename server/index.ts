// DEPRECATED: This file has been replaced by Next.js native server
// Moved to backup_replaced_files/ on 2025-01-30
// Next.js now handles all server functionality natively

console.log("🚀 REDIRECTING TO NEXT.JS: This Express bridge is no longer needed.");
console.log("   Starting Next.js development server on port 5000...");
console.log("   All server functionality now handled by Next.js App Router.");

// Start Next.js development server
import { spawn } from 'child_process';

const nextDev = spawn('npx', ['next', 'dev', '-p', '5000'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

nextDev.on('error', (error) => {
  console.error('Failed to start Next.js:', error);
  process.exit(1);
});

nextDev.on('close', (code) => {
  process.exit(code);
});