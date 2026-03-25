import './assets/main.css'

import { applyThemeToDocument, getStoredTheme } from './utils/theme'

applyThemeToDocument(getStoredTheme())

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
