import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        if (command === 'serve') {
          return html.replace(
            'https://api.windy.com/assets/map-forecast/libBoot.js',
            '/windy-api/assets/map-forecast/libBoot.js'
          )
        }
        return html
      }
    }
  ],
  server: {
    proxy: {
      '/windy-api': {
        target: 'https://api.windy.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/windy-api/, ''),
        configure: (_proxy) => {
          _proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Origin', 'https://api.windy.com')
            proxyReq.setHeader('Referer', 'https://api.windy.com/')
          })
        }
      }
    }
  },
}))
