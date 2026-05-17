import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Library mode skips Vite's default production substitutions, so React's
  // `process.env.NODE_ENV` references reach the browser and crash. Replace them
  // here so React picks the production runtime.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: 'src/main.tsx',
      formats: ['es'],
      fileName: () => 'realm.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    cssCodeSplit: false,
    target: 'es2022',
    minify: 'esbuild',
    sourcemap: true,
  },
});
