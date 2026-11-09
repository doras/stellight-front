/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// Icons: only the SVG paths imported here are bundled
// https://vuetifyjs.com/en/features/icon-fonts/#mdi-js-svg
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import {
  mdiCheckCircle,
  mdiCogOutline,
  mdiContentSave,
  mdiEmailOutline,
  mdiGithub,
  mdiLogin,
  mdiLogout,
} from '@mdi/js'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases: {
      // Built-in aliases (close, plus, error, success, ...)
      ...aliases,
      checkCircle: mdiCheckCircle,
      cogOutline: mdiCogOutline,
      contentSave: mdiContentSave,
      emailOutline: mdiEmailOutline,
      github: mdiGithub,
      login: mdiLogin,
      logout: mdiLogout,
    },
    sets: { mdi },
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
        },
      },
    },
  },
})
