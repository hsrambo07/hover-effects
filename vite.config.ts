import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ command }) => {
  const isPlayground = process.env.PLAYGROUND === 'true';
  
  if (isPlayground) {
    return {
      root: 'playground',
      publicDir: 'playground/public',
      build: {
        outDir: '../dist-playground',
        emptyOutDir: true
      },
      server: {
        port: 3000
      }
    };
  }
  
  return {
    build: {
      lib: {
        entry: resolve(__dirname, "src/index.ts"),
        name: "HoverEffects",
        formats: ["es", "umd"],
        fileName: (format) => `hover-effects.${format}.js`
      },
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        output: {
          // Ensure ES module is the primary format
          preserveModules: false
        }
      }
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src")
      }
    }
  };
});
