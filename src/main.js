import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router';
import './style.css';

import en from './locales/en.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import or from './locales/or.json';
import ml from './locales/ml.json';
import te from './locales/te.json';

const i18n = createI18n({
    legacy: false, // you must set `false`, to use Composition API
    locale: 'en', // set locale
    fallbackLocale: 'en', // set fallback locale
    messages: {
        en,
        de,
        fr,
        or,
        ml,
        te
    }
});

const app = createApp(App);
app.use(i18n);
app.use(router);
app.mount('#app');
