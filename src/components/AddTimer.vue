<template>
  <div class="container mx-auto px-4 sm:px-6 py-8">
    <div class="max-w-2xl mx-auto glass-panel rounded-3xl overflow-hidden backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl transition-all duration-500 hover:shadow-primary-500/10 relative z-20">
      
      <!-- Decorative background elements inside card -->
      <div class="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div class="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      
      <!-- Header -->
      <div class="relative bg-white/40 dark:bg-gray-900/40 p-8 sm:p-10 border-b border-white/20 dark:border-gray-700/50 backdrop-blur-md">
        <div class="relative z-10">
          <router-link to="/" class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors mb-6 group">
            <svg class="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            {{ $t('app.backToTimers') }}
          </router-link>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 mb-2 tracking-tight">
            {{ $t('form.title') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-300 text-sm sm:text-base font-medium">
            {{ $t('form.subtitle') }}
          </p>

          <!-- User Status Badge -->
          <div v-if="isAuthenticated && user" class="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Logged in as <strong>User:{{ user.username }}</strong></span>
          </div>
        </div>
      </div>
      
      <div class="p-8 sm:p-10 relative z-10 bg-white/50 dark:bg-gray-800/50">
        
        <!-- Not Logged In Warning Banner -->
        <div v-if="!isAuthenticated" class="mb-8 p-6 bg-amber-50/90 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/60 rounded-2xl shadow-sm backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-300 mt-0.5 sm:mt-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <div>
              <h4 class="font-bold text-amber-900 dark:text-amber-200 text-base">Authentication Required</h4>
              <p class="text-sm text-amber-800 dark:text-amber-300 mt-0.5">Please log in with your Wikimedia account to add and manage timers.</p>
            </div>
          </div>
          <button 
            @click="login" 
            type="button"
            class="w-full sm:w-auto px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-md transition-all font-semibold whitespace-nowrap hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span>Log in with Wikimedia</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>

        <!-- Success Message -->
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
            <button @click="goToTimers" class="w-full sm:w-auto px-5 py-2.5 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-xl shadow-md transition-all duration-300 font-medium whitespace-nowrap hover:shadow-lg">
              {{ $t('app.viewDashboard') }}
            </button>
          </div>
        </transition>

        <!-- Form (Disabled if not logged in) -->
        <form @submit.prevent="addTimer" class="space-y-6" :class="{ 'opacity-50 pointer-events-none': !isAuthenticated }">
          
          <!-- Wikidata Auto-fill -->
          <div class="glass-panel !bg-indigo-50/50 dark:!bg-indigo-900/10 border-indigo-100 dark:border-indigo-800/30 p-5 rounded-2xl mb-2 relative">
            <label for="wikidata-search" class="flex items-center text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2 ml-1">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Auto-fill from Wikidata (Optional)
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
                :disabled="!isAuthenticated"
                type="text"
                placeholder="Search Wikidata entities (e.g., Wikimania 2026)..."
                class="w-full py-3.5 pl-11 pr-10 bg-white/80 dark:bg-gray-900/80 border border-indigo-200 dark:border-indigo-700/50 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 backdrop-blur-md placeholder-gray-400"
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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Timer Type (Required) -->
            <div class="form-group relative">
              <label for="type" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {{ $t('form.type') }} <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                  id="type"
                  v-model="newTimer.type"
                  required
                  :disabled="!isAuthenticated"
                  class="w-full py-3.5 pl-4 pr-10 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none transition-all"
                >
                  <option value="" disabled>{{ $t('form.typePlaceholder') }}</option>
                  <option value="event">Event (e.g. Conference, Edit-a-thon)</option>
                  <option value="deadline">Deadline (e.g. Submission, Registration)</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <!-- Name (Required) -->
            <div class="form-group relative">
              <label for="name" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {{ $t('form.name') }} <span class="text-red-500">*</span>
              </label>
              <input
                id="name"
                v-model="newTimer.name"
                type="text"
                required
                :disabled="!isAuthenticated"
                :placeholder="$t('form.namePlaceholder')"
                class="w-full py-3.5 px-4 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
            </div>
          </div>

          <!-- Link (Required) -->
          <div class="form-group relative">
            <label for="link" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
              {{ $t('form.link') }} <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
              </div>
              <input
                id="link"
                v-model="newTimer.link"
                type="url"
                required
                :disabled="!isAuthenticated"
                placeholder="https://meta.wikimedia.org/wiki/..."
                class="w-full py-3.5 pl-11 pr-4 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Start Date & Time (Required) -->
            <div class="form-group relative">
              <label for="time" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                Start Date & Time <span class="text-red-500">*</span>
              </label>
              <input
                id="time"
                v-model="newTimer.time"
                type="datetime-local"
                required
                :disabled="!isAuthenticated"
                class="w-full py-3.5 px-4 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
            </div>

            <!-- End Date & Time (Optional) -->
            <div class="form-group relative">
              <label for="endTime" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                End Date & Time <span class="text-xs font-normal text-gray-400">(Optional)</span>
              </label>
              <input
                id="endTime"
                v-model="newTimer.endTime"
                type="datetime-local"
                :disabled="!isAuthenticated"
                class="w-full py-3.5 px-4 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Time Zone (Required) -->
            <div class="form-group relative">
              <label for="timeZone" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {{ $t('form.timeZone') }} <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                  id="timeZone"
                  v-model="newTimer.timeZone"
                  required
                  :disabled="!isAuthenticated"
                  class="w-full py-3.5 pl-4 pr-10 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none transition-all"
                >
                  <option value="" disabled>{{ $t('form.timeZonePlaceholder') }}</option>
                  <option value="UTC+00:00">UTC+00:00 (Coordinated Universal Time)</option>
                  <option value="UTC+01:00">UTC+01:00 (Central European Time, West Africa)</option>
                  <option value="UTC+02:00">UTC+02:00 (Eastern European Time, Central Africa)</option>
                  <option value="UTC+03:00">UTC+03:00 (East Africa Time, Moscow)</option>
                  <option value="UTC+05:30">UTC+05:30 (India Standard Time)</option>
                  <option value="UTC+06:00">UTC+06:00 (Bangladesh, Central Asia)</option>
                  <option value="UTC+07:00">UTC+07:00 (Indochina, Western Indonesia)</option>
                  <option value="UTC+08:00">UTC+08:00 (China, Singapore, Western Australia)</option>
                  <option value="UTC+09:00">UTC+09:00 (Japan, Korea)</option>
                  <option value="UTC+10:00">UTC+10:00 (Eastern Australia)</option>
                  <option value="UTC-04:00">UTC-04:00 (Atlantic Standard Time, Chile)</option>
                  <option value="UTC-05:00">UTC-05:00 (Eastern Standard Time, Colombia)</option>
                  <option value="UTC-06:00">UTC-06:00 (Central Standard Time, Mexico)</option>
                  <option value="UTC-07:00">UTC-07:00 (Mountain Standard Time)</option>
                  <option value="UTC-08:00">UTC-08:00 (Pacific Standard Time)</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <!-- Organizers / Affiliates (Optional) -->
            <div class="form-group relative">
              <label for="organizers" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                Organizers / Affiliates <span class="text-xs font-normal text-gray-400">(Optional)</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <input
                  id="organizers"
                  v-model="newTimer.organizers"
                  type="text"
                  :disabled="!isAuthenticated"
                  placeholder="e.g. Wikimedia Nigeria, Wiki Women UG, User:Organizer"
                  class="w-full py-3.5 pl-11 pr-4 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
              </div>
            </div>
          </div>

          <!-- Participation Format & Tags Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Event Format / Participation -->
            <div class="form-group relative">
              <label for="participation" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                Event Format <span class="text-xs font-normal text-gray-400">(In-person / Online)</span>
              </label>
              <div class="relative">
                <select
                  id="participation"
                  v-model="newTimer.participation"
                  :disabled="!isAuthenticated"
                  class="w-full py-3.5 pl-4 pr-10 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none transition-all"
                >
                  <option value="Hybrid">🌐 Hybrid (In-person & Online Streaming)</option>
                  <option value="In-person">📍 In-person Only</option>
                  <option value="Online">💻 Online / Virtual Only</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <!-- Scope / Region -->
            <div class="form-group relative">
              <label for="region" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                Event Scope / Region <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                  id="region"
                  v-model="newTimer.region"
                  required
                  :disabled="!isAuthenticated"
                  class="w-full py-3.5 pl-4 pr-10 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none transition-all"
                >
                  <option value="Global">🌍 Global / Worldwide (e.g. Wikimania, Hackathon)</option>
                  <option value="Africa">Africa</option>
                  <option value="Asia">Asia</option>
                  <option value="Europe">Europe</option>
                  <option value="Latin America">Latin America & Caribbean</option>
                  <option value="North America">North America</option>
                  <option value="Oceania">Oceania / Pacific</option>
                  <option value="MENA">Middle East & North Africa</option>
                  <option value="CEE & CA">Central & Eastern Europe & Central Asia</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Location / Host City & Country -->
          <div class="form-group relative z-30">
            <div class="flex items-center justify-between mb-1.5 ml-1">
              <label for="country" class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Host Location / City & Country <span class="text-red-500">*</span>
              </label>
              <span class="text-xs text-primary-600 dark:text-primary-400 font-medium">Auto-mapped on Globe 🗺️</span>
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <input
                id="country"
                v-model="newTimer.country"
                @input="filterCountries"
                type="text"
                required
                :disabled="!isAuthenticated"
                placeholder="e.g. Katowice, Poland or Nairobi, Kenya or Online"
                class="w-full py-3.5 pl-11 pr-4 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                    v-for="c in filteredCountries"
                    :key="c"
                    @click="selectCountry(c)"
                    class="py-3 px-4 hover:bg-primary-50 dark:hover:bg-gray-700 cursor-pointer transition-colors text-sm"
                  >
                    {{ c }}
                  </li>
                </ul>
              </transition>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">
              Tip: For global events (e.g. Wikimania, Hackathon), enter the physical host city & country (e.g. <em>Paris, France</em> or <em>Katowice, Poland</em>) so it pins precisely on the map!
            </p>
          </div>

          <!-- Tags & Topic Categories (1-Click Chips) -->
          <div class="form-group relative">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
              Category Tags & Topics <span class="text-xs font-normal text-gray-400">(Select all that apply)</span>
            </label>
            <div class="flex flex-wrap gap-2 mb-3">
              <button
                v-for="tag in availableTags"
                :key="tag.name"
                type="button"
                @click="toggleFormTag(tag.name)"
                :class="selectedTags.includes(tag.name) ? 'bg-primary-600 text-white shadow-sm border-primary-600' : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'"
                class="px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{{ tag.icon }}</span>
                <span>{{ tag.name }}</span>
                <span v-if="selectedTags.includes(tag.name)" class="ml-0.5">✓</span>
              </button>
            </div>

            <!-- Custom Topic Input -->
            <div class="flex gap-2">
              <input
                v-model="customTagInput"
                @keydown.enter.prevent="addCustomTag"
                type="text"
                :disabled="!isAuthenticated"
                placeholder="Add custom topic/tag (press Enter)..."
                class="flex-1 py-2.5 px-3.5 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs shadow-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
              <button
                type="button"
                @click="addCustomTag"
                class="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-xs border border-gray-200 dark:border-gray-700 transition-all"
              >
                Add Tag
              </button>
            </div>
          </div>

          <!-- Logo URL (Optional) -->
          <div class="form-group relative">
            <label for="logo" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
              Logo / Image URL <span class="text-xs font-normal text-gray-400">(Optional)</span>
            </label>
            <div class="flex gap-4 items-start sm:items-center flex-col sm:flex-row">
              <div class="relative flex-1 w-full">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
                </div>
                <input
                  id="logo"
                  v-model="newTimer.logo"
                  @input="validateLogo"
                  :disabled="!isAuthenticated"
                  type="url"
                  placeholder="https://upload.wikimedia.org/wikipedia/commons/..."
                  class="w-full py-3.5 pl-11 pr-4 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
              </div>
              <div class="w-20 h-20 sm:w-14 sm:h-14 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm self-center sm:self-auto">
                <img v-if="newTimer.logo && !logoError" :src="newTimer.logo" alt="Preview" class="w-full h-full object-contain p-1">
                <svg v-else class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
              </div>
            </div>
            <p v-if="logoError" class="mt-2 text-sm text-red-500 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {{ $t('form.logoInvalid') }}
            </p>
          </div>

          <p v-if="submitError" class="text-sm text-red-500 font-medium p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            {{ submitError }}
          </p>
          
          <div class="pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              type="submit"
              :disabled="!isAuthenticated || isSubmitting"
              class="relative w-full inline-flex items-center justify-center px-8 py-4 overflow-hidden font-bold text-white rounded-2xl shadow-lg bg-gradient-to-br from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-primary-500/50 text-base sm:text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting" class="flex items-center gap-2">
                <svg class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Saving timer...
              </span>
              <span v-else class="flex items-center gap-3">
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

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../store/auth';

const router = useRouter();
const { user, isAuthenticated, login, checkAuth } = useAuth();

const availableTags = [
  { name: 'Wikimania', icon: '🎉' },
  { name: 'Hackathon', icon: '💻' },
  { name: 'Edit-a-thon', icon: '📚' },
  { name: 'Wiki Loves', icon: '📷' },
  { name: 'Conference', icon: '🤝' },
  { name: 'GLAM', icon: '🏛️' },
  { name: 'Education', icon: '🎓' }
];

const selectedTags = ref([]);
const customTagInput = ref('');

function toggleFormTag(tagName) {
  const index = selectedTags.value.indexOf(tagName);
  if (index > -1) {
    selectedTags.value.splice(index, 1);
  } else {
    selectedTags.value.push(tagName);
  }
}

function addCustomTag() {
  const tag = customTagInput.value.trim();
  if (tag && !selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag);
    customTagInput.value = '';
  }
}

const newTimer = ref({
  type: 'event',
  name: '',
  link: '',
  time: '',
  endTime: '',
  region: 'Global',
  country: '',
  timeZone: 'UTC+00:00',
  participation: 'Hybrid',
  topics: '',
  organizers: '',
  logo: ''
});

const successMessage = ref('');
const submitError = ref('');
const isSubmitting = ref(false);
const logoError = ref(false);

const countries = [
  "Online", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", 
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", 
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", 
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", 
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominican Republic", 
  "Ecuador", "Egypt", "El Salvador", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", 
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Guatemala", "Guinea", "Guyana", "Haiti", 
  "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", 
  "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", 
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", 
  "Moldova", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nepal", "Netherlands", "New Zealand", 
  "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Panama", "Papua New Guinea", 
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", 
  "Saudi Arabia", "Senegal", "Serbia", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Somalia", "South Africa", 
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", 
  "Tanzania", "Thailand", "Timor-Leste", "Togo", "Trinidad and Tobago", "Tunisia", "Turkey", "Uganda", "Ukraine", 
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const filteredCountries = ref([]);

// Wikidata Search State
const wikidataSearchQuery = ref('');
const wikidataSuggestions = ref([]);
const isSearchingWikidata = ref(false);
const wikidataError = ref('');
let searchTimeout = null;

onMounted(() => {
  checkAuth();
});

async function addTimer() {
  if (!isAuthenticated.value) {
    submitError.value = 'Please log in with your Wikimedia account first.';
    return;
  }

  submitError.value = '';
  isSubmitting.value = true;

  try {
    newTimer.value.topics = selectedTags.value.join(', ');

    const response = await fetch('/add-timer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTimer.value)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Server error (${response.status})`);
    }

    const data = await response.json();
    successMessage.value = data.message || 'Timer created successfully!';
    selectedTags.value = [];
    customTagInput.value = '';
    newTimer.value = {
      type: 'event',
      name: '',
      link: '',
      time: '',
      endTime: '',
      region: 'Global',
      country: '',
      timeZone: 'UTC+00:00',
      participation: 'Hybrid',
      topics: '',
      organizers: '',
      logo: ''
    };
  } catch (error) {
    console.error('Error adding timer:', error);
    submitError.value = error.message || 'Failed to add timer. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
}

function validateLogo() {
  if (!newTimer.value.logo) {
    logoError.value = false;
    return;
  }
  const img = new Image();
  img.onload = () => {
    logoError.value = false;
  };
  img.onerror = () => {
    logoError.value = true;
  };
  img.src = newTimer.value.logo;
}

function filterCountries() {
  const searchTerm = newTimer.value.country.toLowerCase();
  if (searchTerm) {
    filteredCountries.value = countries.filter(c => c.toLowerCase().includes(searchTerm));
  } else {
    filteredCountries.value = [];
  }
}

function selectCountry(country) {
  newTimer.value.country = country;
  filteredCountries.value = [];
}

function goToTimers() {
  router.push('/');
}

// Wikidata Autocomplete
function handleWikidataInput() {
  clearTimeout(searchTimeout);
  wikidataError.value = '';
  
  if (!wikidataSearchQuery.value || wikidataSearchQuery.value.trim().length < 2) {
    wikidataSuggestions.value = [];
    return;
  }
  
  isSearchingWikidata.value = true;
  searchTimeout = setTimeout(async () => {
    try {
      const query = encodeURIComponent(wikidataSearchQuery.value.trim());
      const endpoint = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${query}&language=en&format=json&origin=*&limit=5&type=item`;
      
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Wikidata search failed');
      
      const data = await res.json();
      wikidataSuggestions.value = (data.search || []).map(item => ({
        id: item.id,
        label: item.label,
        description: item.description || '',
        concepturi: item.concepturi
      }));
    } catch (err) {
      console.error(err);
      wikidataError.value = 'Could not fetch suggestions from Wikidata';
    } finally {
      isSearchingWikidata.value = false;
    }
  }, 350);
}

function clearWikidataSearch() {
  wikidataSearchQuery.value = '';
  wikidataSuggestions.value = [];
  wikidataError.value = '';
}

function selectWikidataEntity(entity) {
  newTimer.value.name = entity.label;
  newTimer.value.link = entity.concepturi;
  clearWikidataSearch();
}
</script>
