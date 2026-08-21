<template>
  <div :class="['min-h-screen flex flex-col transition-colors duration-500 bg-mesh relative', darkMode ? 'text-gray-100' : 'text-gray-900']">
    
    <!-- App Bar -->
    <header class="sticky top-0 z-30 w-full glass-panel transition-all duration-300">
      <div class="container mx-auto flex items-center justify-between py-4 px-6">
        <div class="flex items-center gap-4">
          <button class="md:hidden mr-2 p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors" @click="drawerOpen = !drawerOpen" aria-label="Open navigation">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <router-link to="/" class="text-3xl font-extrabold tracking-tight focus:outline-none text-gradient drop-shadow-sm" @click="drawerOpen = false">{{ $t('app.title') }}</router-link>
        </div>
        <div class="flex items-center gap-3 sm:gap-4">
          <!-- Locale Selector -->
          <div class="relative hidden lg:block">
            <select
              v-model="$i18n.locale"
              class="appearance-none bg-white/40 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-full py-1.5 pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 backdrop-blur-md shadow-sm transition-all hover:bg-white/60 dark:hover:bg-gray-700/60 cursor-pointer"
            >
              <option v-for="lang in availableLocales" :key="lang.code" :value="lang.code">{{ lang.name }}</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
              <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          <!-- Time & Timezone Pill (Click to open settings) -->
          <button
            @click="showTimeInfo = true"
            class="hidden sm:inline-flex items-center gap-1.5 font-medium opacity-90 hover:opacity-100 bg-white/50 dark:bg-black/30 hover:bg-white/70 dark:hover:bg-black/50 px-3 py-1.5 rounded-full text-xs sm:text-sm border border-black/5 dark:border-white/10 backdrop-blur-sm shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
            :title="$t('timezone.settingsTitle')"
          >
            <span class="text-primary-600 dark:text-primary-400">🕒</span>
            <span class="font-bold text-gray-800 dark:text-gray-200">{{ activeTzLabel }}:</span>
            <span class="font-mono text-gray-600 dark:text-gray-300">{{ formattedTimeInActiveTz }}</span>
            <span class="text-[10px] bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 px-1.5 py-0.5 rounded-full font-bold ml-1 group-hover:scale-105 transition-transform">⚙️</span>
          </button>

          <!-- Help / Info Button -->
          <button
            @click="showTimeInfo = true"
            class="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm font-bold bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 hover:scale-110 shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            :title="$t('timezone.settingsTitle')"
          >
            ?
          </button>
          
          <!-- Dark Mode Toggle -->
          <button 
            @click="toggleDarkMode" 
            class="relative p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:scale-105 hover:bg-white dark:hover:bg-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 overflow-hidden group cursor-pointer"
            :title="darkMode ? $t('app.themeLight') : $t('app.themeDark')"
          >
            <div class="absolute inset-0 bg-gradient-to-tr from-primary-400/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <!-- Sun icon for light mode -->
            <svg v-if="darkMode" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <!-- Moon icon for dark mode -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Mobile Drawer -->
      <transition 
        enter-active-class="transition-opacity ease-linear duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity ease-linear duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="drawerOpen" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" @click="drawerOpen = false"></div>
      </transition>

      <transition 
        enter-active-class="transition ease-in-out duration-300 transform"
        enter-from-class="-translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition ease-in-out duration-300 transform"
        leave-from-class="translate-x-0"
        leave-to-class="-translate-x-full"
      >
        <nav v-if="drawerOpen" class="fixed inset-y-0 left-0 max-w-xs w-full glass-panel shadow-2xl p-8 flex flex-col z-50 overflow-y-auto" @click.stop>
          <div class="flex items-center justify-between mb-8">
            <span class="text-2xl font-bold text-gradient">{{ $t('app.title') }}</span>
            <button @click="drawerOpen = false" class="p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors" :aria-label="$t('modal.close')">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div class="mb-6 lg:hidden">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('app.language') }}</label>
            <select
              v-model="$i18n.locale"
              class="w-full appearance-none bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-xl py-2 pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium cursor-pointer"
            >
              <option v-for="lang in availableLocales" :key="lang.code" :value="lang.code">{{ lang.name }}</option>
            </select>
          </div>

          <button
            @click="showTimeInfo = true; drawerOpen = false"
            class="mb-4 text-left font-semibold text-lg p-3 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between"
          >
            <span>🕒 {{ $t('timezone.settingsTitle') }}</span>
            <span class="text-xs bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-bold">{{ activeTzShortLabel }}</span>
          </button>

          <router-link to="/" class="mb-4 font-semibold text-xl p-3 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors" @click="drawerOpen = false">{{ $t('app.backToTimers') }}</router-link>
          <router-link to="/add" class="mb-4 font-semibold text-xl p-3 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors" @click="drawerOpen = false">{{ $t('app.addTimer') }}</router-link>
          <div class="mt-auto"></div>
        </nav>
      </transition>
    </header>

    <!-- Comprehensive Time & Timezone Settings Modal -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="showTimeInfo" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click="showTimeInfo = false">
        <div class="glass-panel text-gray-800 dark:text-gray-100 p-6 rounded-3xl max-w-md w-full relative shadow-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white/95 dark:bg-gray-900/95" @click.stop>
          <button @click="showTimeInfo = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" :aria-label="$t('modal.close')">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <!-- Header -->
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2.5 bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 rounded-2xl">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-extrabold text-lg text-gray-900 dark:text-white">{{ $t('timezone.settingsTitle') }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('timezone.settingsDesc') }}</p>
            </div>
          </div>

          <!-- Live Preview Box -->
          <div class="bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-2xl border border-gray-200/70 dark:border-gray-700/70 mb-5 flex flex-col gap-1">
            <div class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ $t('timezone.currentTime') }} ({{ activeTzShortLabel }})
            </div>
            <div class="text-xl font-black font-mono text-primary-600 dark:text-primary-400">
              {{ formattedTimeInActiveTz }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
              <span>📍 {{ resolvedTimezone }}</span>
            </div>
          </div>

          <!-- Timezone Options / Presets -->
          <div class="space-y-3">
            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              {{ $t('timezone.selectTimezone') }}
            </label>

            <!-- Preset Buttons -->
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="setTimezone('auto')"
                :class="selectedTzSetting === 'auto' ? 'bg-primary-500 text-white border-primary-600 shadow-xs font-bold' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'"
                class="p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer flex flex-col gap-0.5"
              >
                <span class="font-bold">💻 {{ $t('timezone.systemDetected') }}</span>
                <span class="text-[10px] opacity-80 truncate">{{ systemTimezone }}</span>
              </button>

              <button
                @click="setTimezone('UTC')"
                :class="selectedTzSetting === 'UTC' ? 'bg-primary-500 text-white border-primary-600 shadow-xs font-bold' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'"
                class="p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer flex flex-col gap-0.5"
              >
                <span class="font-bold">🌐 {{ $t('timezone.utc') }}</span>
                <span class="text-[10px] opacity-80">UTC+00:00 (Wiki Std)</span>
              </button>
            </div>

            <!-- Custom Timezone Dropdown Selector -->
            <div>
              <label class="block text-[11px] text-gray-500 dark:text-gray-400 mb-1 font-semibold">
                {{ $t('timezone.custom') }}
              </label>
              <select
                v-model="selectedTzSetting"
                @change="onCustomTzSelect"
                class="w-full py-2 px-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-xs sm:text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
              >
                <option value="auto">💻 Auto — System Local Time ({{ systemTimezone }})</option>
                <option value="UTC">🌐 UTC — Universal Coordinated Time</option>
                <optgroup v-for="group in timezoneGroups" :key="group.group" :label="group.group">
                  <option v-for="zone in group.list" :key="zone.value" :value="zone.value">
                    {{ zone.label }}
                  </option>
                </optgroup>
              </select>
            </div>
          </div>

          <!-- Footer Save Note -->
          <div class="mt-5 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>✨ Automatically saved</span>
            <button
              @click="showTimeInfo = false"
              class="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              {{ $t('modal.close') }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Main content area -->
    <main class="flex-grow container mx-auto px-4 sm:px-6 py-10 transition-colors duration-500 max-w-7xl relative z-10">
      <router-view v-slot="{ Component }">
        <transition 
          name="fade" 
          mode="out-in"
          enter-active-class="animate-fade-in"
          leave-active-class="transition-opacity duration-200 ease-in"
          leave-to-class="opacity-0"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer component -->
    <Footer class="relative z-10" />
  </div>
</template>

<script>
import Footer from './components/Footer.vue';

const commonTimezoneGroups = [
  { group: 'Africa', list: [
    { value: 'Africa/Cairo', label: 'Cairo (EET / UTC+2)' },
    { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST / UTC+2)' },
    { value: 'Africa/Lagos', label: 'Lagos / West Africa (WAT / UTC+1)' },
    { value: 'Africa/Nairobi', label: 'Nairobi / East Africa (EAT / UTC+3)' },
    { value: 'Africa/Casablanca', label: 'Casablanca (WEST / UTC+1)' }
  ]},
  { group: 'Americas', list: [
    { value: 'America/New_York', label: 'New York / Eastern (EST / EDT)' },
    { value: 'America/Chicago', label: 'Chicago / Central (CST / CDT)' },
    { value: 'America/Denver', label: 'Denver / Mountain (MST / MDT)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles / Pacific (PST / PDT)' },
    { value: 'America/Sao_Paulo', label: 'São Paulo / Brazil (BRT / UTC-3)' },
    { value: 'America/Mexico_City', label: 'Mexico City (CST / UTC-6)' },
    { value: 'America/Bogota', label: 'Bogota / Lima (COT / UTC-5)' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (ART / UTC-3)' }
  ]},
  { group: 'Asia & Middle East', list: [
    { value: 'Asia/Kolkata', label: 'India (IST / UTC+5:30)' },
    { value: 'Asia/Dhaka', label: 'Bangladesh (BST / UTC+6)' },
    { value: 'Asia/Kathmandu', label: 'Nepal (NPT / UTC+5:45)' },
    { value: 'Asia/Colombo', label: 'Sri Lanka (SLST / UTC+5:30)' },
    { value: 'Asia/Dubai', label: 'Dubai / Gulf (GST / UTC+4)' },
    { value: 'Asia/Riyadh', label: 'Riyadh / Saudi (AST / UTC+3)' },
    { value: 'Asia/Jakarta', label: 'Jakarta / West Indonesia (WIB / UTC+7)' },
    { value: 'Asia/Bangkok', label: 'Bangkok / Indochina (ICT / UTC+7)' },
    { value: 'Asia/Singapore', label: 'Singapore / Malaysia (SGT / UTC+8)' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong / China (HKT / CST / UTC+8)' },
    { value: 'Asia/Taipei', label: 'Taipei (CST / UTC+8)' },
    { value: 'Asia/Tokyo', label: 'Tokyo / Japan (JST / UTC+9)' },
    { value: 'Asia/Seoul', label: 'Seoul / Korea (KST / UTC+9)' },
    { value: 'Asia/Manila', label: 'Manila / Philippines (PST / UTC+8)' }
  ]},
  { group: 'Europe', list: [
    { value: 'Europe/London', label: 'London / Dublin (GMT / BST)' },
    { value: 'Europe/Paris', label: 'Paris / Berlin / Rome / Madrid (CET / CEST)' },
    { value: 'Europe/Warsaw', label: 'Warsaw / Central Europe (CET / CEST)' },
    { value: 'Europe/Kyiv', label: 'Kyiv / Eastern Europe (EET / EEST)' },
    { value: 'Europe/Athens', label: 'Athens / Bucharest (EET / EEST)' },
    { value: 'Europe/Istanbul', label: 'Istanbul (TRT / UTC+3)' }
  ]},
  { group: 'Oceania & Pacific', list: [
    { value: 'Australia/Sydney', label: 'Sydney / Melbourne (AEST / AEDT)' },
    { value: 'Australia/Perth', label: 'Perth (AWST / UTC+8)' },
    { value: 'Pacific/Auckland', label: 'Auckland / New Zealand (NZST / NZDT)' },
    { value: 'Pacific/Honolulu', label: 'Honolulu / Hawaii (HST / UTC-10)' }
  ]}
];

export default {
  name: 'App',
  components: {
    Footer
  },
  data() {
    return {
      currentTime: new Date(),
      showTimeInfo: false,
      timer: null,
      darkMode: false,
      drawerOpen: false,
      systemTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      selectedTzSetting: localStorage.getItem('wikitimer_tz') || 'auto',
      timezoneGroups: commonTimezoneGroups,
      availableLocales: [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'de', name: 'Deutsch' },
        { code: 'fr', name: 'Français' },
        { code: 'pt', name: 'Português (Brasil)' },
        { code: 'it', name: 'Italiano' },
        { code: 'id', name: 'Bahasa Indonesia' },
        { code: 'ru', name: 'Русский' },
        { code: 'ar', name: 'العربية' },
        { code: 'zh', name: '中文' },
        { code: 'ja', name: '日本語' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'or', name: 'ଓଡ଼ିଆ' },
        { code: 'te', name: 'తెలుగు' },
        { code: 'ta', name: 'தமிழ்' },
        { code: 'ml', name: 'മലയാളം' },
        { code: 'sat', name: 'ᱥᱟᱱᱛᱟᱲᱤ' }
      ]
    };
  },
  watch: {
    '$i18n.locale'(newLocale) {
      localStorage.setItem('wiki_timer_locale', newLocale);
      document.documentElement.lang = newLocale;
      document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    }
  },
  computed: {
    resolvedTimezone() {
      if (this.selectedTzSetting === 'auto' || !this.selectedTzSetting) {
        return this.systemTimezone;
      }
      return this.selectedTzSetting;
    },
    activeTzLabel() {
      if (this.selectedTzSetting === 'UTC') return 'UTC';
      if (this.selectedTzSetting === 'auto') return this.$t('app.systemTime') || 'System Time';
      return this.resolvedTimezone.split('/').pop().replace('_', ' ');
    },
    activeTzShortLabel() {
      if (this.selectedTzSetting === 'UTC') return 'UTC';
      if (this.selectedTzSetting === 'auto') return 'Local';
      return this.resolvedTimezone.split('/').pop().replace('_', ' ');
    },
    formattedTimeInActiveTz() {
      try {
        const now = this.currentTime;
        const tz = this.resolvedTimezone;
        const options = {
          timeZone: tz,
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(now);
        const get = (type) => parts.find(p => p.type === type)?.value || '';
        return `${get('year')} ${get('month')} ${get('day')} - ${get('hour')}:${get('minute')}:${get('second')}`;
      } catch (e) {
        return this.currentTime.toTimeString().split(' ')[0];
      }
    }
  },
  methods: {
    updateTime() {
      this.currentTime = new Date();
    },
    setTimezone(tz) {
      this.selectedTzSetting = tz;
      localStorage.setItem('wikitimer_tz', tz);
      window.dispatchEvent(new CustomEvent('wikitimer_tz_changed', { detail: tz }));
    },
    onCustomTzSelect() {
      this.setTimezone(this.selectedTzSetting);
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      document.documentElement.classList.toggle('dark', this.darkMode);
      localStorage.setItem('darkMode', this.darkMode ? '1' : '0');
    },
    handleSystemThemeChange(e) {
      if (localStorage.getItem('darkMode') === null) {
        this.darkMode = e.matches;
        document.documentElement.classList.toggle('dark', this.darkMode);
      }
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    
    // Init dark mode with system theme auto-adaptation
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      this.darkMode = savedTheme === '1';
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.darkMode = true;
    } else {
      this.darkMode = false;
    }
    document.documentElement.classList.toggle('dark', this.darkMode);

    if (window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (this.mediaQuery.addEventListener) {
        this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);
      }
    }

    // Init lang and dir
    document.documentElement.lang = this.$i18n.locale;
    document.documentElement.dir = this.$i18n.locale === 'ar' ? 'rtl' : 'ltr';
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.mediaQuery && this.mediaQuery.removeEventListener) {
      this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
    }
  }
};
</script>