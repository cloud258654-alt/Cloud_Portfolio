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
      transformIndexHtml: {
        order: "post",
        handler(html) {
          const withMeta = html.replace(
            "</head>",
            '  <meta name="theme-color" content="#07152b" />\n    <meta name="description" content="福田貨櫃倉儲智慧管理系統" />\n    <link rel="manifest" href="./manifest.json" />\n    <link rel="apple-touch-icon" href="./icon-192.png" />\n    <link rel="icon" type="image/png" sizes="192x192" href="./icon-192.png" />\n  </head>'
          );
          return withMeta
            .replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g, '<script defer src="$1"></script>')
            .replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/g, '<link rel="stylesheet" href="$1">');
        }
      }
    }
  ]
});
