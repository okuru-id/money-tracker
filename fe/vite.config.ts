import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'icons/android-chrome-192x192.png', 'icons/android-chrome-512x512.png', 'icons/apple-touch-icon-180x180.png', 'icons/favicon-16x16.png', 'icons/favicon-32x32.png', 'icons/favicon-48x48.png'],
      manifest: false,
      workbox: {
        globPatterns: [],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*/i,
            handler: 'NetworkOnly',
            method: 'GET',
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
