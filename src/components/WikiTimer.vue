<template>
  <div class="container mx-auto p-2 sm:p-6 w-full max-w-none">
    <!-- Toolbar -->
    <div class="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 px-2">
      <div class="flex items-center gap-3 w-full md:w-auto flex-1">
        <input 
          id="search-input"
          type="text" 
          v-model="filters.searchQuery" 
          :placeholder="$t('timers.search')"
          class="text-3xl sm:text-4xl font-extrabold tracking-tight text-gradient drop-shadow-sm bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 caret-primary-500 w-full sm:w-80 min-w-[200px] p-0 transition-opacity duration-300"
          :class="{ 'animate-pulse opacity-80': !filters.searchQuery }"
        >
      </div>
      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
        <!-- View Switcher (Grid / Map) -->
        <div class="flex items-center bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-xl border border-gray-200/80 dark:border-gray-700/80">
          <button
            @click="viewMode = 'grid'"
            :class="viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-xs' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all"
            :title="$t('map.gridView')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            <span>{{ $t('map.gridView') }}</span>
          </button>
          <button
            @click="viewMode = 'map'"
            :class="viewMode === 'map' ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-xs' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all"
            :title="$t('map.mapView')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
            <span>{{ $t('map.mapView') }}</span>
          </button>
        </div>

        <router-link 
          to="/add" 
          class="relative inline-flex items-center justify-center px-4 sm:px-5 py-2.5 overflow-hidden font-semibold text-white rounded-xl shadow-md group bg-gradient-to-br from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 transition-all duration-300 text-xs sm:text-sm"
        >
          <span class="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
          <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          <span class="relative">{{ $t('app.addTimer') }}</span>
        </router-link>
        
        <!-- User Profile Pill (Only visible when logged in) -->
        <button 
          v-if="isAuthenticated"
          @click="logout"
          :disabled="isLoading"
          class="flex items-center px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400 font-medium text-xs sm:text-sm shadow-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          :title="`Logged in as ${user?.username}. Click to Logout`"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-500 mr-2 group-hover:bg-red-500 transition-colors"></span>
          <span class="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400">{{ user?.username }}</span>
          <span class="text-xs text-gray-400 ml-1.5 group-hover:text-red-500">(Logout)</span>
        </button>
      </div>
    </div>

    <!-- Quick Category Filter Chips & Right-Aligned Reset Bar -->
    <div class="flex items-center mb-4 gap-2">
      <div class="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs flex-1 py-0.5">
        <button
          v-for="tag in categoryTags"
          :key="tag.id"
          @click="toggleTag(tag.id)"
          :class="selectedTag === tag.id ? 'bg-primary-600 text-white shadow-sm border-primary-600' : 'bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 border-gray-200/80 dark:border-gray-700/80 hover:bg-gray-100 dark:hover:bg-gray-700'"
          class="flex-shrink-0 px-3.5 py-1.5 rounded-full border font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <span>{{ tag.icon }}</span>
          <span>{{ $t(tag.labelKey) }}</span>
        </button>
      </div>

      <!-- Quick Tag Reset Button (Seamlessly aligned with tag pills) -->
      <transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-90" enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-90">
        <button
          v-if="selectedTag !== 'all'"
          @click="selectedTag = 'all'"
          class="flex-shrink-0 px-3 py-1.5 rounded-full border border-red-200 dark:border-red-800/50 bg-red-50/90 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-xs text-xs whitespace-nowrap self-center"
          :title="$t('filters.reset')"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          <span>{{ $t('filters.reset') }}</span>
        </button>
      </transition>
    </div>

    <!-- Mobile Collapsible Filter Trigger Bar -->
    <div class="md:hidden flex items-center gap-2 mb-4">
      <button 
        @click="isMobileFilterOpen = !isMobileFilterOpen" 
        type="button"
        class="flex-1 py-2 px-3.5 bg-white/70 dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/80 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-between shadow-2xs hover:bg-white dark:hover:bg-gray-800 transition-all cursor-pointer"
      >
        <span class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          <span>Advanced Filters</span>
          <span v-if="activeFilterCount > 0" class="px-1.5 py-0.2 rounded-full bg-primary-600 text-white text-[10px] font-bold">
            {{ activeFilterCount }}
          </span>
        </span>
        <span class="text-[11px] text-gray-400 flex items-center gap-1">
          <span>{{ isMobileFilterOpen ? 'Hide' : 'Show' }}</span>
          <svg class="w-3.5 h-3.5 transition-transform duration-200" :class="{ 'rotate-180': isMobileFilterOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </span>
      </button>

      <!-- Starred Only Mobile Toggle Button -->
      <button 
        @click="filters.starredOnly = !filters.starredOnly" 
        :class="filters.starredOnly ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700' : 'text-gray-400 hover:text-amber-500 bg-white/70 dark:bg-gray-800/70 border-gray-200/80 dark:border-gray-700/80'" 
        class="py-2 px-3 rounded-xl border transition-all flex items-center gap-1 shadow-2xs text-xs font-semibold shrink-0 cursor-pointer"
        :title="filters.starredOnly ? $t('filters.showAll') : $t('filters.favoritesOnly')"
      >
        <svg class="w-3.5 h-3.5" :fill="filters.starredOnly ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
        <span v-if="starredIds.size > 0" class="text-[11px] font-bold">{{ starredIds.size }}</span>
      </button>
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

    <!-- Filters Bar - Glassmorphic (Always visible on desktop, collapsible on mobile) -->
    <div 
      class="mb-8 w-full glass-panel !bg-white/60 dark:!bg-gray-900/60 rounded-2xl p-4 sm:p-6 transition-all duration-300 relative z-20"
      :class="{ 'hidden md:block': !isMobileFilterOpen, 'block': isMobileFilterOpen }"
    >
      <!-- Mobile Filters Content (Only shown when expanded) -->
      <div class="flex flex-col gap-3 md:hidden">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <select 
            id="region" 
            v-model="filters.region" 
            @change="applyFilters" 
            class="w-full py-2 px-3.5 rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 text-xs shadow-xs focus:ring-2 focus:ring-primary-500 appearance-none backdrop-blur-md"
          >
            <option value="">{{ $t('filters.allRegions') }}</option>
            <option v-for="region in uniqueRegions" :key="region" :value="region">{{ region }}</option>
          </select>
          <select 
            id="country" 
            v-model="filters.country" 
            @change="applyFilters" 
            class="w-full py-2 px-3.5 rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 text-xs shadow-xs focus:ring-2 focus:ring-primary-500 appearance-none backdrop-blur-md"
          >
            <option value="">{{ $t('filters.allCountries') }}</option>
            <option v-for="country in uniqueCountries" :key="country" :value="country">{{ country }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select 
            id="type" 
            v-model="filters.type" 
            @change="applyFilters" 
            class="w-full py-2 px-2.5 rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 text-xs shadow-xs focus:ring-2 focus:ring-primary-500 appearance-none backdrop-blur-md"
          >
            <option value="">{{ $t('filters.allTypes') }}</option>
            <option value="event">{{ $t('filters.event') }}</option>
            <option value="deadline">{{ $t('filters.deadline') }}</option>
          </select>
          <select 
            id="format" 
            v-model="filters.format" 
            @change="applyFilters" 
            class="w-full py-2 px-2.5 rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 text-xs shadow-xs focus:ring-2 focus:ring-primary-500 appearance-none backdrop-blur-md"
          >
            <option value="">{{ $t('filters.allFormats') }}</option>
            <option value="online">💻 {{ $t('filters.formatOnline') }}</option>
            <option value="in-person">📍 {{ $t('filters.formatInPerson') }}</option>
            <option value="hybrid">🌐 {{ $t('filters.formatHybrid') }}</option>
          </select>
          <select 
            id="timeStatus" 
            v-model="filters.timeStatus" 
            @change="applyFilters" 
            class="w-full py-2 px-2.5 rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 text-xs shadow-xs focus:ring-2 focus:ring-primary-500 appearance-none backdrop-blur-md"
          >
            <option value="upcoming">{{ $t('filters.upcoming') }}</option>
            <option value="past">{{ $t('filters.past') }}</option>
            <option value="all">{{ $t('filters.all') }}</option>
          </select>
          <select 
            id="sort" 
            v-model="filters.sort" 
            @change="applyFilters" 
            class="w-full py-2 px-2.5 rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 text-xs shadow-xs focus:ring-2 focus:ring-primary-500 appearance-none backdrop-blur-md"
          >
            <option value="desc">{{ $t('filters.recentFirst') }}</option>
            <option value="asc">{{ $t('filters.oldestFirst') }}</option>
          </select>
        </div>
        <!-- Mobile Action Buttons: Show Results & Pin/Reset -->
        <div class="flex flex-col gap-2 mt-1 pt-2 border-t border-gray-200/50 dark:border-gray-700/60">
          <button 
            @click="applyMobileFiltersAndClose" 
            :disabled="totalFilteredEventsCount === 0"
            class="w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            :class="totalFilteredEventsCount > 0 ? 'bg-primary-600 hover:bg-primary-700 active:scale-[0.99] text-white shadow-primary-500/25' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none'"
          >
            <span v-if="totalFilteredEventsCount > 0">
              🔍 Show {{ totalFilteredEventsCount }} Matching {{ totalFilteredEventsCount === 1 ? 'Event' : 'Events' }} →
            </span>
            <span v-else>
              ⚠️ No Events Found for this Filter
            </span>
          </button>

          <div class="flex items-center gap-2">
            <button 
              @click="pinFilters" 
              :class="isPinned ? 'bg-green-500 text-white shadow-green-500/30' : 'bg-gray-200/80 dark:bg-gray-700 text-gray-700 dark:text-gray-200'" 
              class="flex-1 py-2 rounded-xl text-xs font-semibold shadow-xs focus:outline-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg v-if="isPinned" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path></svg>
              {{ isPinned ? $t('filters.pinned') : $t('filters.pin') }}
            </button>
            <button 
              @click="resetFilters" 
              class="flex-1 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 font-semibold text-xs transition-all cursor-pointer"
            >
              {{ $t('filters.reset') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop Filters -->
      <div class="hidden md:flex items-center gap-2.5 lg:gap-3.5 relative w-full">
        <div class="relative flex-1 min-w-0">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          </div>
          <select 
            id="region" 
            v-model="filters.region" 
            @change="applyFilters" 
            class="w-full py-2.5 pl-9 pr-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer truncate"
          >
            <option value="">{{ $t('filters.allRegions') }}</option>
            <option v-for="region in uniqueRegions" :key="region" :value="region">{{ region }}</option>
          </select>
        </div>
        
        <select 
          id="country" 
          v-model="filters.country" 
          @change="applyFilters" 
          class="flex-1 min-w-0 py-2.5 px-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer truncate"
        >
          <option value="">{{ $t('filters.allCountries') }}</option>
          <option v-for="country in uniqueCountries" :key="country" :value="country">{{ country }}</option>
        </select>
        
        <select 
          id="type" 
          v-model="filters.type" 
          @change="applyFilters" 
          class="flex-1 min-w-0 py-2.5 px-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer truncate"
        >
          <option value="">{{ $t('filters.allTypes') }}</option>
          <option value="event">{{ $t('filters.event') }}</option>
          <option value="deadline">{{ $t('filters.deadline') }}</option>
        </select>

        <select 
          id="format" 
          v-model="filters.format" 
          @change="applyFilters" 
          class="flex-1 min-w-0 py-2.5 px-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer truncate"
        >
          <option value="">{{ $t('filters.allFormats') }}</option>
          <option value="online">💻 {{ $t('filters.formatOnline') }}</option>
          <option value="in-person">📍 {{ $t('filters.formatInPerson') }}</option>
          <option value="hybrid">🌐 {{ $t('filters.formatHybrid') }}</option>
        </select>
        
        <select 
          id="timeStatus" 
          v-model="filters.timeStatus" 
          @change="applyFilters" 
          class="flex-1 min-w-0 py-2.5 px-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer truncate"
        >
          <option value="upcoming">{{ $t('filters.upcoming') }}</option>
          <option value="past">{{ $t('filters.past') }}</option>
          <option value="all">{{ $t('filters.all') }}</option>
        </select>
        
        <select 
          id="sort" 
          v-model="filters.sort" 
          @change="applyFilters" 
          class="flex-1 min-w-0 py-2.5 px-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer truncate"
        >
          <option value="desc">{{ $t('filters.recentFirst') }}</option>
          <option value="asc">{{ $t('filters.oldestFirst') }}</option>
        </select>
        
        <div class="flex items-center gap-1.5 border-l border-gray-200 dark:border-gray-700 pl-3 flex-shrink-0">
          <button 
            @click="filters.starredOnly = !filters.starredOnly" 
            :class="filters.starredOnly ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700' : 'text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'" 
            class="p-2.5 rounded-xl border transition-all flex items-center gap-1"
            :title="filters.starredOnly ? $t('filters.showAll') : $t('filters.favoritesOnly')"
          >
            <svg class="w-4 h-4" :fill="filters.starredOnly ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
            <span v-if="starredIds.size > 0" class="text-xs font-bold">{{ starredIds.size }}</span>
          </button>

          <button 
            @click="pinFilters" 
            :class="isPinned ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'" 
            class="p-2.5 rounded-xl border transition-all"
            :title="isPinned ? $t('filters.pinned') : $t('filters.pin')"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path></svg>
          </button>

          <button 
            @click="resetFilters" 
            class="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/30 transition-all"
            :title="$t('filters.reset')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
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
      <!-- Empty State -->
      <div v-if="sortedFilteredEvents.length === 0" class="mt-8 flex justify-center">
        <div class="glass-panel p-8 rounded-2xl max-w-lg text-center flex flex-col items-center">
          <div class="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 class="text-xl font-bold mb-2">{{ filters.starredOnly ? $t('timers.noStarred') : $t('timers.noTimers') }}</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">{{ filters.starredOnly ? $t('timers.noStarredDesc') : $t('timers.noTimersDesc') }}</p>
          <button v-if="filters.starredOnly" @click="filters.starredOnly = false" class="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md font-medium transition-colors">{{ $t('filters.showAll') }}</button>
          <router-link v-else to="/add" class="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md font-medium transition-colors">{{ $t('timers.createNew') }}</router-link>
        </div>
      </div>

      <!-- Non-Empty State: Map or Grid View -->
      <div v-else id="events-container">
        <!-- Interactive Map View -->
        <div v-if="viewMode === 'map'" class="my-4">
          <EventsMap :events="sortedFilteredEvents" @select-event="viewEvent" />
        </div>

        <!-- Events List (With Search / Multi-Section Display) -->
        <div v-else class="space-y-12">
          <!-- Section 1: Upcoming & Active Events -->
          <div v-if="activeEvents.length > 0">
            <div v-if="isSearchingOrAll && pastEvents.length > 0" class="flex items-center gap-2 mb-6">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <h2 class="text-xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight">
                {{ $t('sections.upcomingMatches') }} ({{ activeEvents.length }})
              </h2>
            </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            <div
              v-for="(event, index) in activeEvents"
              :key="event.id || (event.name + event.time)"
              class="glass-card rounded-2xl p-6 flex flex-col justify-between gap-5 cursor-pointer relative overflow-hidden group border-t-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              :class="[
                event.type === 'deadline' 
                  ? '!bg-rose-50/20 dark:!bg-rose-950/15 border-t-rose-400/90 dark:border-t-rose-500/80 border border-rose-100/50 dark:border-rose-900/30' 
                  : '!bg-white/80 dark:!bg-gray-900 border-t-blue-400/90 dark:border-t-blue-500/80 border border-gray-100 dark:border-gray-800'
              ]"
              @click="viewEvent(event)"
            >
              <div>
                <div class="flex items-start gap-3 relative z-10">
                  <div 
                    class="flex-shrink-0 w-12 h-12 rounded-xl border p-2 shadow-xs overflow-hidden flex items-center justify-center"
                    :class="event.type === 'deadline' ? 'border-rose-100 dark:border-rose-900/40 bg-rose-50/40 dark:bg-gray-800' : 'border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-gray-800'"
                  >
                    <img :src="getEventLogo(event)" :alt="event.name" class="w-full h-full object-contain" @error="$event.target.src=fallbackLogo" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                      <h3 class="font-bold text-base sm:text-lg leading-snug line-clamp-2 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" :title="event.name">
                        {{ event?.name }}
                      </h3>
                      <div class="flex items-center gap-1 ml-1 flex-shrink-0">
                        <button
                          @click.stop="toggleStar(event)"
                          class="p-1 rounded-lg text-gray-300 hover:text-amber-400 dark:text-gray-600 dark:hover:text-amber-400 transition-colors"
                          :class="{ '!text-amber-400': isStarred(event) }"
                          :title="isStarred(event) ? $t('timers.removeStar') : $t('timers.starEvent')"
                        >
                          <svg class="w-5 h-5" :fill="isStarred(event) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                        </button>

                        <button 
                          v-if="!event.isMeta && user && (user.id === event.creatorId || user.isAdmin)"
                          @click.stop="deleteEvent(event.id)"
                          class="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          :title="$t('timers.deleteTimer')"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </div>
                    <p v-if="event.creator?.username" class="text-xs text-primary-600 dark:text-primary-400 font-medium truncate mt-0.5">{{ $t('timers.addedBy') }} {{ event.creator.username }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{{ event?.region }}</p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 truncate">{{ event?.country }}</p>
                  </div>
                </div>
                
                <div class="flex flex-wrap gap-2 items-center relative z-10 mt-4">
                  <span 
                    class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider shadow-xs border"
                    :class="event.type === 'deadline' ? 'bg-rose-50/80 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800/50 dark:text-rose-300' : 'bg-blue-50/80 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-800/50 dark:text-blue-300'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full mr-1.5 self-center inline-block" :class="event.type === 'deadline' ? 'bg-rose-500' : 'bg-blue-500'"></span>
                    {{ event.type === 'deadline' ? $t('filters.deadline') : $t('filters.event') }}
                  </span>
                  <span
                    v-if="isOngoing(event)"
                    class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider shadow-xs border bg-amber-50/80 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800/50 dark:text-amber-300 animate-pulse"
                  >
                    {{ $t('status.ongoing') }}
                  </span>
                  <span
                    v-if="event.isMeta"
                    class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider shadow-xs border bg-sky-50/80 border-sky-200 text-sky-800 dark:bg-sky-950/40 dark:border-sky-800/50 dark:text-sky-300"
                  >
                    {{ $t('timers.meta') }}
                  </span>
                  <span
                    v-if="event.participants"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide shadow-2xs border bg-purple-50/80 border-purple-200/80 text-purple-700 dark:bg-purple-950/40 dark:border-purple-800/50 dark:text-purple-300"
                    :title="`${event.participants} ${$t('modal.participants')}`"
                  >
                    <span>👥</span>
                    <span>{{ event.participants }}</span>
                  </span>
                  <a v-if="event && event.link" :href="event.link" target="_blank" rel="noopener" class="ml-auto inline-flex items-center text-xs font-medium text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors bg-white/50 dark:bg-gray-800/50 py-1 px-2 rounded-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm hover:shadow-xs" @click.stop>
                    {{ $t('timers.link') }}
                    <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </a>
                </div>
              </div>
              
              <div class="pt-4 border-t border-gray-100 dark:border-gray-800/80 relative z-10">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-semibold uppercase tracking-wide" :class="event.type === 'deadline' ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400'">
                    {{ isOngoing(event) ? $t('status.endsIn') : (event.type === 'deadline' ? '⏰ ' + $t('status.deadlineIn') : $t('status.startsIn')) }}
                  </span>
                  <span class="text-xs px-2 py-0.5 rounded border bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200/60 dark:border-gray-700">
                    {{ event?.timeZone }}
                  </span>
                </div>
                <div class="flex items-end gap-2">
                  <span class="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{{ formatEventDates(event) }}</span>
                </div>
                <div class="mt-1 font-mono text-sm tracking-wider tabular-nums font-bold" :class="isOngoing(event) ? 'text-amber-600 dark:text-amber-400' : (event.type === 'deadline' ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400')">
                  {{ formatCountdown(event) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: Past & Archived Events (Distinct mild green styling) -->
        <div v-if="pastEvents.length > 0">
          <div class="flex items-center gap-2 mb-6" :class="{ 'pt-6 border-t border-gray-200/60 dark:border-gray-800/60': activeEvents.length > 0 }">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h2 class="text-xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight">
              {{ $t('sections.pastMatches') }} ({{ pastEvents.length }})
            </h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            <div
              v-for="(event, index) in pastEvents"
              :key="event.id || (event.name + event.time)"
              class="glass-card !bg-emerald-50/20 dark:!bg-emerald-950/15 rounded-2xl p-6 flex flex-col justify-between gap-5 cursor-pointer relative overflow-hidden group border-t-4 border-t-emerald-400/80 dark:border-t-emerald-500/70 border border-emerald-100/50 dark:border-emerald-900/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              @click="viewEvent(event)"
            >
              <div>
                <div class="flex items-start gap-3 relative z-10">
                  <div class="flex-shrink-0 w-12 h-12 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-gray-800 p-2 shadow-xs overflow-hidden flex items-center justify-center">
                    <img :src="getEventLogo(event)" :alt="event.name" class="w-full h-full object-contain opacity-80" @error="$event.target.src=fallbackLogo" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                      <h3 class="font-bold text-base sm:text-lg leading-snug line-clamp-2 text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" :title="event.name">
                        {{ event?.name }}
                      </h3>
                      <div class="flex items-center gap-1 ml-1 flex-shrink-0">
                        <button
                          @click.stop="toggleStar(event)"
                          class="p-1 rounded-lg text-gray-300 hover:text-amber-400 dark:text-gray-600 dark:hover:text-amber-400 transition-colors"
                          :class="{ '!text-amber-400': isStarred(event) }"
                          :title="isStarred(event) ? $t('timers.removeStar') : $t('timers.starEvent')"
                        >
                          <svg class="w-5 h-5" :fill="isStarred(event) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                        </button>
                      </div>
                    </div>
                    <p class="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{{ event?.region }}</p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 truncate">{{ event?.country }}</p>
                  </div>
                </div>
                
                <div class="flex flex-wrap gap-2 items-center relative z-10 mt-4">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider shadow-xs border bg-emerald-50/80 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/50 dark:text-emerald-300">
                    <span class="w-1.5 h-1.5 rounded-full mr-1.5 self-center inline-block bg-emerald-500"></span>
                    {{ $t('status.ended') }}
                  </span>
                  <span
                    v-if="event.isMeta"
                    class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider shadow-xs border bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                  >
                    {{ $t('timers.metaArchive') }}
                  </span>
                  <span
                    v-if="event.participants"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide shadow-2xs border bg-emerald-50/80 border-emerald-200/80 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800/50 dark:text-emerald-300"
                    :title="`${event.participants} ${$t('modal.participants')}`"
                  >
                    <span>👥</span>
                    <span>{{ event.participants }}</span>
                  </span>
                  <a v-if="event && event.link" :href="event.link" target="_blank" rel="noopener" class="ml-auto inline-flex items-center text-xs font-medium text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors bg-white/50 dark:bg-gray-800/50 py-1 px-2 rounded-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm hover:shadow-xs" @click.stop>
                    {{ $t('timers.link') }}
                    <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </a>
                </div>
              </div>
              
              <div class="pt-4 border-t border-emerald-100/60 dark:border-emerald-900/30 relative z-10">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    {{ $t('status.ended') }}
                  </span>
                  <span class="text-xs px-2 py-0.5 rounded border bg-emerald-50/50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-emerald-200/50 dark:border-gray-700">
                    {{ event?.timeZone }}
                  </span>
                </div>
                <div class="flex items-end gap-2">
                  <span class="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{{ formatEventDates(event) }}</span>
                </div>
                <div class="mt-1 font-mono text-sm tracking-wider tabular-nums font-bold text-emerald-700 dark:text-emerald-400">
                  {{ formatCountdown(event) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
          class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-6"
          @click.self="closeModal"
        >
          <div
            class="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transform transition-all flex flex-col animate-in fade-in zoom-in-95 duration-200 my-4 sm:my-8"
            @click.stop
          >
            <!-- Top Gradient Accent -->
            <div
              class="h-3 w-full bg-gradient-to-r"
              :class="selectedEvent.type === 'event' ? 'from-blue-500 via-indigo-500 to-cyan-400' : 'from-rose-500 via-pink-500 to-amber-400'"
            ></div>

            <!-- Header Controls: Star & Close (Always easily reachable on mobile & desktop) -->
            <div class="absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center gap-2 z-30">
              <button
                @click="toggleStar(selectedEvent)"
                class="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xs text-gray-400 hover:text-amber-400 dark:hover:text-amber-400 shadow-sm border border-gray-200/60 dark:border-gray-700/60 transition-colors"
                :class="{ '!text-amber-400': isStarred(selectedEvent) }"
                :title="isStarred(selectedEvent) ? $t('timers.removeStar') : $t('timers.starEvent')"
              >
                <svg class="w-5 h-5 sm:w-6 sm:h-6" :fill="isStarred(selectedEvent) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
              </button>
              <button
                @click="closeModal"
                class="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 shadow-sm border border-gray-200/60 dark:border-gray-700/60 transition-colors"
                :title="$t('modal.close')"
              >
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div class="p-5 sm:p-8 flex flex-col gap-5 sm:gap-6">
              <!-- Header with Logo and Title -->
              <div class="flex items-start gap-3.5">
                <div class="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 shadow-sm flex items-center justify-center">
                  <img :src="getEventLogo(selectedEvent)" alt="logo" class="w-full h-full object-contain" @error="$event.target.src=fallbackLogo" />
                </div>
                <div class="flex-1 min-w-0 pr-20">
                  <div class="flex flex-wrap gap-1.5 sm:gap-2 items-center mb-1.5">
                    <span 
                      class="inline-flex px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-bold uppercase tracking-wider border shadow-xs"
                      :class="selectedEvent.type === 'event' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300' : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-300'"
                    >
                      {{ selectedEvent.type === 'deadline' ? $t('filters.deadline') : $t('filters.event') }}
                    </span>
                    <span 
                      v-if="isOngoing(selectedEvent)"
                      class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-bold uppercase tracking-wider border bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300 animate-pulse"
                    >
                      {{ $t('status.happeningNow') }}
                    </span>
                    <span 
                      v-if="selectedEvent.isMeta"
                      class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-bold uppercase tracking-wider border bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300"
                    >
                      Meta-Wiki
                    </span>
                  </div>
                  <h2 class="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-white leading-snug sm:leading-tight">
                    {{ selectedEvent.name }}
                  </h2>
                </div>
              </div>

              <!-- Live Countdown Display Card -->
              <div class="bg-gradient-to-br from-gray-50 to-gray-100/80 dark:from-gray-800/60 dark:to-gray-800/30 rounded-2xl p-5 border border-gray-200/60 dark:border-gray-700/60">
                <div class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 text-center">
                  {{ isOngoing(selectedEvent) ? '⏳ ' + $t('status.eventEndsIn') : (isPast(selectedEvent) ? '🏁 ' + $t('status.eventStatus') : '🚀 ' + $t('status.countdownToStart')) }}
                </div>
                
                <div v-if="!isPast(selectedEvent)" class="grid grid-cols-4 gap-2 sm:gap-4 text-center">
                  <div class="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div class="text-2xl sm:text-4xl font-extrabold text-primary-600 dark:text-primary-400 font-mono">
                      {{ String(getCountdownParts(selectedEvent).days).padStart(2, '0') }}
                    </div>
                    <div class="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">{{ $t('time.days') }}</div>
                  </div>
                  <div class="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div class="text-2xl sm:text-4xl font-extrabold text-primary-600 dark:text-primary-400 font-mono">
                      {{ String(getCountdownParts(selectedEvent).hours).padStart(2, '0') }}
                    </div>
                    <div class="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">{{ $t('time.hours') }}</div>
                  </div>
                  <div class="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div class="text-2xl sm:text-4xl font-extrabold text-primary-600 dark:text-primary-400 font-mono">
                      {{ String(getCountdownParts(selectedEvent).minutes).padStart(2, '0') }}
                    </div>
                    <div class="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">{{ $t('time.minutes') }}</div>
                  </div>
                  <div class="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div class="text-2xl sm:text-4xl font-extrabold text-amber-500 font-mono">
                      {{ String(getCountdownParts(selectedEvent).seconds).padStart(2, '0') }}
                    </div>
                    <div class="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">{{ $t('time.seconds') }}</div>
                  </div>
                </div>
                <div v-else class="text-center py-4 text-gray-500 dark:text-gray-400 font-semibold text-base sm:text-lg">
                  {{ $t('status.concludedOn', { date: formatEventDates(selectedEvent) }) }}
                </div>
              </div>

              <!-- Details Grid with Timezone Switcher -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <!-- Date & Time Card with UTC / Local Time Switcher -->
                <div class="p-3.5 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between gap-1.5 sm:col-span-2">
                  <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="flex items-center gap-2">
                      <div class="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                      <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">{{ $t('modal.eventSchedule') }}</span>
                    </div>

                    <!-- Timezone Toggle -->
                    <div class="flex items-center bg-gray-200/70 dark:bg-gray-700/70 p-0.5 rounded-lg text-xs font-semibold">
                      <button
                        @click="modalTimezone = 'UTC'"
                        type="button"
                        class="px-2.5 py-1 rounded-md transition-all"
                        :class="modalTimezone === 'UTC' ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-xs' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'"
                      >
                        UTC
                      </button>
                      <button
                        @click="modalTimezone = 'local'"
                        type="button"
                        class="px-2.5 py-1 rounded-md transition-all"
                        :class="modalTimezone === 'local' ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-xs' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'"
                      >
                        {{ $t('modal.myTime') }} ({{ userTimezoneAbbr }})
                      </button>
                    </div>
                  </div>

                  <div class="font-bold text-gray-900 dark:text-gray-100 text-base mt-1">
                    {{ formatEventScheduleWithTz(selectedEvent, modalTimezone) }}
                  </div>
                </div>

                <!-- Streamlined Compact Details: Location, Format, Participants, Organizers -->
                <div class="p-3 bg-gray-50/80 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col gap-2.5">
                  <!-- Row 1: Location, Attendance Format, Participants -->
                  <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        <span>📍</span>
                        <span>{{ selectedEvent.country || selectedEvent.region || 'Online / Virtual' }}</span>
                      </span>
                      <span
                        v-if="selectedEvent.participation"
                        class="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-purple-100/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60"
                      >
                        {{ selectedEvent.participation }}
                      </span>
                    </div>

                    <div v-if="selectedEvent.participants" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 font-semibold text-[11px]">
                      <span>👥</span>
                      <span>{{ selectedEvent.participants }} {{ $t('modal.participants') }}</span>
                    </div>
                  </div>

                  <!-- Row 2: Organizers Mini Pills -->
                  <div v-if="selectedEvent.organizers" class="pt-2 border-t border-gray-200/40 dark:border-gray-700/40 flex items-start gap-2">
                    <span class="text-[11px] text-gray-400 font-medium shrink-0 pt-0.5">{{ $t('modal.organizers') }}:</span>
                    <div class="flex flex-wrap gap-1.5 flex-1">
                      <a
                        v-for="(org, idx) in getOrganizerLinks(selectedEvent.organizers, selectedEvent.link)"
                        :key="idx"
                        :href="org.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-300 border border-gray-200/80 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-950/40 transition-all shadow-2xs group"
                        :title="org.title || `Open on Meta-Wiki`"
                      >
                        <span v-if="org.isMore" class="text-primary-500">🔗</span>
                        <span v-else-if="org.isUser" class="text-amber-500">👤</span>
                        <span v-else-if="org.isExternal" class="text-emerald-500">🌐</span>
                        <span v-else class="text-indigo-500">🏛️</span>
                        <span class="group-hover:underline">{{ org.name }}</span>
                        <svg class="w-2.5 h-2.5 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons Row 1: Main Actions -->
              <div class="flex flex-wrap gap-2.5 pt-1">
                <a
                  v-if="selectedEvent.link"
                  :href="selectedEvent.link"
                  target="_blank"
                  rel="noopener"
                  class="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
                >
                  <span>{{ $t('modal.openWikiPage') }}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>

                <button
                  @click="copyShareLink(selectedEvent)"
                  type="button"
                  class="inline-flex items-center justify-center gap-1.5 px-3.5 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl border border-gray-200 dark:border-gray-700 transition-all text-sm"
                  :title="$t('modal.copyLink')"
                >
                  <svg v-if="!isCopied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                  <svg v-else class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>{{ isCopied ? $t('modal.copied') : $t('modal.copyLink') }}</span>
                </button>

                <button
                  @click="copyWikitext(selectedEvent)"
                  type="button"
                  class="inline-flex items-center justify-center gap-1.5 px-3.5 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl border border-gray-200 dark:border-gray-700 transition-all text-sm"
                  :title="$t('modal.copyWikitext')"
                >
                  <svg v-if="!isWikitextCopied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  <svg v-else class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>{{ isWikitextCopied ? $t('modal.wikitextCopied') : $t('modal.copyWikitext') }}</span>
                </button>

                <button
                  @click="toggleReminder(selectedEvent)"
                  type="button"
                  class="inline-flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl border transition-all text-sm font-medium"
                  :class="hasReminder(selectedEvent) ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'"
                  :title="hasReminder(selectedEvent) ? $t('modal.reminderSet') : $t('modal.remindMe')"
                >
                  <svg class="w-4 h-4" :fill="hasReminder(selectedEvent) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                  <span>{{ hasReminder(selectedEvent) ? $t('modal.reminderSet') : $t('modal.remindMe') }}</span>
                </button>
              </div>

              <!-- Calendar & Embed Integrations Row -->
              <div class="flex items-center flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <span class="text-xs text-gray-400 font-medium">{{ $t('modal.exportAndEmbed') }}:</span>
                <a
                  :href="getGoogleCalendarUrl(selectedEvent)"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs font-semibold rounded-lg border border-blue-200 dark:border-blue-800/50 transition-all"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <span>{{ $t('modal.googleCal') }}</span>
                </a>
                <button
                  @click="downloadICal(selectedEvent)"
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 transition-all"
                  :title="$t('modal.downloadIcs')"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  <span>{{ $t('modal.icsFile') }}</span>
                </button>
                <button
                  @click="showEmbedDrawer = !showEmbedDrawer"
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-lg border border-purple-200 dark:border-purple-800/50 transition-all"
                  :title="$t('modal.embedWidget')"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                  <span>{{ $t('modal.embedWidget') }}</span>
                </button>

                <button
                  v-if="!selectedEvent.isMeta && user && (user.id === selectedEvent.creatorId || user.isAdmin)"
                  @click="deleteEvent(selectedEvent.id)"
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-800/50 transition-all ml-auto"
                  :title="$t('timers.deleteTimer')"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  <span>{{ $t('timers.deleteTimer') }}</span>
                </button>
              </div>

              <!-- Embed Widget Code Snippet Box -->
              <div v-if="showEmbedDrawer" class="p-3.5 bg-purple-50/70 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-900/60 flex flex-col gap-2 animate-in fade-in duration-200">
                <div class="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-200">
                  <span class="flex items-center gap-1.5">🌐 <span>{{ $t('modal.embedSnippetTitle') }}</span></span>
                  <button @click="showEmbedDrawer = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm leading-none">✕</button>
                </div>
                <p class="text-[11px] text-gray-600 dark:text-gray-400">
                  {{ $t('modal.embedSnippetDesc') }}
                </p>
                <div class="flex items-center gap-2">
                  <input
                    type="text"
                    readonly
                    :value="getEmbedIframeCode(selectedEvent)"
                    class="flex-1 text-xs font-mono bg-white dark:bg-gray-900 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 select-all"
                  />
                  <button
                    @click="copyEmbedCode(selectedEvent)"
                    class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                  >
                    {{ isEmbedCopied ? '✓ ' + $t('modal.copied') : $t('modal.copyCode') }}
                  </button>
                </div>
              </div>

              <!-- Mobile Dedicated Close Button -->
              <div class="sm:hidden pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  @click="closeModal"
                  type="button"
                  class="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-sm transition-all shadow-xs"
                >
                  {{ $t('modal.close') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>



<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../store/auth';
import EventsMap from './EventsMap.vue';

const route = useRoute();
const router = useRouter();
const { user, isAuthenticated, isLoading, error: authError, login, logout, checkAuth } = useAuth();

const viewMode = ref(localStorage.getItem('wikitimer_view_mode') || 'grid');
watch(viewMode, (newVal) => {
  localStorage.setItem('wikitimer_view_mode', newVal);
});

const categoryTags = [
  { id: 'all', labelKey: 'tags.all', icon: '🌐' },
  { id: 'wikimania', labelKey: 'tags.wikimania', icon: '🎉' },
  { id: 'hackathon', labelKey: 'tags.hackathon', icon: '💻' },
  { id: 'editathon', labelKey: 'tags.editathon', icon: '📚' },
  { id: 'wikiloves', labelKey: 'tags.wikiloves', icon: '📷' },
  { id: 'conference', labelKey: 'tags.conference', icon: '🤝' },
  { id: 'glam', labelKey: 'tags.glam', icon: '🏛️' },
  { id: 'education', labelKey: 'tags.education', icon: '🎓' }
];
const selectedTag = ref('all');

function toggleTag(tagId) {
  if (selectedTag.value === tagId) {
    selectedTag.value = 'all';
  } else {
    selectedTag.value = tagId;
  }
}

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
  format: '',
  timeStatus: 'upcoming',
  sort: 'asc',
  starredOnly: false
});

const isMobileFilterOpen = ref(false);

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.region) count++;
  if (filters.value.country) count++;
  if (filters.value.type) count++;
  if (filters.value.format) count++;
  if (filters.value.timeStatus !== 'upcoming') count++;
  if (filters.value.starredOnly) count++;
  return count;
});

function getOrganizerLinks(organizersStr, eventLink = '') {
  if (!organizersStr || typeof organizersStr !== 'string') return [];

  // Normalize and split on commas, semicolons, or " and "
  const normalized = organizersStr
    .replace(/\s+and\s+(\d+\s+more)/i, ', $1')
    .replace(/\s+and\s+/gi, ', ');

  const rawList = normalized.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);

  return rawList.map(raw => {
    // 1. Check if it's "+N more" or "N more"
    const moreMatch = raw.match(/^(?:and\s+)?(?:\+)?(\d+)\s+more$/i);
    if (moreMatch) {
      return {
        name: `+${moreMatch[1]} more`,
        url: eventLink || 'https://meta.wikimedia.org',
        isUser: false,
        isExternal: false,
        isMore: true,
        title: 'View full team on event page'
      };
    }

    // 2. Direct external URL
    if (/^https?:\/\//i.test(raw)) {
      let displayName = raw;
      try {
        const u = new URL(raw);
        displayName = u.hostname.replace(/^www\./, '') + (u.pathname !== '/' ? u.pathname : '');
      } catch (e) {
        displayName = raw;
      }
      return {
        name: displayName,
        url: raw,
        isUser: false,
        isExternal: true,
        isMore: false
      };
    }

    // 3. User prefixes or Wikimedia usernames with (WMF) / dashes / underscores
    const userMatch = raw.match(/^(?:User(?:[ _]talk)?:|बᱮᱵᱷᱟᱨᱤᱭᱟᱹ:|ಬಳಕೆದಾರ:|பயனர்:|వాడుకరి:|ব্যবহারকারী:)\s*(.+)/i);
    if (userMatch) {
      const username = userMatch[1].trim();
      return {
        name: username,
        url: `https://meta.wikimedia.org/wiki/User:${encodeURIComponent(username.replace(/\s+/g, '_'))}`,
        isUser: true,
        isExternal: false,
        isMore: false
      };
    }

    // Single words / usernames with WMF or typical wiki username patterns
    const isLikelyUser = /\(WMF\)$/i.test(raw) || /^[A-Z0-9_-]+$/i.test(raw) || !raw.includes(' ');
    if (isLikelyUser) {
      return {
        name: raw,
        url: `https://meta.wikimedia.org/wiki/User:${encodeURIComponent(raw.replace(/\s+/g, '_'))}`,
        isUser: true,
        isExternal: false,
        isMore: false
      };
    }

    // 4. Otherwise treat as a Wikimedia affiliate / project / meta page
    const cleanPage = raw.replace(/^https?:\/\/meta\.wikimedia\.org\/wiki\//i, '').trim();
    return {
      name: raw,
      url: `https://meta.wikimedia.org/wiki/${encodeURIComponent(cleanPage.replace(/\s+/g, '_'))}`,
      isUser: false,
      isExternal: false,
      isMore: false
    };
  });
}

const hasActiveFilters = computed(() => {
  return selectedTag.value !== 'all' || 
         Boolean(filters.value.searchQuery.trim()) || 
         activeFilterCount.value > 0;
});

const isPinned = ref(false);
const fallbackLogo = 'https://upload.wikimedia.org/wikipedia/commons/7/75/Wikimedia_Community_Logo.svg';
const userTimers = ref([]);
const metaEvents = ref([]);

// 1. Star / Bookmark State & Persistence (Hybrid Local + Account Sync)
const starredIds = ref(new Set(JSON.parse(localStorage.getItem('wikitimer_starred') || '[]')));

function getEventKey(event) {
  if (!event) return '';
  return String(event.slug || event.metaId || event.id || event.name || '');
}

function isStarred(event) {
  if (!event) return false;
  const key = getEventKey(event);
  const rawId = String(event.id || '');
  const metaId = String(event.metaId || '');
  return starredIds.value.has(key) || starredIds.value.has(rawId) || (metaId && starredIds.value.has(metaId));
}

async function toggleStar(event) {
  if (!event) return;
  const key = getEventKey(event);
  const currentlyStarred = isStarred(event);

  // Optimistic local UI update
  if (currentlyStarred) {
    starredIds.value.delete(key);
    if (event.id) starredIds.value.delete(String(event.id));
    if (event.metaId) starredIds.value.delete(String(event.metaId));
  } else {
    starredIds.value.add(key);
  }
  localStorage.setItem('wikitimer_starred', JSON.stringify([...starredIds.value]));

  // Sync to account if logged in
  if (isAuthenticated.value) {
    try {
      await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventKey: key })
      });
    } catch (err) {
      console.warn('Failed to sync favorite with account:', err);
    }
  }
}

async function loadAndSyncFavorites() {
  if (!isAuthenticated.value) return;

  try {
    const localKeys = [...starredIds.value];
    if (localKeys.length > 0) {
      // Sync offline / local favourites to account
      const syncRes = await fetch('/api/favorites/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventKeys: localKeys })
      });
      if (syncRes.ok) {
        const data = await syncRes.json();
        if (Array.isArray(data.favorites)) {
          data.favorites.forEach(k => starredIds.value.add(k));
          localStorage.setItem('wikitimer_starred', JSON.stringify([...starredIds.value]));
          return;
        }
      }
    }

    // Fetch user account favourites
    const res = await fetch('/api/favorites');
    if (res.ok) {
      const serverFavs = await res.json();
      if (Array.isArray(serverFavs)) {
        serverFavs.forEach(k => starredIds.value.add(k));
        localStorage.setItem('wikitimer_starred', JSON.stringify([...starredIds.value]));
      }
    }
  } catch (err) {
    console.warn('Failed to load user account favorites:', err);
  }
}

watch(isAuthenticated, (authed) => {
  if (authed) {
    loadAndSyncFavorites();
  }
});

// 2. Modal Timezone & Schedule Formatting
const modalTimezone = ref('UTC');
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const userTimezoneAbbr = computed(() => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(new Date());
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    return tzPart ? tzPart.value : userTimezone.split('/').pop().replace('_', ' ');
  } catch (e) {
    return 'Local';
  }
});

function formatEventScheduleWithTz(event, tzMode) {
  if (!event || !event.time) return '';
  const tz = tzMode === 'UTC' ? 'UTC' : userTimezone;
  const tzSuffix = tzMode === 'UTC' ? 'UTC' : userTimezoneAbbr.value;

  const start = new Date(event.time);
  const end = event.endTime ? new Date(event.endTime) : null;

  const options = {
    timeZone: tz,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  const startFormatted = new Intl.DateTimeFormat('en-US', options).format(start);
  if (!end) {
    return `${startFormatted} (${tzSuffix})`;
  }

  const isSameDay = start.toLocaleDateString('en-US', { timeZone: tz }) === end.toLocaleDateString('en-US', { timeZone: tz });
  if (isSameDay) {
    const endFormattedTime = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(end);
    return `${startFormatted} – ${endFormattedTime} (${tzSuffix})`;
  } else {
    const endFormatted = new Intl.DateTimeFormat('en-US', options).format(end);
    return `${startFormatted} – ${endFormatted} (${tzSuffix})`;
  }
}

// 3. Wikitext Embed Snippet Generator
const isWikitextCopied = ref(false);

async function copyWikitext(event) {
  if (!event) return;
  const targetParam = event.slug || encodeURIComponent(event.id);
  const timerUrl = `${window.location.origin}/timer/${targetParam}`;
  const dates = formatEventDates(event);
  const link = event.link || timerUrl;
  const snippet = `[${link} '''${event.name}'''] – ''${dates} (UTC)'' · [${timerUrl} ⏱️ View Live Countdown on WikiTimer]`;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(snippet);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = snippet;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    isWikitextCopied.value = true;
    setTimeout(() => {
      isWikitextCopied.value = false;
    }, 2500);
  } catch (err) {
    console.error('Failed to copy wikitext', err);
  }
}

// 4. Universal iCalendar (.ics) Download
function downloadICal(event) {
  if (!event || !event.time) return;
  try {
    const start = new Date(event.time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(event.endTime || event.time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const summary = (event.name || 'Wikimedia Event').replace(/,/g, '\\,');
    const targetParam = event.slug || encodeURIComponent(event.id);
    const description = `WikiTimer: ${window.location.origin}/timer/${targetParam}\\n\\nEvent Link: ${event.link || ''}`;
    const location = (event.participation || event.country || event.region || 'Online').replace(/,/g, '\\,');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//WikiTimer//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${encodeURIComponent(event.slug || event.id || Date.now())}@wikitimer.toolforge.org`,
      `DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d\d\d/g, '')}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `URL:${event.link || window.location.origin}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${(event.slug || 'wikitimer-event')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.error('Failed to generate iCal', e);
  }
}

// 5. Standalone Embed Code Generator (<iframe ...>)
const showEmbedDrawer = ref(false);
const isEmbedCopied = ref(false);

function getEmbedUrl(event) {
  if (!event) return '';
  const targetParam = event.slug || encodeURIComponent(event.id);
  return `${window.location.origin}/embed/${targetParam}`;
}

function getEmbedIframeCode(event) {
  const url = getEmbedUrl(event);
  return `<iframe src="${url}" width="100%" height="200" frameborder="0" style="border:none; border-radius:16px; overflow:hidden; max-width:420px;" title="${event?.name || 'Wiki Timer'}"></iframe>`;
}

async function copyEmbedCode(event) {
  if (!event) return;
  const code = getEmbedIframeCode(event);
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(code);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    isEmbedCopied.value = true;
    setTimeout(() => {
      isEmbedCopied.value = false;
    }, 2500);
  } catch (err) {
    console.error('Failed to copy embed code:', err);
  }
}

// 6. Browser Notifications & Reminder
const reminderIds = ref(new Set(JSON.parse(localStorage.getItem('wikitimer_reminders') || '[]')));

function hasReminder(event) {
  if (!event) return false;
  const key = getEventKey(event);
  return reminderIds.value.has(key);
}

async function toggleReminder(event) {
  if (!event) return;
  const key = getEventKey(event);
  if (hasReminder(event)) {
    reminderIds.value.delete(key);
    localStorage.setItem('wikitimer_reminders', JSON.stringify([...reminderIds.value]));
  } else {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        reminderIds.value.add(key);
        localStorage.setItem('wikitimer_reminders', JSON.stringify([...reminderIds.value]));
        new Notification('Reminder Set! ⏱️', {
          body: `You will be notified before "${event.name}" starts.`,
          icon: getEventLogo(event)
        });
      } else {
        alert('Please allow notification permissions in your browser to receive reminders.');
      }
    } else {
      alert('Browser notifications are not supported on this device.');
    }
  }
}

function checkActiveReminders() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const now = Date.now();
  const notified = JSON.parse(localStorage.getItem('wikitimer_notified') || '[]');

  events.value.forEach(event => {
    const key = getEventKey(event);
    if (reminderIds.value.has(key) && !notified.includes(key)) {
      const startTime = new Date(event.time).getTime();
      const diffMs = startTime - now;
      // If within 15 minutes before start or up to 5 minutes after start
      if (diffMs > -300000 && diffMs <= 900000) {
        new Notification(`Upcoming Wikimedia Event: ${event.name}`, {
          body: `Starting soon (${formatEventDates(event)})! Click to view live countdown.`,
          icon: getEventLogo(event)
        });
        notified.push(key);
        localStorage.setItem('wikitimer_notified', JSON.stringify(notified));
      }
    }
  });
}

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

const events = computed(() => {
  const combined = [
    ...(Array.isArray(userTimers.value) ? userTimers.value : []),
    ...(Array.isArray(metaEvents.value) ? metaEvents.value : [])
  ];
  
  const seen = new Set();
  return combined.filter(event => {
    if (!event || typeof event !== 'object' || !event.name || !event.time) return false;
    
    // Deduplication key based on normalized URL, metaId, slug, or name+time
    const linkKey = (event.link || '').replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();
    const metaKey = event.metaId ? `meta:${event.metaId}` : '';
    const slugKey = event.slug ? `slug:${event.slug}` : '';
    const fallbackKey = `fallback:${event.name.trim().toLowerCase()}_${new Date(event.time).getTime()}`;
    
    const primaryKey = metaKey || slugKey || linkKey || fallbackKey;
    if (seen.has(primaryKey) || (linkKey && seen.has(linkKey))) {
      return false;
    }
    if (linkKey) seen.add(linkKey);
    seen.add(primaryKey);
    return true;
  });
});

const standardRegions = ['Africa', 'Asia', 'Europe', 'Latin America', 'North America', 'Oceania', 'MENA', 'Global'];
const uniqueRegions = computed(() => standardRegions);
const uniqueWikis = computed(() => [...new Set(events.value.map(event => event.wikiProject || event.wiki).filter(Boolean))].sort());
const uniqueCountries = computed(() => [...new Set(events.value.map(event => event.country).filter(Boolean))].sort());

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
  const query = filters.value.searchQuery.trim().toLowerCase();
  
  return events.value.filter(event => {
    if (!event || typeof event !== 'object' || !event.link || !event.name || !event.time) return false;
    
    if (filters.value.starredOnly && !isStarred(event)) {
      return false;
    }
    
    let timeStatusMatch = true;
    // When a search query is entered or a category tag chip is selected, we search across all events so past matching events display in their dedicated sub-section
    if (query || (selectedTag.value && selectedTag.value !== 'all')) {
      timeStatusMatch = true;
    } else if (filters.value.timeStatus === 'upcoming') {
      timeStatusMatch = isUpcoming(event) || isOngoing(event);
    } else if (filters.value.timeStatus === 'past') {
      timeStatusMatch = isPast(event);
    }
    
    let regionMatch = true;
    if (filters.value.region) {
      const selected = filters.value.region.toLowerCase();
      const eventRegion = (event.region || '').toLowerCase();
      const eventTopics = (event.topics || '').toLowerCase();
      if (selected === 'global') {
        regionMatch = eventRegion === 'global' || (!event.region && !event.topics);
      } else {
        regionMatch = eventRegion.includes(selected) || eventTopics.includes(selected);
      }
    }

    let tagMatch = true;
    if (selectedTag.value && selectedTag.value !== 'all') {
      const nameLower = (event.name || '').toLowerCase();
      const topicsLower = (event.topics || '').toLowerCase();
      const countryLower = (event.country || '').toLowerCase();
      const fullText = `${nameLower} ${topicsLower} ${countryLower}`;
      
      if (selectedTag.value === 'wikimania') {
        tagMatch = fullText.includes('wikimania');
      } else if (selectedTag.value === 'hackathon') {
        tagMatch = fullText.includes('hackathon') || fullText.includes('hack');
      } else if (selectedTag.value === 'editathon') {
        tagMatch = fullText.includes('editathon') || fullText.includes('edit-a-thon') || fullText.includes('edithon');
      } else if (selectedTag.value === 'wikiloves') {
        tagMatch = fullText.includes('wiki loves') || fullText.includes('wlm') || fullText.includes('wle') || fullText.includes('wlf');
      } else if (selectedTag.value === 'conference') {
        tagMatch = fullText.includes('conference') || fullText.includes('summit') || fullText.includes('convention') || fullText.includes('meeting');
      } else if (selectedTag.value === 'glam') {
        tagMatch = fullText.includes('glam') || fullText.includes('museum') || fullText.includes('library') || fullText.includes('archive');
      } else if (selectedTag.value === 'education') {
        tagMatch = fullText.includes('education') || fullText.includes('school') || fullText.includes('university') || fullText.includes('student');
      }
    }

    // Search query matching across title, country, region, topics, organizers, and wiki project
    let queryMatch = true;
    if (query) {
      const searchCorpus = [
        event.name || '',
        event.topics || '',
        event.country || '',
        event.region || '',
        event.organizers || '',
        event.wiki || '',
        event.wikiProject || '',
        event.link || ''
      ].join(' ').toLowerCase();
      queryMatch = searchCorpus.includes(query);
    }

    let formatMatch = true;
    if (filters.value.format) {
      const selectedFormat = filters.value.format.toLowerCase();
      const eventParticipation = (event.participation || '').toLowerCase();
      const locationText = (event.country || event.region || '').toLowerCase();
      
      const isPureOnline = eventParticipation === 'online' || eventParticipation.includes('online') || eventParticipation.includes('virtual') || locationText.includes('online') || locationText.includes('virtual');
      const isHybrid = eventParticipation === 'hybrid' || eventParticipation.includes('hybrid');
      const isInPerson = eventParticipation === 'in-person' || eventParticipation.includes('in-person') || (!isPureOnline && Boolean(event.country || event.region));

      if (selectedFormat === 'online') {
        formatMatch = isPureOnline || isHybrid;
      } else if (selectedFormat === 'in-person') {
        formatMatch = isInPerson || isHybrid;
      } else if (selectedFormat === 'hybrid') {
        formatMatch = isHybrid;
      }
    }

    return (
      timeStatusMatch &&
      regionMatch &&
      tagMatch &&
      queryMatch &&
      formatMatch &&
      (!filters.value.country || event.country === filters.value.country) &&
      (!filters.value.type || event.type === filters.value.type)
    );
  });
});

function getNextMilestoneDate(event) {
  if (!event || !event.time) return new Date(0);
  const now = currentTime.value;
  const startTime = new Date(event.time);
  const endTime = event.endTime ? new Date(event.endTime) : null;
  
  // If ongoing: next milestone is when it finishes (endTime)
  if (startTime <= now && endTime !== null && endTime >= now) {
    return endTime;
  }
  // If upcoming: next milestone is when it begins (startTime)
  if (startTime > now) {
    return startTime;
  }
  // If concluded: milestone is when it ended (endTime or startTime)
  return endTime || startTime;
}

const sortedFilteredEvents = computed(() => {
  return filteredEvents.value
    .filter(event => event && typeof event === 'object' && event.link && event.name && event.time)
    .sort((a, b) => {
      const dateA = getNextMilestoneDate(a);
      const dateB = getNextMilestoneDate(b);
      return filters.value.sort === 'desc' ? dateB - dateA : dateA - dateB;
    });
});

const activeEvents = computed(() => {
  return sortedFilteredEvents.value
    .filter(e => !isPast(e))
    .sort((a, b) => {
      const dateA = getNextMilestoneDate(a);
      const dateB = getNextMilestoneDate(b);
      return filters.value.sort === 'desc' ? dateB - dateA : dateA - dateB;
    });
});

const pastEvents = computed(() => {
  return sortedFilteredEvents.value
    .filter(e => isPast(e))
    .sort((a, b) => {
      const dateA = getNextMilestoneDate(a);
      const dateB = getNextMilestoneDate(b);
      // For past events: most recently concluded first by default (desc in UI means furthest past)
      return filters.value.sort === 'desc' ? dateA - dateB : dateB - dateA;
    });
});

const isSearchingOrAll = computed(() => {
  return filters.value.timeStatus === 'all' || filters.value.searchQuery.trim().length > 0 || (selectedTag.value && selectedTag.value !== 'all');
});

const totalFilteredEventsCount = computed(() => {
  if (filters.value.timeStatus === 'upcoming') {
    return activeEvents.value.length;
  } else if (filters.value.timeStatus === 'past') {
    return pastEvents.value.length;
  }
  return sortedFilteredEvents.value.length;
});

function applyMobileFiltersAndClose() {
  isMobileFilterOpen.value = false;
  nextTick(() => {
    const container = document.getElementById('events-container');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

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
    console.error('Failed to fetch user timers:', error);
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
    console.error('Failed to fetch meta events:', error);
    metaEvents.value = [];
  }
}

function formatEventDates(event) {
  if (!event || !event.time) return '';
  const start = new Date(event.time);
  const end = event.endTime ? new Date(event.endTime) : null;
  
  const options = { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' };
  const startStr = start.toLocaleDateString('en-US', options);
  
  if (!end || start.toDateString() === end.toDateString()) {
    return startStr;
  }
  const endStr = end.toLocaleDateString('en-US', options);
  return `${startStr} – ${endStr}`;
}

function getCountdownParts(event) {
  if (!event || !event.time) return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
  const now = currentTime.value.getTime();
  const startTime = new Date(event.time).getTime();
  const endTime = event.endTime ? new Date(event.endTime).getTime() : null;

  let target = startTime;
  if (startTime <= now && endTime !== null && endTime >= now) {
    target = endTime;
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
    const location = encodeURIComponent(event.participation || event.country || event.region || 'Online');
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
  showEmbedDrawer.value = false;
  const targetParam = event.slug || String(event.id || '');
  if (targetParam && route.params.id !== targetParam) {
    router.push({ name: 'TimerDetail', params: { id: targetParam } });
  }
}

function closeModal() {
  selectedEvent.value = null;
  showEmbedDrawer.value = false;
  if (route.name === 'TimerDetail') {
    router.push({ name: 'WikiTimer' });
  }
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

function syncSelectedEventFromRoute() {
  if (route.params.id && events.value.length > 0) {
    const rawTarget = String(route.params.id);
    const targetId = rawTarget.toLowerCase();
    const found = events.value.find(e => 
      (e.slug && e.slug.toLowerCase() === targetId) ||
      String(e.id).toLowerCase() === targetId || 
      String(e.id).toLowerCase() === `meta:${targetId}`
    );
    if (found) {
      selectedEvent.value = found;
    }
  } else if (!route.params.id) {
    selectedEvent.value = null;
  }
}

watch(() => route.params.id, () => syncSelectedEventFromRoute());
watch(events, () => syncSelectedEventFromRoute());

function handleKeyDown(e) {
  if (e.key === 'Escape' && selectedEvent.value) {
    closeModal();
  }
}

function resetFilters() {
  filters.value = {
    searchQuery: '',
    region: '',
    wiki: '',
    country: '',
    type: '',
    format: '',
    timeStatus: 'upcoming',
    sort: 'desc',
    starredOnly: false
  };
  selectedTag.value = 'all';
  isPinned.value = false;
  localStorage.removeItem('pinnedFilters');
}

function pinFilters() {
  isPinned.value = true;
  localStorage.setItem('pinnedFilters', JSON.stringify(filters.value));
}

function applyFilters() {
  // Triggers computed reactivity
}

function updateTime() {
  currentTime.value = new Date();
  checkActiveReminders();
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown);
  updateTime();
  timerInterval = setInterval(updateTime, 1000);
  const pinned = localStorage.getItem('pinnedFilters');
  if (pinned) {
    try {
      filters.value = { ...filters.value, ...JSON.parse(pinned) };
      isPinned.value = true;
    } catch (e) {
      console.error('Failed to parse pinned filters', e);
    }
  }
  
  isLoadingEvents.value = true;
  await Promise.all([fetchTimers(), fetchMetaEvents(), loadAndSyncFavorites()]);
  isLoadingEvents.value = false;
  syncSelectedEventFromRoute();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
</style>
