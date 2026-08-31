<template>
  <div class="embed-wrapper min-h-screen flex items-center justify-center p-3 font-sans" :class="{ 'dark': isDark }">
    <div v-if="loading" class="flex items-center justify-center p-6 text-gray-500 dark:text-gray-400 text-sm">
      <div class="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-2"></div>
      {{ $t('timers.loading') }}
    </div>

    <div v-else-if="!event" class="text-center p-6 text-gray-500 dark:text-gray-400 text-sm">
      {{ $t('timers.notFound') }}
    </div>

    <div
      v-else
      class="w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-lg p-4 transition-all duration-300"
    >
      <!-- Header with Logo and Title -->
      <div class="flex items-center gap-3 mb-3">
        <img
          :src="event.logo || getWikiLogo(event.link || '')"
          :alt="event.name"
          class="w-9 h-9 object-contain rounded-lg p-1 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shrink-0"
        />
        <div class="min-w-0 flex-1">
          <a
            :href="event.link || `/timer/${routeParam}`"
            target="_blank"
            rel="noopener noreferrer"
            class="font-bold text-sm text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1 flex items-center gap-1"
          >
            <span>{{ event.name }}</span>
            <svg class="w-3 h-3 shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
          <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
            <span v-if="event.country">📍 {{ event.country }}</span>
            <span v-else-if="event.region">🌐 {{ event.region }}</span>
            <span>•</span>
            <span>{{ formatDate(event.time) }}</span>
          </div>
        </div>
      </div>

      <!-- Live Countdown Clock Box -->
      <div class="bg-gray-50/80 dark:bg-gray-800/60 rounded-xl p-3 border border-gray-100 dark:border-gray-700/60 mb-3 text-center">
        <!-- Concluded State -->
        <div v-if="isConcluded" class="py-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          {{ $t('status.ended') }}
        </div>

        <!-- Ongoing State -->
        <div v-else-if="isOngoing" class="py-1 text-amber-600 dark:text-amber-400 font-bold text-sm flex items-center justify-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          {{ $t('status.inProgress') }}
        </div>

        <!-- Active Countdown Digits -->
        <div v-else class="grid grid-cols-4 gap-2">
          <div class="bg-white dark:bg-gray-900 rounded-lg p-2 shadow-2xs border border-gray-200/50 dark:border-gray-700/50">
            <div class="text-lg font-black text-primary-600 dark:text-primary-400 font-mono leading-none">{{ countdown.days }}</div>
            <div class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-1">{{ $t('time.days') }}</div>
          </div>
          <div class="bg-white dark:bg-gray-900 rounded-lg p-2 shadow-2xs border border-gray-200/50 dark:border-gray-700/50">
            <div class="text-lg font-black text-gray-800 dark:text-gray-100 font-mono leading-none">{{ countdown.hours }}</div>
            <div class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-1">{{ $t('time.hours') }}</div>
          </div>
          <div class="bg-white dark:bg-gray-900 rounded-lg p-2 shadow-2xs border border-gray-200/50 dark:border-gray-700/50">
            <div class="text-lg font-black text-gray-800 dark:text-gray-100 font-mono leading-none">{{ countdown.minutes }}</div>
            <div class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-1">{{ $t('time.minutes') }}</div>
          </div>
          <div class="bg-white dark:bg-gray-900 rounded-lg p-2 shadow-2xs border border-gray-200/50 dark:border-gray-700/50">
            <div class="text-lg font-black text-gray-800 dark:text-gray-100 font-mono leading-none">{{ countdown.seconds }}</div>
            <div class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-1">{{ $t('time.seconds') }}</div>
          </div>
        </div>
      </div>

      <!-- Footer Attribution Link -->
      <div class="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 px-1">
        <span>⏱️ Live Wikimedia Countdown</span>
        <a
          :href="`/timer/${routeParam}`"
          target="_blank"
          rel="noopener noreferrer"
          class="font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5"
        >
          <span>Wiki Timer</span>
          <span>→</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const routeParam = computed(() => String(route.params.id || ''));

const loading = ref(true);
const event = ref(null);
const currentTime = ref(new Date());
let timerInterval = null;

// Auto-detect theme from URL param ?theme=dark|light or system preference
const isDark = computed(() => {
  if (route.query.theme === 'dark') return true;
  if (route.query.theme === 'light') return false;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
});

function getWikiLogo(link = '', name = '', topics = '') {
  const text = `${name || ''} ${topics || ''} ${link || ''}`.toLowerCase();
  if (text.includes('wikimania')) return 'https://upload.wikimedia.org/wikipedia/commons/2/20/Wikimania_logo_with_text.svg';
  if (text.includes('hackathon') || text.includes('techcom')) return 'https://upload.wikimedia.org/wikipedia/commons/8/85/Wikimedia_hackathon_mark_horizontal.svg';
  if (text.includes('wiki loves monuments') || text.includes('wlm')) return 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Wiki_Loves_Monuments_logo.svg';
  if (text.includes('wiki loves earth') || text.includes('wle')) return 'https://upload.wikimedia.org/wikipedia/commons/7/7b/WLE_Austria_Logo.svg';
  if (text.includes('wiki loves africa') || text.includes('wla')) return 'https://upload.wikimedia.org/wikipedia/commons/2/28/Wiki_Loves_Africa_logo_without_text.svg';
  if (text.includes('glam') || text.includes('heritage')) return 'https://upload.wikimedia.org/wikipedia/commons/9/91/GLAM_logo.svg';
  if (text.includes('1lib1ref')) return 'https://upload.wikimedia.org/wikipedia/commons/a/a2/1Lib1Ref_logo.svg';
  if (text.includes('wikidata')) return 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Wikidata-logo.svg';
  if (text.includes('commons')) return 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Commons-logo.svg';
  if (text.includes('mediawiki')) return 'https://upload.wikimedia.org/wikipedia/commons/a/a6/MediaWiki-2020-icon.svg';
  if (text.includes('wikipedia')) return 'https://upload.wikimedia.org/wikipedia/commons/8/80/Wikipedia-logo-v2.svg';
  return 'https://upload.wikimedia.org/wikipedia/commons/7/75/Wikimedia_Community_Logo.svg';
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const isOngoing = computed(() => {
  if (!event.value || !event.value.time) return false;
  const start = new Date(event.value.time);
  const end = event.value.endTime ? new Date(event.value.endTime) : null;
  return start <= currentTime.value && end !== null && end >= currentTime.value;
});

const isConcluded = computed(() => {
  if (!event.value || !event.value.time) return false;
  const end = event.value.endTime ? new Date(event.value.endTime) : new Date(event.value.time);
  return end < currentTime.value;
});

const countdown = computed(() => {
  if (!event.value || !event.value.time) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00' };
  }

  const target = (event.value.type === 'deadline' && event.value.endTime)
    ? new Date(event.value.endTime)
    : ((isOngoing.value && event.value.endTime) ? new Date(event.value.endTime) : new Date(event.value.time));
  const diff = target.getTime() - currentTime.value.getTime();

  if (diff <= 0) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00' };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  };
});

async function loadEvent() {
  loading.value = true;
  try {
    const [timersRes, metaRes] = await Promise.allSettled([
      fetch('/timers'),
      fetch('/meta-events')
    ]);

    const allEvents = [];
    if (timersRes.status === 'fulfilled' && timersRes.value.ok) {
      const timers = await timersRes.value.json();
      if (Array.isArray(timers)) allEvents.push(...timers);
    }
    if (metaRes.status === 'fulfilled' && metaRes.value.ok) {
      const meta = await metaRes.value.json();
      if (Array.isArray(meta)) allEvents.push(...meta);
    }

    const targetParam = routeParam.value.toLowerCase().trim();
    const found = allEvents.find(e => 
      (e.slug && e.slug.toLowerCase() === targetParam) ||
      String(e.id).toLowerCase() === targetParam ||
      String(e.id).toLowerCase() === `meta:${targetParam}` ||
      (e.name && e.name.toLowerCase() === targetParam)
    );

    if (found) {
      event.value = found;
    }
  } catch (e) {
    console.error('Failed to load event for embed:', e);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadEvent();
  timerInterval = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
.embed-wrapper {
  background: transparent;
}
</style>
