// Plugins
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// Utilities
import browserslist from 'browserslist'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

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
      // Also sets build.target, so syntax and polyfills share the same browser list
      modernTargets: browserslist.loadConfig({ path: '.' }),
    }),
  ],
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
