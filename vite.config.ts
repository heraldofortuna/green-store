import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vercel sirve en la raíz; GitHub Pages usa /green-store/.
const base = process.env.VERCEL ? '/' : '/green-store/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
})
