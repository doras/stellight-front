// Plugins
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// Utilities
import browserslist from 'browserslist'
import browserslistToEsbuild from 'browserslist-to-esbuild'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// Supported browsers from .browserslistrc: the single source for JS syntax, CSS and polyfill targets
const browserTargets = browserslist.loadConfig({
  path: fileURLToPath(new URL('.', import.meta.url)),
})
if (!browserTargets) {
  throw new Error('.browserslistrc not found')
}
const esbuildTargets = browserslistToEsbuild(browserTargets)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({ 
      template: { transformAssetUrls }
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    // Inject only the core-js polyfills actually used by the code
    // https://github.com/vitejs/vite/tree/main/packages/plugin-legacy
    // Note: requires `terser` as a peer dependency even without legacy chunks
    legacy({
      renderLegacyChunks: false,
      modernPolyfills: true,
      // Only selects polyfills; build.target is set below (the plugin sets it only with legacy chunks)
      modernTargets: browserTargets,
    }),
  ],
  build: {
    target: esbuildTargets,
    // Set explicitly, otherwise plugin-legacy forces 'chrome61'
    cssTarget: esbuildTargets,
  },
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3000,
  },
})
