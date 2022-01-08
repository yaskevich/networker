import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import { VaInput, VaButton, VaSelect, VaIcon } from 'vuestic-ui'
import 'vuestic-ui/dist/vuestic-ui.css'
import "@fontsource/material-icons"

// import "@fontsource/fira-sans-extra-condensed" // Defaults to weight 400 with normal variant.
// import "@fontsource/fira-sans-extra-condensed/400-italic.css" // Italic variant.
// import "@fontsource/fira-sans-extra-condensed/700.css" // Bold variant.
// import "@fontsource/fira-sans-extra-condensed/700-italic.css" // Bold italic variant.
// import "@fontsource/fira-sans-extra-condensed/900.css" // Black variant.

createApp(App)
  .use(router)
  .component('va-input', VaInput)
  .component('va-button', VaButton)
  .component('va-select', VaSelect)
  .component('va-icon', VaIcon)
  .mount('#app')
