import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Maps process.env variables to the environment variables for browser compatibility
      // Use || '' to ensure they are strings, even if missing in .env
      'process.env.API_KEY': JSON.stringify(env.GEMINI_CONFIG || env.API_KEY || ''),
      'process.env.CLIENT_ID': JSON.stringify(env.CLIENT_ID || '274356515368-934lln6j1cks661j3h34sqq0kqfbihr2.apps.googleusercontent.com'),
      'process.env.DRIVE_API_KEY': JSON.stringify(env.DRIVE_API_KEY || ''),
      'process.env': {}
    },
    build: {
      outDir: 'dist',
    }
  };
});