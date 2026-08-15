<template>
  <div class="container mx-auto p-2 sm:p-6 w-full max-w-none">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 px-2">
      <div class="flex items-center gap-3 w-full sm:w-auto flex-1">
        <input 
          id="search-input"
          type="text" 
          v-model="filters.searchQuery" 
          :placeholder="$t('timers.search')"
          class="text-3xl sm:text-4xl font-extrabold tracking-tight text-gradient drop-shadow-sm bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 caret-primary-500 w-full sm:w-80 min-w-[200px] p-0 transition-opacity duration-300"
          :class="{ 'animate-pulse opacity-80': !filters.searchQuery }"
        >
      </div>
      <div class="flex items-center gap-4">
        <router-link 
          to="/add" 
          class="relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-medium text-white rounded-xl shadow-md group bg-gradient-to-br from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 transition-all duration-300"
        >
          <span class="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          <span class="relative">{{ $t('app.addTimer') }}</span>
        </router-link>
        
        <button 
          v-if="isAuthenticated"
          @click="logout"
          :disabled="isLoading"
          class="flex items-center px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 font-medium shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Logout <span class="opacity-70 font-normal ml-1">({{ user?.username }})</span>
        </button>
        <button 
          v-else
          @click="login"
          :disabled="isLoading"
          class="flex items-center px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 font-medium shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ $t('app.login') }}
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="authError" class="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm flex items-center justify-between">
      <div class="flex items-center">
        <svg class="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>{{ authError }}</p>
      </div>
      <button @click="authError = null" class="text-red-500 hover:text-red-700 focus:outline-none p-1 rounded-md hover:bg-red-200 transition-colors" aria-label="Close error message">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>

    <!-- Filters Bar - Glassmorphic -->
    <div class="mb-10 w-full glass-panel !bg-white/60 dark:!bg-gray-900/60 rounded-2xl p-4 sm:p-6 transition-all duration-300 relative z-20">
      <!-- Mobile Filters -->
      <div class="flex flex-col gap-4 md:hidden">
        <div class="grid grid-cols-1 gap-4">
          <select 
            id="region" 
            v-model="filters.region" 
            @change="applyFilters" 
            class="w-full py-2.5 px-4 rounded-xl border-0 bg-white/50 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-primary-500 appearance-none backdrop-blur-md"
          >
            <option value="">All Regions</option>
            <option v-for="region in uniqueRegions" :key="region" :value="region">{{ region }}</option>
          </select>
          <select 
            id="country" 
            v-model="filters.country" 
            @change="applyFilters" 
            class="w-full py-2.5 px-4 rounded-xl border-0 bg-white/50 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-primary-500 appearance-none backdrop-blur-md"
          >
            <option value="">All Countries</option>
            <option v-for="country in uniqueCountries" :key="country" :value="country">{{ country }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <select 
            id="type" 
            v-model="filters.type" 
            @change="applyFilters" 
            class="w-full py-2.5 px-4 rounded-xl border-0 bg-white/50 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-primary-500 appearance-none backdrop-blur-md"
          >
            <option value="">All Types</option>
            <option value="event">Event</option>
            <option value="deadline">Deadline</option>
          </select>
          <select 
            id="timeStatus" 
            v-model="filters.timeStatus" 
            @change="applyFilters" 
            class="w-full py-2.5 px-4 rounded-xl border-0 bg-white/50 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-primary-500 appearance-none backdrop-blur-md"
          >
            <option value="upcoming">Upcoming Events</option>
            <option value="past">Past Events</option>
            <option value="all">All Events</option>
          </select>
          <select 
            id="sort" 
            v-model="filters.sort" 
            @change="applyFilters" 
            class="w-full py-2.5 px-4 rounded-xl border-0 bg-white/50 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-primary-500 appearance-none backdrop-blur-md"
          >
            <option value="desc">Recent First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
        <div class="flex justify-center gap-4 mt-2">
          <button 
            @click="pinFilters" 
            :class="isPinned ? 'bg-green-500 text-white shadow-green-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'" 
            class="flex-1 py-2.5 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 font-medium transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg v-if="isPinned" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path></svg>
            {{ isPinned ? 'Pinned' : 'Pin View' }}
          </button>
          <button 
            @click="resetFilters" 
            class="flex-1 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 hover:bg-red-100 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 font-medium transition-all duration-300"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Desktop Filters -->
      <div class="hidden md:flex items-center gap-4 relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
        </div>
        <select 
          id="region" 
          v-model="filters.region" 
          @change="applyFilters" 
          class="flex-1 py-2.5 pl-10 pr-8 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 container-query cursor-pointer"
        >
          <option value="">All Topics / Regions</option>
          <option v-for="region in uniqueRegions" :key="region" :value="region">{{ region }}</option>
        </select>

        <select 
          id="wiki" 
          v-model="filters.wiki" 
          @change="applyFilters" 
          class="flex-1 py-2.5 px-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer"
        >
          <option value="">All Wiki Projects</option>
          <option v-for="wiki in uniqueWikis" :key="wiki" :value="wiki">{{ wiki }}</option>
        </select>
        
        <select 
          id="country" 
          v-model="filters.country" 
          @change="applyFilters" 
          class="flex-1 py-2.5 px-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer"
        >
          <option value="">All Locations</option>
          <option v-for="country in uniqueCountries" :key="country" :value="country">{{ country }}</option>
        </select>
        
        <select 
          id="type" 
          v-model="filters.type" 
          @change="applyFilters" 
          class="flex-1 py-2.5 px-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer"
        >
          <option value="">All Types</option>
          <option value="event">Event</option>
          <option value="deadline">Deadline</option>
        </select>
        
        <select 
          id="timeStatus" 
          v-model="filters.timeStatus" 
          @change="applyFilters" 
          class="flex-1 py-2.5 px-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer"
        >
          <option value="upcoming">Upcoming Events</option>
          <option value="past">Past Events</option>
          <option value="all">All Events</option>
        </select>
        
        <select 
          id="sort" 
          v-model="filters.sort" 
          @change="applyFilters" 
          class="flex-1 py-2.5 px-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer"
        >
          <option value="asc">Upcoming Soonest</option>
          <option value="desc">Latest First</option>
        </select>
        
        <div class="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-4">
          <button 
            @click="pinFilters" 
            :class="isPinned ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'" 
            class="p-2.5 rounded-xl transition-all duration-300"
            :title="isPinned ? 'Filters Pinned' : 'Pin Filters'"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path></svg>
          </button>
          <button 
            @click="resetFilters" 
            class="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300"
            title="Reset Filters"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Skeleton State -->
    <div v-if="isLoadingEvents" class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 animate-pulse">
      <div v-for="n in 8" :key="n" class="glass-card bg-white/50 dark:bg-gray-900/50 rounded-2xl p-6 flex flex-col gap-4 border border-gray-200/50 dark:border-gray-800">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
          </div>
        </div>
        <div class="h-6 bg-gray-200 dark:bg-gray-800 rounded-md w-1/3"></div>
        <div class="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
          <div class="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <transition
      v-else
      enter-active-class="transition-opacity duration-500"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="sortedFilteredEvents.length === 0" class="mt-8 flex justify-center">
        <div class="glass-panel p-8 rounded-2xl max-w-lg text-center flex flex-col items-center">
          <div class="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 class="text-xl font-bold mb-2">{{ $t('timers.noTimers') }}</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">{{ $t('timers.noTimersDesc') }}</p>
          <router-link to="/add" class="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md font-medium transition-colors">{{ $t('timers.createNew') }}</router-link>
        </div>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        <transition-group name="list">
          <div
            v-for="(event, index) in sortedFilteredEvents"
            :key="event.id || (event.name + event.time)"
            class="glass-card !bg-white/80 dark:!bg-gray-900 rounded-2xl p-6 flex flex-col justify-between gap-5 cursor-pointer relative overflow-hidden group border-t-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            :class="event.type === 'event' ? 'border-t-blue-500' : 'border-t-purple-500'"
            @click="viewEvent(event)"
          >
            <!-- Background Glow Effect on Hover -->
            <div class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                 :class="event.type === 'event' ? 'from-blue-400 to-indigo-600' : 'from-purple-400 to-pink-600'"></div>
            
            <div>
              <div class="flex items-start gap-4 relative z-10">
                <div class="flex-shrink-0 w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 shadow-sm overflow-hidden flex items-center justify-center">
                  <img :src="getEventLogo(event)" :alt="event.name" class="w-full h-full object-contain" @error="$event.target.src=fallbackLogo" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start">
                    <h3 class="font-bold text-base sm:text-lg leading-snug line-clamp-2 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" :title="event.name">
                      {{ event?.name }}
                    </h3>
                    <button 
                      v-if="!event.isMeta && user && (user.id === event.creatorId || user.isAdmin)"
                      @click.stop="deleteEvent(event.id)"
                      class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-2 flex-shrink-0 z-20"
                      title="Delete Timer"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                  <p v-if="event.creator?.username" class="text-xs text-primary-600 dark:text-primary-400 font-medium truncate mt-0.5">Added by {{ event.creator.username }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{{ event?.region }}</p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 truncate">{{ event?.country }}</p>
                </div>
              </div>
              
              <div class="flex flex-wrap gap-2 items-center relative z-10 mt-4">
                <span 
                  class="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider shadow-sm border"
                  :class="event.type === 'event' ? 'bg-blue-50/80 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300' : 'bg-purple-50/80 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-300'"
                >
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5 self-center inline-block" :class="event.type === 'event' ? 'bg-blue-500' : 'bg-purple-500'"></span>
                  {{ event.type }}
                </span>
                <span
                  v-if="isOngoing(event)"
                  class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider shadow-sm border bg-amber-50/80 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300 animate-pulse"
                  title="Event is currently happening"
                >
                  Ongoing
                </span>
                <span
                  v-if="event.isMeta"
                  class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider shadow-sm border bg-emerald-50/80 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300"
                  title="Imported from Meta-Wiki (Special:AllEvents)"
                >
                  Meta
                </span>
                <a v-if="event && event.link" :href="event.link" target="_blank" rel="noopener" class="ml-auto inline-flex items-center text-xs font-medium text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors bg-white/50 dark:bg-gray-800/50 py-1 px-2 rounded-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm hover:shadow-sm" @click.stop>
                  Link
                  <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
              </div>
            </div>
            
            <div class="pt-4 border-t border-gray-100 dark:border-gray-700/50 relative z-10">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  {{ isOngoing(event) ? 'Ends in' : (isPast(event) ? 'Status' : 'Starts in') }}
                </span>
                <span class="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">{{ event?.timeZone }}</span>
              </div>
              <div class="flex items-end gap-2">
                <span class="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{{ formatEventDates(event) }}</span>
              </div>
              <div class="mt-1 font-mono text-sm tracking-wider tabular-nums font-bold" :class="isOngoing(event) ? 'text-amber-600 dark:text-amber-400' : (event.type === 'event' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400')">
                {{ formatCountdown(event) }}
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </transition>

    <!-- Timer Detail Responsive Modal with Blurred Backdrop -->
    <teleport to="body">
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="selectedEvent"
          class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          @click.self="closeModal"
        >
          <div
            class="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transform transition-all flex flex-col animate-in fade-in zoom-in-95 duration-200"
            @click.stop
          >
            <!-- Top Gradient Accent -->
            <div
              class="h-3 w-full bg-gradient-to-r"
              :class="selectedEvent.type === 'event' ? 'from-blue-500 via-indigo-500 to-cyan-400' : 'from-purple-500 via-pink-500 to-rose-400'"
            ></div>

            <!-- Close Button -->
            <button
              @click="closeModal"
              class="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-20"
              title="Close modal (Esc)"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div class="p-6 sm:p-8 flex flex-col gap-6">
              <!-- Header with Logo and Title -->
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-16 h-16 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 shadow-sm flex items-center justify-center">
                  <img :src="getEventLogo(selectedEvent)" alt="logo" class="w-full h-full object-contain" @error="$event.target.src=fallbackLogo" />
                </div>
                <div class="flex-1 min-w-0 pr-8">
                  <div class="flex flex-wrap gap-2 items-center mb-2">
                    <span 
                      class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border"
                      :class="selectedEvent.type === 'event' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-300' : 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/40 dark:border-purple-800 dark:text-purple-300'"
                    >
                      {{ selectedEvent.type }}
                    </span>
                    <span
                      v-if="isOngoing(selectedEvent)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-900/40 dark:border-amber-800 dark:text-amber-300 animate-pulse"
                    >
                      Ongoing
                    </span>
                    <span
                      v-if="selectedEvent.isMeta"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-300"
                    >
                      Meta-Wiki
                    </span>
                  </div>
                  <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                    {{ selectedEvent.name }}
                  </h2>
                  <p v-if="selectedEvent.creator?.username" class="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1">
                    Added by {{ selectedEvent.creator.username }}
                  </p>
                </div>
              </div>

              <!-- Large Live Countdown Grid -->
              <div class="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-5 border border-gray-200/60 dark:border-gray-700/60">
                <div class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 text-center">
                  {{ isOngoing(selectedEvent) ? 'Time remaining until event concludes' : (isPast(selectedEvent) ? 'Event has ended' : 'Time remaining until start') }}
                </div>
                <div v-if="!isPast(selectedEvent)" class="grid grid-cols-4 gap-2 sm:gap-4 text-center">
                  <div class="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div class="text-2xl sm:text-4xl font-extrabold text-primary-600 dark:text-primary-400 font-mono">
                      {{ getCountdownParts(selectedEvent).days }}
                    </div>
                    <div class="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Days</div>
                  </div>
                  <div class="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div class="text-2xl sm:text-4xl font-extrabold text-primary-600 dark:text-primary-400 font-mono">
                      {{ String(getCountdownParts(selectedEvent).hours).padStart(2, '0') }}
                    </div>
                    <div class="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Hours</div>
                  </div>
                  <div class="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div class="text-2xl sm:text-4xl font-extrabold text-primary-600 dark:text-primary-400 font-mono">
                      {{ String(getCountdownParts(selectedEvent).minutes).padStart(2, '0') }}
                    </div>
                    <div class="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Minutes</div>
                  </div>
                  <div class="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div class="text-2xl sm:text-4xl font-extrabold text-amber-500 font-mono">
                      {{ String(getCountdownParts(selectedEvent).seconds).padStart(2, '0') }}
                    </div>
                    <div class="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Seconds</div>
                  </div>
                </div>
                <div v-else class="text-center py-4 text-gray-500 dark:text-gray-400 font-semibold text-base sm:text-lg">
                  This event concluded on {{ formatEventDates(selectedEvent) }}
                </div>
              </div>

              <!-- Details Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <div>
                    <div class="text-xs text-gray-400">Date & Duration</div>
                    <div class="font-semibold text-gray-800 dark:text-gray-200">{{ formatEventDates(selectedEvent) }}</div>
                  </div>
                </div>

                <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div class="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <div class="text-xs text-gray-400">Time Zone</div>
                    <div class="font-semibold text-gray-800 dark:text-gray-200">{{ selectedEvent.timeZone || 'UTC' }}</div>
                  </div>
                </div>

                <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div class="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <div>
                    <div class="text-xs text-gray-400">Location / Participation</div>
                    <div class="font-semibold text-gray-800 dark:text-gray-200">
                      {{ selectedEvent.participation || selectedEvent.country || selectedEvent.region || 'Online' }}
                    </div>
                  </div>
                </div>

                <div v-if="selectedEvent.organizers" class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div class="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                  <div class="min-w-0">
                    <div class="text-xs text-gray-400">Organizers</div>
                    <div class="font-semibold text-gray-800 dark:text-gray-200 truncate">{{ selectedEvent.organizers }}</div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-wrap gap-3 pt-2">
                <a
                  v-if="selectedEvent.link"
                  :href="selectedEvent.link"
                  target="_blank"
                  rel="noopener"
                  class="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <span>Open Wiki Page</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>

                <button
                  @click="copyShareLink(selectedEvent)"
                  type="button"
                  class="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl border border-gray-200 dark:border-gray-700 transition-all"
                  title="Copy link to this timer"
                >
                  <svg v-if="!isCopied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                  <svg v-else class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>{{ isCopied ? 'Link Copied!' : 'Share Link' }}</span>
                </button>

                <a
                  :href="getGoogleCalendarUrl(selectedEvent)"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl border border-gray-200 dark:border-gray-700 transition-all"
                  title="Add to Google Calendar"
                >
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <span class="hidden sm:inline">Add to Calendar</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>



<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../store/auth';

const route = useRoute();
const router = useRouter();
const { user, isAuthenticated, isLoading, error: authError, login, logout, checkAuth } = useAuth();

onMounted(() => {
  checkAuth();
  
  // Check for auth error in URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('error') === 'auth_failed') {
    authError.value = 'Authentication failed. Please try again.';
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

const currentTime = ref(new Date());
let timerInterval = null;
const selectedEvent = ref(null);
const isCopied = ref(false);
const isLoadingEvents = ref(true);

const filters = ref({
  searchQuery: '',
  region: '',
  wiki: '',
  country: '',
  type: '',
  timeStatus: 'upcoming',
  sort: 'asc'
});
const isPinned = ref(false);
const fallbackLogo = 'https://upload.wikimedia.org/wikipedia/commons/7/75/Wikimedia_Community_Logo.svg';
const userTimers = ref([]);
const metaEvents = ref([]);

// Official Wikimedia Project Logos
function getEventLogo(event) {
  if (event?.logo) return event.logo;
  const link = (event?.link || event?.wiki || event?.wikiProject || '').toLowerCase();
  if (link.includes('wikidata')) return 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Wikidata-logo.svg';
  if (link.includes('commons')) return 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Commons-logo.svg';
  if (link.includes('wikiquote')) return 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Wikiquote-logo.svg';
  if (link.includes('wikisource')) return 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Wikisource-logo.svg';
  if (link.includes('wiktionary')) return 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Wiktionary-logo.svg';
  if (link.includes('wikivoyage')) return 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Wikivoyage-Logo-v3-icon.svg';
  if (link.includes('wikiversity')) return 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Wikiversity_logo_2017.svg';
  if (link.includes('wikinews')) return 'https://upload.wikimedia.org/wikipedia/commons/2/24/Wikinews-logo.svg';
  if (link.includes('mediawiki')) return 'https://upload.wikimedia.org/wikipedia/commons/a/a6/MediaWiki-2020-icon.svg';
  if (link.includes('wikipedia')) return 'https://upload.wikimedia.org/wikipedia/commons/8/80/Wikipedia-logo-v2.svg';
  return 'https://upload.wikimedia.org/wikipedia/commons/7/75/Wikimedia_Community_Logo.svg';
}

// Combined, read-only-merged view of user-created timers and imported Meta events.
const events = computed(() => [
  ...(Array.isArray(userTimers.value) ? userTimers.value : []),
  ...(Array.isArray(metaEvents.value) ? metaEvents.value : [])
]);

const uniqueRegions = computed(() => {
  return [...new Set(events.value.map(event => event.region).filter(Boolean))].sort();
});

const uniqueWikis = computed(() => {
  return [...new Set(events.value.map(event => event.wikiProject || event.wiki).filter(Boolean))].sort();
});

const uniqueCountries = computed(() => {
  return [...new Set(events.value.map(event => event.country).filter(Boolean))].sort();
});

function isOngoing(event) {
  if (!event || !event.time) return false;
  const now = currentTime.value;
  const startTime = new Date(event.time);
  const endTime = event.endTime ? new Date(event.endTime) : null;
  return startTime <= now && endTime !== null && endTime >= now;
}

function isPast(event) {
  if (!event || !event.time) return false;
  const now = currentTime.value;
  const endTime = event.endTime ? new Date(event.endTime) : new Date(event.time);
  return endTime < now;
}

function isUpcoming(event) {
  if (!event || !event.time) return false;
  const now = currentTime.value;
  const startTime = new Date(event.time);
  return startTime > now;
}

const filteredEvents = computed(() => {
  const query = filters.value.searchQuery.toLowerCase();
  
  return events.value.filter(event => {
    if (!event || typeof event !== 'object' || !event.link || !event.name || !event.time) return false;
    
    let timeStatusMatch = true;
    if (filters.value.timeStatus === 'upcoming') {
      // Show events starting in the future OR currently ongoing
      timeStatusMatch = isUpcoming(event) || isOngoing(event);
    } else if (filters.value.timeStatus === 'past') {
      timeStatusMatch = isPast(event);
    }
    
    const eventWiki = event.wikiProject || event.wiki || '';

    return (
      timeStatusMatch &&
      (!query || event.name.toLowerCase().includes(query)) &&
      (!filters.value.region || event.region === filters.value.region) &&
      (!filters.value.wiki || eventWiki === filters.value.wiki) &&
      (!filters.value.country || event.country === filters.value.country) &&
      (!filters.value.type || event.type === filters.value.type)
    );
  });
});

const sortedFilteredEvents = computed(() => {
  return filteredEvents.value
    .filter(event => event && typeof event === 'object' && event.link && event.name && event.time)
    .sort((a, b) => {
      const dateA = new Date(a.time);
      const dateB = new Date(b.time);
      return filters.value.sort === 'asc' ? dateA - dateB : dateB - dateA;
    });
});

const formattedCurrentTime = computed(() => {
  return currentTime.value.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(',', '').replace(',', ' ').replace(',', '');
});

async function fetchTimers() {
  try {
    const response = await fetch('/timers');
    if (!response.ok) {
      userTimers.value = [];
      return;
    }
    const data = await response.json();
    userTimers.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching timers:', error);
    userTimers.value = [];
  }
}

async function fetchMetaEvents() {
  try {
    const response = await fetch('/meta-events');
    if (!response.ok) {
      metaEvents.value = [];
      return;
    }
    const data = await response.json();
    metaEvents.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching meta events:', error);
    metaEvents.value = [];
  }
}

function showNoTimersAlert() {
  alert('No active event or deadline timers added.');
}

function formatEventDates(event) {
  if (!event || !event.time) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const start = new Date(event.time).toLocaleDateString('en-US', options);
  if (event.endTime) {
    const end = new Date(event.endTime).toLocaleDateString('en-US', options);
    return start === end ? start : `${start} – ${end}`;
  }
  return start;
}

function getCountdownParts(event) {
  if (!event || !event.time) return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: false };
  const now = currentTime.value;
  let target = new Date(event.time);
  
  if (isOngoing(event)) {
    target = new Date(event.endTime);
  } else if (isPast(event)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
  }

  let diff = target - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  diff -= hours * (1000 * 60 * 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  diff -= minutes * (1000 * 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isEnded: false };
}

function formatCountdown(event) {
  if (!event || !event.time) return '';
  const parts = getCountdownParts(event);
  if (parts.isEnded) return 'Event Ended';

  const dStr = parts.days < 10 ? `0${parts.days}` : parts.days;
  const hStr = parts.hours < 10 ? `0${parts.hours}` : parts.hours;
  const minStr = parts.minutes < 10 ? `0${parts.minutes}` : parts.minutes;
  const sStr = parts.seconds < 10 ? `0${parts.seconds}` : parts.seconds;

  return `${dStr}d ${hStr}h ${minStr}m ${sStr}s`;
}

function getGoogleCalendarUrl(event) {
  if (!event || !event.time) return '#';
  try {
    const start = new Date(event.time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(event.endTime || event.time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(event.name || 'Wikimedia Event');
    const targetParam = event.slug || encodeURIComponent(event.id);
    const details = encodeURIComponent(`Wiki Timer: ${window.location.origin}/timer/${targetParam}\n\nEvent Link: ${event.link || ''}`);
    const location = encodeURIComponent(event.country || event.region || 'Online');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  } catch (e) {
    return '#';
  }
}

async function copyShareLink(event) {
  if (!event) return;
  const targetParam = event.slug || encodeURIComponent(event.id);
  const url = `${window.location.origin}/timer/${targetParam}`;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2500);
  } catch (err) {
    console.error('Failed to copy link', err);
  }
}

function viewEvent(event) {
  selectedEvent.value = event;
  const targetParam = event.slug || String(event.id || '');
  if (targetParam && route.params.id !== targetParam) {
    router.push({ name: 'TimerDetail', params: { id: targetParam } });
  }
}

function closeModal() {
  selectedEvent.value = null;
  if (route.name === 'TimerDetail') {
    router.push({ name: 'WikiTimer' });
  }
}

function syncSelectedEventFromRoute() {
  if (route.params.id && events.value.length > 0) {
    const rawTarget = String(route.params.id);
    const targetId = rawTarget.toLowerCase();
    const found = events.value.find(e => 
      (e.slug && e.slug.toLowerCase() === targetId) ||
      String(e.id).toLowerCase() === targetId || 
      String(e.id).toLowerCase() === `meta:${targetId}` ||
      decodeURIComponent(String(e.id)).toLowerCase() === decodeURIComponent(targetId) ||
      (e.name && e.name.toLowerCase() === targetId)
    );
    if (found) {
      selectedEvent.value = found;
    }
  } else if (!route.params.id) {
    selectedEvent.value = null;
  }
}

watch(() => route.params.id, () => {
  syncSelectedEventFromRoute();
});

watch(events, () => {
  syncSelectedEventFromRoute();
});

function handleKeyDown(e) {
  if (e.key === 'Escape' && selectedEvent.value) {
    closeModal();
  }
}

function applyFilters() {
  // Triggers computed property
}

function resetFilters() {
  filters.value.searchQuery = '';
  filters.value.region = '';
  filters.value.wiki = '';
  filters.value.country = '';
  filters.value.type = '';
  filters.value.timeStatus = 'upcoming';
  filters.value.sort = 'asc';
  isPinned.value = false;
  localStorage.removeItem('pinnedFilters');
  applyFilters();
}

function pinFilters() {
  isPinned.value = true;
  localStorage.setItem('pinnedFilters', JSON.stringify(filters.value));
}

async function deleteEvent(id) {
  if (!confirm('Are you sure you want to delete this timer?')) return;
  
  try {
    const response = await fetch(`/timers/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      if (selectedEvent.value && selectedEvent.value.id === id) {
        closeModal();
      }
      await fetchTimers(); // Refresh list on success
    } else {
      const data = await response.json();
      authError.value = data.message || 'Failed to delete timer';
    }
  } catch (error) {
    console.error('Error deleting timer:', error);
    authError.value = 'Failed to delete timer. Check your connection.';
  }
}

function updateTime() {
  currentTime.value = new Date();
}

function loadPinnedFilters() {
  const pinnedFilters = localStorage.getItem('pinnedFilters');
  if (pinnedFilters) {
    filters.value = JSON.parse(pinnedFilters);
    isPinned.value = true;
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown);
  updateTime();
  timerInterval = setInterval(updateTime, 1000);
  loadPinnedFilters();
  
  isLoadingEvents.value = true;
  try {
    await Promise.all([fetchTimers(), fetchMetaEvents()]);
  } finally {
    isLoadingEvents.value = false;
    syncSelectedEventFromRoute();
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});
</script>

<style scoped>
</style>
