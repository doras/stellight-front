/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

import '@/assets/global.css'
import emoji from './directives/emoji'
import { runSettingsMigrations } from '@/utils/settingsMigration'

// Migrate the stored settings before any component reads them
runSettingsMigrations()

const app = createApp(App)

registerPlugins(app)

app.directive("emoji", emoji)

app.mount('#app')
