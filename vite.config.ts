import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          'chart-vendor': ['recharts'],
          'zustand-vendor': ['zustand'],
          'dashboard': [
            './src/components/dashboard/CompanyEarnings.tsx',
            './src/components/dashboard/ProductPerformanceChart.tsx',
            './src/components/dashboard/KPICard.tsx',
            './src/components/dashboard/QuickActions.tsx',
            './src/components/dashboard/LowStockAlert.tsx',
            './src/components/dashboard/StockAlertBadge.tsx'
          ],
          'inventory': [
            './src/components/inventory/CategoryManager.tsx',
            './src/components/inventory/ProductSearch.tsx'
          ],
          'calendar': [
            './src/components/calendar/DailySalesSheet.tsx',
            './src/components/calendar/TopSellingProducts.tsx'
          ],
          'ui-components': [
            './src/components/ui/button.tsx',
            './src/components/ui/card.tsx',
            './src/components/ui/input.tsx',
            './src/components/ui/select.tsx',
            './src/components/ui/dialog.tsx',
            './src/components/ui/table.tsx',
            './src/components/ui/form.tsx',
            './src/components/ui/loading-spinner.tsx'
          ]
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      'zustand',
      'lucide-react',
      'recharts',
      'class-variance-authority',
      'clsx',
      'tailwind-merge'
    ],
    exclude: []
  },
  server: {
    port: 8080,
    host: true,
    hmr: {
      overlay: false
    }
  },
  css: {
    devSourcemap: false,
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
    treeShaking: true,
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
  }
}));
