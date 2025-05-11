import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'playground',
  publicDir: 'public',
  build: {
    outDir: resolve(__dirname, 'dist-playground'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      'hover-effects': resolve(__dirname, 'src/index.ts')
    }
  }
}); 