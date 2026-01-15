import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@context': path.resolve(__dirname, './src/context'),
      '@api': path.resolve(__dirname, './src/api'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Optimizaciones de producción (esbuild viene incluido con Vite)
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'] // Eliminar console.log en producción
    },
    // Code splitting para mejor carga
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - librerías de terceros
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['react-icons', 'framer-motion'],
          'vendor-forms': ['react-hook-form', 'yup', '@hookform/resolvers'],
          'vendor-charts': ['recharts'],
          'vendor-editor': ['react-quill'],
          'vendor-utils': ['axios', 'date-fns', 'socket.io-client']
        },
        // Nombres de archivos con hash para caché
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          // Organizar assets por tipo
          if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.css$/.test(name ?? '')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(name ?? '')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    // Tamaño máximo de chunk antes de advertencia
    chunkSizeWarningLimit: 500,
    // Generar manifest para integración con backend
    manifest: true,
    // Comprimir assets
    reportCompressedSize: true
  },
  // Optimización de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'react-hook-form',
      'yup',
      'date-fns',
      'socket.io-client'
    ]
  },
  // Previsualización de producción
  preview: {
    port: 4173,
    strictPort: true
  }
});
