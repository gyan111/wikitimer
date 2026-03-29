<template>
  <div class="container mx-auto px-4 sm:px-6 py-8">
    <div class="max-w-2xl mx-auto glass-panel rounded-3xl overflow-hidden backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 hover:shadow-primary-500/10 relative z-20">
      
      <!-- Decorative background elements inside card -->
      <div class="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div class="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      
      <!-- Header -->
      <div class="relative bg-white/40 dark:bg-gray-900/40 p-8 sm:p-10 border-b border-white/20 dark:border-gray-700/50 backdrop-blur-md">
        <div class="absolute top-8 right-8 w-16 h-16 bg-gradient-to-br from-primary-400 to-indigo-500 rounded-2xl rotate-12 opacity-80 blur-lg sm:block hidden"></div>
        <div class="relative z-10">
          <router-link to="/" class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors mb-6 group">
            <svg class="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            {{ $t('app.backToTimers') }}
          </router-link>
          <h1 class="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 mb-3 tracking-tight">{{ $t('form.title') }}</h1>
          <p class="text-gray-600 dark:text-gray-300 text-lg font-medium">{{ $t('form.subtitle') }}</p>
        </div>
      </div>
      
      <div class="p-8 sm:p-10 relative z-10 bg-white/50 dark:bg-gray-800/50">
        <transition
          enter-active-class="transition duration-300 ease-out transform"
          enter-from-class="opacity-0 -translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in transform"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-4"
        >
          <div v-if="successMessage" class="mb-8 bg-green-50/80 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-5 rounded-2xl shadow-sm backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center flex-shrink-0 text-green-600 dark:text-green-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <p class="font-medium">{{ successMessage }}</p>
            </div>
            <button @click="goToTimers" class="w-full sm:w-auto px-5 py-2.5 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-xl shadow-md transition-all duration-300 font-medium whitespace-nowrap hover:shadow-lg hover:-translate-y-0.5">
              {{ $t('app.viewDashboard') }}
            </button>
          </div>
        </transition>

        <form @submit.prevent="addTimer" class="space-y-7">
          <!-- Wikidata Auto-fill -->
          <div class="glass-panel !bg-indigo-50/50 dark:!bg-indigo-900/10 border-indigo-100 dark:border-indigo-800/30 p-5 rounded-2xl mb-2 relative">
            <label for="wikidata-search" class="flex items-center text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-3 ml-1">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Auto-fill from Wikidata
            </label>
            <div class="relative z-40">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-400">
                <svg v-if="isSearchingWikidata" class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input
                id="wikidata-search"
                v-model="wikidataSearchQuery"
                @input="handleWikidataInput"
                type="text"
                placeholder="Search events (e.g., Wikimania 2024)..."
                class="w-full py-3.5 pl-11 pr-10 bg-white/80 dark:bg-gray-900/80 border border-indigo-200 dark:border-indigo-700/50 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 backdrop-blur-md placeholder-gray-400 hover:bg-white dark:hover:bg-gray-800"
              >
              <button 
                v-if="wikidataSearchQuery" 
                @click.prevent="clearWikidataSearch"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              
              <!-- Suggestions Dropdown -->
              <transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-2"
              >
                <ul v-if="wikidataSuggestions.length > 0 && !isSearchingWikidata" class="absolute bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl mt-2 max-h-60 overflow-y-auto w-full z-50 py-1 divide-y divide-gray-100 dark:divide-gray-700">
                  <li
                    v-for="suggestion in wikidataSuggestions"
                    :key="suggestion.id"
                    @click="selectWikidataEntity(suggestion)"
                    class="py-3 px-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition-colors flex flex-col"
                  >
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ suggestion.label }}</span>
                    <span v-if="suggestion.description" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{{ suggestion.description }}</span>
                  </li>
                </ul>
              </transition>
            </div>
            <p v-if="wikidataError" class="mt-2 text-sm text-red-500">{{ wikidataError }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-7">
            <!-- Timer Type -->
            <div class="form-group relative">
              <label for="type" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">{{ $t('form.type') }}</label>
              <div class="relative">
                <select
                  id="type"
                  v-model="newTimer.type"
                  required
                  class="w-full py-3.5 pl-4 pr-10 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none transition-all duration-300 backdrop-blur-md hover:bg-white dark:hover:bg-gray-800"
                >
                  <option value="" disabled>{{ $t('form.typePlaceholder') }}</option>
                  <option value="event">{{ $t('form.typeEvent') }}</option>
                  <option value="deadline">{{ $t('form.typeDeadline') }}</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <!-- Name -->
            <div class="form-group relative">
              <label for="name" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">{{ $t('form.name') }}</label>
              <input
                id="name"
                v-model="newTimer.name"
                type="text"
                required
                :placeholder="$t('form.namePlaceholder')"
                class="w-full py-3.5 px-4 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 backdrop-blur-md placeholder-gray-400 hover:bg-white dark:hover:bg-gray-800"
              >
            </div>
          </div>

          <!-- Link -->
          <div class="form-group relative">
            <label for="link" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">{{ $t('form.link') }}</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
              </div>
              <input
                id="link"
                v-model="newTimer.link"
                type="url"
                required
                :placeholder="$t('form.linkPlaceholder')"
                class="w-full py-3.5 pl-11 pr-4 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 backdrop-blur-md placeholder-gray-400 hover:bg-white dark:hover:bg-gray-800"
              >
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-7">
            <!-- Time -->
            <div class="form-group relative">
              <label for="time" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">{{ $t('form.dateTime') }}</label>
              <input
                id="time"
                v-model="newTimer.time"
                type="datetime-local"
                required
                class="w-full py-3.5 px-4 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 backdrop-blur-md hover:bg-white dark:hover:bg-gray-800"
              >
            </div>

            <!-- Time Zone -->
            <div class="form-group relative">
              <label for="timeZone" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">{{ $t('form.timeZone') }}</label>
              <div class="relative">
                <select
                  id="timeZone"
                  v-model="newTimer.timeZone"
                  required
                  class="w-full py-3.5 pl-4 pr-10 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none transition-all duration-300 backdrop-blur-md hover:bg-white dark:hover:bg-gray-800"
                >
                  <option value="" disabled>{{ $t('form.timeZonePlaceholder') }}</option>
                  <option value="UTC-12:00">UTC-12:00</option>
                  <option value="UTC-11:00">UTC-11:00</option>
                  <!-- ... timezones code remains mostly unaffected conceptually by translation of string ... -->
                  <option value="UTC-10:00">UTC-10:00</option>
                  <option value="UTC-09:30">UTC-09:30</option>
                  <option value="UTC-09:00">UTC-09:00</option>
                  <option value="UTC-08:00">UTC-08:00</option>
                  <option value="UTC-07:00">UTC-07:00</option>
                  <option value="UTC-06:00">UTC-06:00</option>
                  <option value="UTC-05:00">UTC-05:00</option>
                  <option value="UTC-04:00">UTC-04:00</option>
                  <option value="UTC-03:30">UTC-03:30</option>
                  <option value="UTC-03:00">UTC-03:00</option>
                  <option value="UTC-02:00">UTC-02:00</option>
                  <option value="UTC-01:00">UTC-01:00</option>
                  <option value="UTC+00:00">UTC+00:00</option>
                  <option value="UTC+01:00">UTC+01:00</option>
                  <option value="UTC+02:00">UTC+02:00</option>
                  <option value="UTC+03:00">UTC+03:00</option>
                  <option value="UTC+03:30">UTC+03:30</option>
                  <option value="UTC+04:00">UTC+04:00</option>
                  <option value="UTC+04:30">UTC+04:30</option>
                  <option value="UTC+05:00">UTC+05:00</option>
                  <option value="UTC+05:30">UTC+05:30</option>
                  <option value="UTC+05:45">UTC+05:45</option>
                  <option value="UTC+06:00">UTC+06:00</option>
                  <option value="UTC+06:30">UTC+06:30</option>
                  <option value="UTC+07:00">UTC+07:00</option>
                  <option value="UTC+08:00">UTC+08:00</option>
                  <option value="UTC+08:45">UTC+08:45</option>
                  <option value="UTC+09:00">UTC+09:00</option>
                  <option value="UTC+09:30">UTC+09:30</option>
                  <option value="UTC+10:00">UTC+10:00</option>
                  <option value="UTC+10:30">UTC+10:30</option>
                  <option value="UTC+11:00">UTC+11:00</option>
                  <option value="UTC+12:00">UTC+12:00</option>
                  <option value="UTC+12:45">UTC+12:45</option>
                  <option value="UTC+13:00">UTC+13:00</option>
                  <option value="UTC+14:00">UTC+14:00</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-7">
            <!-- Region -->
            <div class="form-group relative">
              <label for="region" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">{{ $t('form.region') }}</label>
              <div class="relative">
                <select
                  id="region"
                  v-model="newTimer.region"
                  required
                  class="w-full py-3.5 pl-4 pr-10 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none transition-all duration-300 backdrop-blur-md hover:bg-white dark:hover:bg-gray-800"
                >
                  <option value="" disabled>{{ $t('form.regionPlaceholder') }}</option>
                  <option value="ESEAP: East and Southeast Asia, and the Pacific region">ESEAP</option>
                  <option value="SAARC: South Asia">SAARC</option>
                  <option value="MENA: Middle East and North Africa">MENA</option>
                  <option value="Indaba: Africa">Indaba</option>
                  <option value="CEE and CA: Central and Eastern Europe and Central Asia">CEE & CA</option>
                  <option value="Northern and Western Europe">Northern & Western Europe</option>
                  <option value="Latin America and the Caribbean">Latin America & Caribbean</option>
                  <option value="North America">North America</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <!-- Country -->
            <div class="form-group relative z-30">
              <label for="country" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">{{ $t('form.country') }}</label>
              <div class="relative">
                <input
                  id="country"
                  v-model="newTimer.country"
                  @input="filterCountries"
                  type="text"
                  required
                  :placeholder="$t('form.countryPlaceholder')"
                  class="w-full py-3.5 px-4 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 backdrop-blur-md placeholder-gray-400 hover:bg-white dark:hover:bg-gray-800"
                >
                <transition
                  enter-active-class="transition duration-200 ease-out"
                  enter-from-class="opacity-0 translate-y-2"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition duration-150 ease-in"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 translate-y-2"
                >
                  <ul v-if="filteredCountries.length" class="absolute bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl mt-2 max-h-60 overflow-y-auto w-full z-50 py-1 divide-y divide-gray-100 dark:divide-gray-700">
                    <li
                      v-for="country in filteredCountries"
                      :key="country"
                      @click="selectCountry(country)"
                      class="py-3 px-4 hover:bg-primary-50 dark:hover:bg-gray-700 cursor-pointer transition-colors text-sm"
                    >
                      {{ country }}
                    </li>
                  </ul>
                </transition>
              </div>
            </div>
          </div>

          <!-- Logo -->
          <div class="form-group relative">
            <label for="logo" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">{{ $t('form.logo') }}</label>
            <div class="flex gap-4 items-start sm:items-center flex-col sm:flex-row">
              <div class="relative flex-1 w-full">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
                </div>
                <input
                  id="logo"
                  v-model="newTimer.logo"
                  @input="validateLogo"
                  type="url"
                  :placeholder="$t('form.logoPlaceholder')"
                  class="w-full py-3.5 pl-11 pr-4 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 backdrop-blur-md placeholder-gray-400 hover:bg-white dark:hover:bg-gray-800"
                >
              </div>
              <div class="w-24 h-24 sm:w-16 sm:h-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center flex-shrink-0 overflow-hidden backdrop-blur-sm self-center sm:self-auto">
                <img v-if="newTimer.logo && !logoError" :src="newTimer.logo" alt="Preview" class="w-full h-full object-contain p-2">
                <svg v-else class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
              </div>
            </div>
            <p v-if="logoError" class="mt-2 text-sm text-red-500 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {{ $t('form.logoInvalid') }}
            </p>
          </div>
          
          <div class="pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              type="submit"
              class="relative w-full inline-flex items-center justify-center px-8 py-4 overflow-hidden font-bold text-white rounded-2xl shadow-lg group bg-gradient-to-br from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-primary-500/50 text-lg tracking-wide"
            >
              <span class="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-[120%] group-hover:h-56 opacity-10"></span>
              <span class="relative flex items-center gap-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                {{ $t('form.submit') }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import Footer from './Footer.vue'

export default {
  components: {
    Footer
  },
  data() {
    return {
      newTimer: {
        type: '',
        name: '',
        link: '',
        time: '',
        region: '',
        country: '',
        timeZone: '',
        logo: ''
      },
      successMessage: '',
      logoError: false,
      countries: [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", 
        "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", 
        "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", 
        "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the", 
        "Congo, Republic of the", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", 
        "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", 
        "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", 
        "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", 
        "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", 
        "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", 
        "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", 
        "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", 
        "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", 
        "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", 
        "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", 
        "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", 
        "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", 
        "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", 
        "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", 
        "Vietnam", "Yemen", "Zambia", "Zimbabwe"
      ],
      filteredCountries: [],
      
      // Wikidata Search State
      wikidataSearchQuery: '',
      wikidataSuggestions: [],
      isSearchingWikidata: false,
      wikidataError: '',
      searchTimeout: null
    };
  },
  methods: {
    async addTimer() {
      try {
        const response = await fetch('/add-timer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.newTimer)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const responseText = await response.text();
        console.log('Server response:', responseText);

        try {
          const data = JSON.parse(responseText);
          this.successMessage = data.message;
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          throw new Error('Invalid JSON response from server');
        }
      } catch (error) {
        console.error('Error adding timer:', error);
      }
    },
    validateLogo() {
      const img = new Image();
      img.onload = () => {
        this.logoError = false;
      };
      img.onerror = () => {
        this.logoError = true;
      };
      img.src = this.newTimer.logo;
    },
    filterCountries() {
      const searchTerm = this.newTimer.country.toLowerCase();
      if (searchTerm) {
        this.filteredCountries = this.countries.filter(country => country.toLowerCase().includes(searchTerm));
      } else {
        this.filteredCountries = [];
      }
    },
    selectCountry(country) {
      this.newTimer.country = country;
      this.filteredCountries = [];
    },
    goToTimers() {
      this.$router.push('/');
    },
    
    // Wikidata Methods
    handleWikidataInput() {
      clearTimeout(this.searchTimeout);
      this.wikidataError = '';
      
      if (!this.wikidataSearchQuery || this.wikidataSearchQuery.trim().length < 2) {
        this.wikidataSuggestions = [];
        return;
      }
      
      this.isSearchingWikidata = true;
      this.searchTimeout = setTimeout(() => {
        this.fetchWikidataSuggestions();
      }, 500); // 500ms debounce
    },
    
    async fetchWikidataSuggestions() {
      try {
        const query = encodeURIComponent(this.wikidataSearchQuery.trim());
        const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${query}&language=en&format=json&origin=*`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        if (data && data.search) {
          this.wikidataSuggestions = data.search;
        } else {
          this.wikidataSuggestions = [];
        }
      } catch (error) {
        console.error('Error fetching Wikidata suggestions:', error);
        this.wikidataError = 'Failed to fetch suggestions from Wikidata.';
        this.wikidataSuggestions = [];
      } finally {
        this.isSearchingWikidata = false;
      }
    },
    
    async selectWikidataEntity(entity) {
      this.wikidataSearchQuery = entity.label;
      this.newTimer.name = entity.label;
      this.wikidataSuggestions = [];
      this.isSearchingWikidata = true;
      this.wikidataError = '';
      
      try {
        const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entity.id}&props=claims|sitelinks/urls&format=json&origin=*`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        const details = data.entities[entity.id];
        
        // Form filling logic
        
        // 1. Determine Type (Event vs Deadline)
        // Check for 'instance of' (P31) - if it's an event (Q1190554) or conference (Q2020153)
        // By default we'll assume 'event' for now
        this.newTimer.type = 'event';
        
        // 2. Extract Link
        // Prefer MetaWiki sitelink, then Wikipedia, then fallback to Wikidata item
        if (details.sitelinks) {
          if (details.sitelinks.metawiki && details.sitelinks.metawiki.url) {
            this.newTimer.link = details.sitelinks.metawiki.url;
          } else if (details.sitelinks.enwiki && details.sitelinks.enwiki.url) {
            this.newTimer.link = details.sitelinks.enwiki.url;
          } else {
            this.newTimer.link = `https://www.wikidata.org/wiki/${entity.id}`;
          }
        } else {
          this.newTimer.link = `https://www.wikidata.org/wiki/${entity.id}`;
        }
        
        // 3. Extract Time
        // Check P580 (start time) or P582 (end time) or P585 (point in time)
        const timeClaim = details.claims.P580 || details.claims.P585 || details.claims.P582;
        if (timeClaim && timeClaim[0]?.mainsnak?.datavalue?.value?.time) {
          // Wikidata time format: "+YYYY-MM-DDThh:mm:ssZ"
          let rawTime = timeClaim[0].mainsnak.datavalue.value.time;
          // Strip the leading '+' and 'Z' if present, then format for datetime-local
          rawTime = rawTime.replace(/^\+/, '').replace(/Z$/, '');
          
          // Ensure it's in YYYY-MM-DDThh:mm format for the input
          const dateObj = new Date(rawTime);
          if (!isNaN(dateObj.getTime())) {
            // ISO string is usually something like 2024-08-07T00:00:00.000Z
            this.newTimer.time = dateObj.toISOString().slice(0, 16);
          }
        }
        
        // Note: Extracting Country (P17) requires another API call to resolve the country Q-node to a string label
        // We will skip that for simplicity in this script, relying on user manual selection instead.

      } catch (error) {
        console.error('Error fetching Wikidata details:', error);
        this.wikidataError = 'Failed to fetch full details from Wikidata.';
      } finally {
        this.isSearchingWikidata = false;
      }
    },
    
    clearWikidataSearch() {
      this.wikidataSearchQuery = '';
      this.wikidataSuggestions = [];
      this.wikidataError = '';
    }
  }
};
</script>

<style scoped>
.form-group {
  @apply transition-all duration-200;
}

.form-group:focus-within {
  @apply transform scale-105;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
