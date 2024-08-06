<template>
  <div class="container mx-auto text-center p-6">
    <div class="bg-gray-200 p-2 mb-4">
      <p class="text-sm">Your current time: {{ formattedCurrentTime }}</p>
    </div>
    <h1 class="text-3xl font-bold mb-4">Wiki Timer</h1>
    <div class="mb-6 w-full">
      <div class="flex flex-wrap justify-center gap-4 mb-4 w-full items-center">
        <div class="w-full sm:w-auto flex-grow">
          <select id="region" v-model="filters.region" @change="applyFilters" class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="">Region</option>
            <option v-for="region in uniqueRegions" :key="region" :value="region">{{ region }}</option>
          </select>
        </div>
        <div class="w-full sm:w-auto flex-grow">
          <select id="country" v-model="filters.country" @change="applyFilters" class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="">Country</option>
            <option v-for="country in uniqueCountries" :key="country" :value="country">{{ country }}</option>
          </select>
        </div>
        <div class="w-full sm:w-auto flex-grow">
          <select id="type" v-model="filters.type" @change="applyFilters" class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="">Event Type</option>
            <option value="event">Event</option>
            <option value="deadline">Deadline</option>
          </select>
        </div>
        <div class="w-full sm:w-auto flex-grow">
          <select id="sort" v-model="filters.sort" @change="applyFilters" class="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="asc">Time Ascending</option>
            <option value="desc">Time Descending</option>
          </select>
        </div>
        <div class="w-full sm:w-auto">
          <button @click="pinFilters" :class="isPinned ? 'bg-green-500' : 'bg-gray-500'" class="block w-full sm:w-auto mt-1 sm:mt-0 px-4 py-2 text-white rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            {{ isPinned ? 'Filters Pinned' : 'Pin Filter' }}
          </button>
        </div>
        <div class="w-full sm:w-auto">
          <button @click="resetFilters" class="block w-full sm:w-auto mt-1 sm:mt-0 px-4 py-2 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Reset</button>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="(event, index) in sortedFilteredEvents"
        :key="index"
        :class="event.type === 'event' ? 'bg-blue-500' : 'bg-purple-500'"
        class="p-6 rounded-lg shadow-md text-white"
      >
        <h2 class="text-xl font-semibold mb-2">
          <a :href="event.link" target="_blank" class="text-white">{{ event.name }}</a>
        </h2>
        <a :href="event.link" target="_blank">
          <img :src="event.logo" alt="Event Logo" class="w-24 h-auto mx-auto mb-2" @error="event.logo = fallbackLogo">
        </a>
        <p class="mt-2 text-sm">{{ event.country }} - {{ formatDate(event.time) }}</p>
        <div class="flex flex-col items-center mt-4">
          <div class="flex text-2xl font-bold">
            <div class="flex flex-col items-center mx-1">
              <span class="inline-block w-12 h-12 leading-[3rem] bg-[rgba(255,255,255,0.1)] rounded text-center transition-transform duration-300">{{ formatTime(event.time).months }}</span>
              <span class="text-xs mt-1 uppercase">Months</span>
            </div>
            <span class="inline-block w-5 text-center leading-[3rem]">:</span>
            <div class="flex flex-col items-center mx-1">
              <span class="inline-block w-12 h-12 leading-[3rem] bg-[rgba(255,255,255,0.1)] rounded text-center transition-transform duration-300">{{ formatTime(event.time).hours }}</span>
              <span class="text-xs mt-1 uppercase">Hours</span>
            </div>
            <span class="inline-block w-5 text-center leading-[3rem]">:</span>
            <div class="flex flex-col items-center mx-1">
              <span class="inline-block w-12 h-12 leading-[3rem] bg-[rgba(255,255,255,0.1)] rounded text-center transition-transform duration-300">{{ formatTime(event.time).minutes }}</span>
              <span class="text-xs mt-1 uppercase">Minutes</span>
            </div>
            <span class="inline-block w-5 text-center leading-[3rem]">:</span>
            <div class="flex flex-col items-center mx-1">
              <span class="inline-block w-12 h-12 leading-[3rem] bg-[rgba(255,255,255,0.1)] rounded text-center transition-transform duration-300">{{ formatTime(event.time).seconds }}</span>
              <span class="text-xs mt-1 uppercase">Seconds</span>
            </div>
          </div>
          <div class="mt-4">
            <button @click="viewEvent(event)" class="px-4 py-2 text-white bg-[rgba(255,255,255,0.2)] rounded transition-colors duration-300 hover:bg-[rgba(255,255,255,0.4)]">View</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentTime: new Date(),
      filters: {
        region: '',
        country: '',
        type: '',
        sort: 'asc'
      },
      isPinned: false,
      fallbackLogo: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Wikimania_2024_wiki_header_registration.png',
      events: []
    };
  },
  computed: {
    uniqueRegions() {
      return [...new Set(this.events.map(event => event.region))];
    },
    uniqueCountries() {
      return [...new Set(this.events.map(event => event.country))];
    },
    filteredEvents() {
      return this.events.filter(event => {
        return (
          (!this.filters.region || event.region === this.filters.region) &&
          (!this.filters.country || event.country === this.filters.country) &&
          (!this.filters.type || event.type === this.filters.type)
        );
      });
    },
    sortedFilteredEvents() {
      return this.filteredEvents.sort((a, b) => {
        const dateA = new Date(a.time);
        const dateB = new Date(b.time);
        return this.filters.sort === 'asc' ? dateA - dateB : dateB - dateA;
      });
    },
    formattedCurrentTime() {
      return this.currentTime.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(',', '').replace(',', ' ').replace(',', '');
    }
  },
  methods: {
    async fetchTimers() {
      try {
        const response = await fetch('/timers');
        const data = await response.json();
        this.events = data;
      } catch (error) {
        console.error('Error fetching timers:', error);
      }
    },
    formatDate(time) {
      const eventTime = new Date(time);
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return eventTime.toLocaleDateString('en-US', options);
    },
    formatTime(time) {
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
    },
    applyFilters() {
      // This method will trigger the computed property filteredEvents to update
    },
    resetFilters() {
      this.filters.region = '';
      this.filters.country = '';
      this.filters.type = '';
      this.filters.sort = 'asc';
      this.isPinned = false;
      localStorage.removeItem('pinnedFilters');
      this.applyFilters();
    },
    pinFilters() {
      this.isPinned = true;
      localStorage.setItem('pinnedFilters', JSON.stringify(this.filters));
    },
    viewEvent(event) {
      // Do nothing for now
    },
    updateTime() {
      this.currentTime = new Date();
    },
    loadPinnedFilters() {
      const pinnedFilters = localStorage.getItem('pinnedFilters');
      if (pinnedFilters) {
        this.filters = JSON.parse(pinnedFilters);
        this.isPinned = true;
      }
    }
  },
  mounted() {
    this.updateTime();
    setInterval(this.updateTime, 1000);
    this.fetchTimers();
    this.loadPinnedFilters();
  },
};
</script>

<style scoped>
</style>
