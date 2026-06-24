import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "app-source.html")
      },
      output: {
        entryFileNames: "assets/index.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]"
      }
    }
  },
  plugins: [
    react(),
    {
      name: "file-protocol-html",
      generateBundle(_options, bundle) {
        if (bundle["app-source.html"]) {
          bundle["index.html"] = {
            ...bundle["app-source.html"],
            fileName: "index.html"
          };
          delete bundle["app-source.html"];
        }
      },
      transformIndexHtml(html) {
        return html
          .replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g, '<script defer src="$1"></script>')
          .replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/g, '<link rel="stylesheet" href="$1">');
      }
    }
  ]
});
