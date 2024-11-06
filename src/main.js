import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';
import * as IonComponents from '@ionic/vue';

// i18n
import { createI18n } from 'vue-i18n';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import es from '@/locales/es.json';
import de from '@/locales/de.json';
import it from '@/locales/it.json';
import pt from '@/locales/pt.json';
const i18n = createI18n({
  locale: localStorage.getItem('lang') || navigator.language.split('-')[0],
  fallbackLocale: 'en',
  messages: {
    en,
    fr,
    es,
    de,
    it,
    pt,
  }
});

// Fontawesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon, FontAwesomeLayers, FontAwesomeLayersText } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
library.add(fas, far, fab);

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

const app = createApp(App)
  .use(IonicVue)
  .use(i18n)
  .use(router);

/* Auto-load all Ionic components */
Object.keys(IonComponents).forEach(key => {
  if (/^Ion[A-Z]\w+$/.test(key)) {
    app.component(key, IonComponents[key]);
  }
});

/* Load FontAwesome */
app.component('font-awesome-icon', FontAwesomeIcon);
app.component('font-awesome-layers', FontAwesomeLayers);
app.component('font-awesome-layer-text', FontAwesomeLayersText);

router.isReady().then(() => {
  app.mount('#app');
});
