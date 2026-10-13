import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const root = import.meta.dirname
const pages = ['cafe', 'arquitectura', 'odontologia', 'pilates', 'cirilo']

export default defineConfig({
  appType: 'mpa',
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        index: resolve(root, 'index.html'),
        ...Object.fromEntries(pages.map((p) => [p, resolve(root, p, 'index.html')])),
      },
    },
  },
})
