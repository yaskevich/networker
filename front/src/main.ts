import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import PrimeVue from 'primevue/config';

createApp(App)
  .use(PrimeVue)
  .use(router)
  .mount('#app')
