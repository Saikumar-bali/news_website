import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

function copyDataPlugin() {
  return {
    name: 'copy-data',
    closeBundle() {
      const srcDir = resolve(__dirname, 'data')
      const destDir = resolve(__dirname, 'dist', 'data')
      if (!fs.existsSync(srcDir)) return
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true })
      }
      fs.readdirSync(srcDir).forEach(file => {
        if (file.endsWith('.json')) {
          fs.copyFileSync(resolve(srcDir, file), resolve(destDir, file))
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [svelte(), copyDataPlugin()],
  server: {
    watch: {
      ignored: ['**/nul']
    }
  },
  build: {
    outDir: 'dist'
  }
})
