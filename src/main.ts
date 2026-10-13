import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Points to your src/router.ts
import 'leaflet/dist/leaflet.css'
import './style.css'

const app = createApp(App)
app.use(router)
app.mount('#app')