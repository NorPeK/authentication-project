import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  // ... your other config
  plugins: [
    react(),
    nodePolyfills({
      crypto: true,    // Enables crypto polyfill for browser
      buffer: true, 
    }),
  ],
})