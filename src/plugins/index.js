/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import { loadFonts } from './webfontloader'
import vuetify from './vuetify'
import router from '../router'
import axiosPlugin from '../../axios';

import { setupCalendar } from 'v-calendar';
import 'v-calendar/style.css';

export function registerPlugins (app) {
  loadFonts()
  app
    .use(vuetify)
    .use(router)
    .use(axiosPlugin)
    .use(setupCalendar, {})
  app.config.unwrapInjectedRef = true

}
