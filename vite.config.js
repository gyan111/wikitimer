import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
// In development, proxy API/auth routes to the backend server (default :3000)
// so the frontend can use same-origin relative paths, matching production.
const backend = process.env.VITE_BACKEND_URL || 'http://localhost:3000';
const proxyPaths = ['/timers', '/add-timer', '/meta-events', '/api', '/auth', '/test', '/health'];

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: Object.fromEntries(
      proxyPaths.map((p) => [p, { target: backend, changeOrigin: true }])
    )
  }
});
