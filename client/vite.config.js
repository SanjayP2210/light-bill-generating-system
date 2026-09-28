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
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['react-bootstrap', 'react-toastify', 'axios'],
        },
      },
    },
  },
});
