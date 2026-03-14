<template>
  <div class="container mx-auto p-2 sm:p-6 w-full max-w-none">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 px-2">
      <div class="flex items-center gap-3">
        <h1 class="text-4xl font-extrabold tracking-tight text-gradient drop-shadow-sm">{{ $t('app.title') }}</h1>
        <div class="h-8 w-1 bg-gradient-to-b from-primary-400 to-indigo-500 rounded-full hidden sm:block"></div>
        <p class="hidden sm:block text-slate-500 dark:text-slate-400 font-medium">{{ $t('timers.search') }}</p>
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
          class="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 font-medium shadow-sm transition-all duration-300"
        >
          Logout <span class="opacity-70 font-normal">({{ user?.username }})</span>
        </button>
        <button 
          v-else
          @click="login"
          class="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 font-medium shadow-sm transition-all duration-300"
        >
          {{ $t('app.login') }}
        </button>
      </div>
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
          <option value="">All Regions</option>
          <option v-for="region in uniqueRegions" :key="region" :value="region">{{ region }}</option>
        </select>
        
        <select 
          id="country" 
          v-model="filters.country" 
          @change="applyFilters" 
          class="flex-1 py-2.5 px-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer"
        >
          <option value="">All Countries</option>
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
          id="sort" 
          v-model="filters.sort" 
          @change="applyFilters" 
          class="flex-1 py-2.5 px-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent appearance-none hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer"
        >
          <option value="desc">Recent First</option>
          <option value="asc">Oldest First</option>
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

    <transition
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
            :key="event.name + event.time"
            v-if="event && event.link && event.name && event.time"
            class="glass-card !bg-white/80 dark:!bg-gray-900 rounded-2xl p-6 flex flex-col gap-5 cursor-pointer relative overflow-hidden group border-t-4"
            :class="event.type === 'event' ? 'border-t-blue-500' : 'border-t-purple-500'"
            @click="viewEvent(event)"
          >
            <!-- Background Glow Effect on Hover -->
            <div class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                 :class="event.type === 'event' ? 'from-blue-400 to-indigo-600' : 'from-purple-400 to-pink-600'"></div>
            
            <div class="flex items-start gap-4 relative z-10">
              <div class="flex-shrink-0 w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800 p-1 shadow-sm overflow-hidden flex items-center justify-center">
                <img v-if="event && event.logo" :src="event.logo" alt="logo" class="w-full h-auto object-contain" @error="$event.target.src=fallbackLogo" />
                <span v-else class="text-xs font-bold text-gray-400">W</span>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-lg leading-tight truncate text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{{ event?.name }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{{ event?.region }}</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 truncate">{{ event?.country }}</p>
              </div>
            </div>
            
            <div class="flex flex-wrap gap-2 items-center relative z-10">
              <span 
                class="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider shadow-sm border"
                :class="event.type === 'event' ? 'bg-blue-50/80 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300' : 'bg-purple-50/80 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-300'"
              >
                <span class="w-1.5 h-1.5 rounded-full mr-1.5 self-center inline-block" :class="event.type === 'event' ? 'bg-blue-500' : 'bg-purple-500'"></span>
                {{ event.type }}
              </span>
              <a v-if="event && event.link" :href="event.link" target="_blank" rel="noopener" class="ml-auto inline-flex items-center text-xs font-medium text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors bg-white/50 dark:bg-gray-800/50 py-1 px-2 rounded-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm hover:shadow-sm" @click.stop>
                Link
                <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
            </div>
            
            <div class="mt-2 pt-4 border-t border-gray-100 dark:border-gray-700/50 relative z-10">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Countdown</span>
                <span class="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">{{ event?.timeZone }}</span>
              </div>
              <div class="flex items-end gap-2">
                <span class="text-2xl font-bold tabular-nums tracking-tight text-gradient">{{ event?.time ? formatDate(event.time) : '' }}</span>
              </div>
              <div class="mt-1 font-mono text-sm tracking-wider tabular-nums font-bold opacity-80" :class="event.type === 'event' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'">
                {{ event?.time ? formatTime(event.time).months + 'M ' + formatTime(event.time).hours + 'h ' + formatTime(event.time).minutes + 'm ' + formatTime(event.time).seconds + 's' : '' }}
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </transition>
  </div>
</template>



<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '../store/auth';

const { user, isAuthenticated, login, logout, checkAuth } = useAuth();

// Check authentication status when component mounts
onMounted(() => {
  checkAuth();
});

const currentTime = ref(new Date());
const filters = ref({
  region: '',
  country: '',
  type: '',
  sort: 'asc'
});
const isPinned = ref(false);
const fallbackLogo = 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Wikimania_2024_wiki_header_registration.png';
const events = ref([]);

const uniqueRegions = computed(() => {
  return [...new Set(events.value.map(event => event.region))];
});

const uniqueCountries = computed(() => {
  return [...new Set(events.value.map(event => event.country))];
});

const filteredEvents = computed(() => {
  // Only include valid event objects with required fields
  return events.value.filter(event => {
    return (
      event && typeof event === 'object' && event.link && event.name && event.time &&
      (!filters.value.region || event.region === filters.value.region) &&
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
    const data = await response.json();
    events.value = data;
  } catch (error) {
    console.error('Error fetching timers:', error);
  }
}

function showNoTimersAlert() {
  alert('No active event or deadline timers added.');
}

function formatDate(time) {
  const eventTime = new Date(time);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return eventTime.toLocaleDateString('en-US', options);
}

function formatTime(time) {
  const eventTime = new Date(time);
  const now = new Date();
  let diff = eventTime - now;

  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  diff -= months * (1000 * 60 * 60 * 24 * 30);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  diff -= hours * (1000 * 60 * 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  diff -= minutes * (1000 * 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    months: months < 10 ? `0${months}` : months,
    hours: hours < 10 ? `0${hours}` : hours,
    minutes: minutes < 10 ? `0${minutes}` : minutes,
    seconds: seconds < 10 ? `0${seconds}` : seconds,
  };
}

function applyFilters() {
  // This method will trigger the computed property filteredEvents to update
}

function resetFilters() {
  filters.value.region = '';
  filters.value.country = '';
  filters.value.type = '';
  filters.value.sort = 'asc';
  isPinned.value = false;
  localStorage.removeItem('pinnedFilters');
  applyFilters();
}

function pinFilters() {
  isPinned.value = true;
  localStorage.setItem('pinnedFilters', JSON.stringify(filters.value));
}

function viewEvent(event) {
  // Do nothing for now
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

onMounted(() => {
  updateTime();
  setInterval(updateTime, 1000);
  fetchTimers();
  loadPinnedFilters();
});
</script>

<style scoped>
</style>
