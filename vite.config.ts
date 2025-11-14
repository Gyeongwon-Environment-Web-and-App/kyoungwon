import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
          ],
          'table-vendor': ['@tanstack/react-table'],
          'date-vendor': ['react-day-picker', 'date-fns'],
          'icon-vendor': ['lucide-react'],
        },
      },
    },
    minify: 'esbuild',
    sourcemap: false,
    copyPublicDir: true,
    // Enable compression for better performance
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-table',
      'react-day-picker',
      'date-fns',
      'lucide-react',
    ],
    // Force optimization for better performance
    force: true,
  },
  // Add CSS optimization
  css: {
    devSourcemap: false,
  },
  // Performance optimizations
  esbuild: {
    // Enable tree shaking
    treeShaking: true,
    // Optimize for production
    target: 'es2020',
    // Minify identifiers
    minifyIdentifiers: true,
    // Minify syntax
    minifySyntax: true,
    // Minify whitespace
    minifyWhitespace: true,
  },
  server: {
    hmr: {
      port: 5173,
      host: 'localhost',
      clientPort: 5173,
    },
  },
});
