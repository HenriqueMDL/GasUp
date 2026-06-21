import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      // Avoid EBUSY on Windows when Java backend files are locked.
      ignored: ['**/Api-sample/**'],
    },
  },
})