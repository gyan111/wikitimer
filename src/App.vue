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
        <div class="flex items-center gap-4 sm:gap-6">
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
          <span class="hidden sm:inline font-medium opacity-80 bg-white/40 dark:bg-black/30 px-3 py-1 rounded-full text-sm border border-black/5 dark:border-white/5 backdrop-blur-sm">System Time: {{ formattedTime }}</span>
          <button @click="showTimeInfo = true" class="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm font-bold bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 hover:scale-110 shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500" title="Click for more information">?</button>
          
          <!-- Dark Mode Toggle -->
          <button 
            @click="toggleDarkMode" 
            class="relative p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:scale-105 hover:bg-white dark:hover:bg-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 overflow-hidden group"
            :title="darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
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
            <button @click="drawerOpen = false" class="p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors">
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

          <router-link to="/" class="mb-4 font-semibold text-xl p-3 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors" @click="drawerOpen = false">{{ $t('app.backToTimers') }}</router-link>
          <router-link to="/add" class="mb-4 font-semibold text-xl p-3 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors" @click="drawerOpen = false">{{ $t('app.addTimer') }}</router-link>
          <div class="mt-auto"></div>
        </nav>
      </transition>
    </header>

    <!-- Time info popup -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="showTimeInfo" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50" @click="showTimeInfo = false">
        <div class="glass-panel text-gray-800 dark:text-gray-100 p-6 rounded-2xl max-w-sm relative w-full sm:w-auto" @click.stop>
          <button @click="showTimeInfo = false" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition-colors" aria-label="Close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-full">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 class="font-bold text-lg">System Time</h3>
          </div>
          <p class="text-sm opacity-80 pl-11">This time is calculated locally based on your device's timezone and clock settings.</p>
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
import Footer from './components/Footer.vue'

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
        { code: 'ml', name: 'മലയാളം' }
      ]
    }
  },
  watch: {
    '$i18n.locale'(newLocale) {
      localStorage.setItem('wiki_timer_locale', newLocale);
      document.documentElement.lang = newLocale;
      document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    }
  },
  computed: {
    formattedTime() {
      const now = this.currentTime
      const year = now.getFullYear()
      const month = now.toLocaleString('en-US', { month: 'short' })
      const day = now.getDate().toString().padStart(2, '0')
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      const seconds = now.getSeconds().toString().padStart(2, '0')
      return `${year} ${month} ${day} - ${hours}:${minutes}:${seconds}`
    }
  },
  methods: {
    updateTime() {
      this.currentTime = new Date()
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      document.documentElement.classList.toggle('dark', this.darkMode);
      localStorage.setItem('darkMode', this.darkMode ? '1' : '0');
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      this.currentTime = new Date()
    }, 1000)
    // Init dark mode
    this.darkMode = localStorage.getItem('darkMode') === '1';
    document.documentElement.classList.toggle('dark', this.darkMode);
    // Init lang and dir
    document.documentElement.lang = this.$i18n.locale;
    document.documentElement.dir = this.$i18n.locale === 'ar' ? 'rtl' : 'ltr';
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>