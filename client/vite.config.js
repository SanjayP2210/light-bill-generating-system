import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/customers': 'http://localhost:5000',
      '/bills': 'http://localhost:5000'
    }
  },
  build: {
    rollupOptions: {
      output: {
        // Core libraries rarely change, so keep them in their own long-cached
        // chunk; app code changes then only invalidate the smaller app chunks.
        // Everything React itself needs (incl. react/jsx-runtime and scheduler)
        // must live in this one chunk: splitting it across two manual chunks
        // made them import each other and the app crashed on load with
        // "Cannot read properties of undefined (__SECRET_INTERNALS…)".
        // Other libraries are left to Rollup's automatic chunking.
        manualChunks(id) {
          if (
            /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|@remix-run[\\/]router)[\\/]/.test(id)
          ) {
            return 'vendor-react';
          }
        },
      },
    },
  },
});
