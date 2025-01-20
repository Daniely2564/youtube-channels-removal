import { defineConfig } from "vite";
import { resolve } from 'node:path';
import tailwind from "tailwindcss";
import autoprefixer from "autoprefixer";



export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwind, autoprefixer],
    }
  },
  base: "",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        scripts: resolve(__dirname, 'src/scripts/remove-script.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'scripts') {
            return 'scripts/remove-script.js'
          }
          return chunkInfo.name + '.js';
        }
      }
    }
  }
});
