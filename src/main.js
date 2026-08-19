import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router';
import './style.css';

import en from './locales/en.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import it from './locales/it.json';
import id from './locales/id.json';
import ru from './locales/ru.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import hi from './locales/hi.json';
import or from './locales/or.json';
import ml from './locales/ml.json';
import te from './locales/te.json';
import ta from './locales/ta.json';
import sat from './locales/sat.json';

const savedLocale = localStorage.getItem('wiki_timer_locale') || 'en';

const i18n = createI18n({
    legacy: false, // you must set `false`, to use Composition API
    locale: savedLocale, // set locale
    fallbackLocale: 'en', // set fallback locale
    messages: {
        en,
        de,
        fr,
        es,
        pt,
        it,
        id,
        ru,
        ar,
        zh,
        ja,
        hi,
        or,
        ml,
        te,
        ta,
        sat
    }
});

// Auto-recover from outdated deploy bundles / missing chunks
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  window.location.reload();
});

const app = createApp(App);
app.use(i18n);
app.use(router);
app.mount('#app');
