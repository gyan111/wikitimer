<template>
  <div class="relative w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900">
    <!-- Map Container -->
    <div ref="mapContainer" class="w-full h-[520px] sm:h-[600px] z-10"></div>

    <!-- Map Floating Stats & Online Drawer Overlay -->
    <div class="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
      <button
        @click="showOnlineDrawer = !showOnlineDrawer"
        class="glass-panel px-4 py-2.5 rounded-xl shadow-md border border-gray-200/60 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 flex items-center gap-2 transition-all cursor-pointer"
        :title="showOnlineDrawer ? $t('map.hideOnlineEvents') : $t('map.onlineEvents')"
      >
        <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
        <span>🌐 {{ $t('map.onlineEvents') }} ({{ onlineEvents.length }})</span>
        <svg class="w-4 h-4 transform transition-transform" :class="{ 'rotate-180': showOnlineDrawer }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
    </div>

    <!-- Online / Virtual Events Drawer -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="showOnlineDrawer"
        class="absolute top-16 right-4 z-20 w-80 sm:w-96 max-h-[460px] overflow-y-auto glass-panel p-4 rounded-2xl shadow-xl border border-gray-200/80 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md flex flex-col gap-3"
      >
        <div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
          <h3 class="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <span>🌐 {{ $t('map.onlineVirtualEvents') }}</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold">{{ onlineEvents.length }}</span>
          </h3>
          <button @click="showOnlineDrawer = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1" :aria-label="$t('modal.close')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div v-if="onlineEvents.length === 0" class="py-6 text-center text-xs text-gray-500 dark:text-gray-400">
          {{ $t('map.noOnlineEvents') }}
        </div>

        <div v-else class="space-y-2.5">
          <div
            v-for="event in onlineEvents"
            :key="event.id || (event.name + event.time)"
            @click="$emit('select-event', event)"
            class="p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-gray-50/70 dark:bg-gray-800/60 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all cursor-pointer flex flex-col gap-1.5"
          >
            <div class="flex items-start justify-between gap-2">
              <h4 class="font-bold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-1 hover:text-primary-600">{{ event.name }}</h4>
              <span class="text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold border flex-shrink-0" :class="event.type === 'deadline' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'">
                {{ event.type === 'deadline' ? $t('filters.deadline') : $t('filters.event') }}
              </span>
            </div>
            <div class="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span>{{ formatDate(event.time) }}</span>
              <span class="font-mono font-bold" :class="isConcluded(event) ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary-600 dark:text-primary-400'">
                {{ isConcluded(event) ? $t('status.ended') : $t('map.viewTimer') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getEventCoordinates } from '@/utils/geo.js';

const { t, locale } = useI18n();

const props = defineProps({
  events: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select-event']);

const mapContainer = ref(null);
let map = null;
let markersLayer = null;
const showOnlineDrawer = ref(false);

const onlineEvents = computed(() => {
  return props.events.filter(event => {
    const isOnlineText = (event.participation || event.country || event.region || '').toLowerCase();
    const coords = getEventCoordinates(event);
    return !coords || isOnlineText.includes('online') || isOnlineText.includes('virtual') || isOnlineText === 'global';
  });
});

function isConcluded(event) {
  if (!event || !event.time) return false;
  const endTime = event.endTime ? new Date(event.endTime) : new Date(event.time);
  return endTime < new Date();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function initMap() {
  if (!mapContainer.value) return;

  map = L.map(mapContainer.value, {
    center: [25, 10],
    zoom: 2,
    minZoom: 2,
    maxZoom: 14,
    worldCopyJump: true
  });

  // OpenStreetMap standard tile layer with clean styling
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
  renderMarkers();
}

function getEventUniqueKey(ev) {
  if (!ev) return '';
  return String(ev.slug || ev.metaId || ev.id || `${ev.name}_${ev.time}`);
}

let lastEventsSignature = '';

function getEventsSignature(eventsList) {
  if (!Array.isArray(eventsList)) return '';
  return eventsList.map(e => `${e.id || e.slug || e.name}_${e.time || ''}_${e.country || ''}`).join('|');
}

function renderMarkers(force = false) {
  if (!markersLayer || !map) return;

  const currentSignature = getEventsSignature(props.events);
  if (!force && currentSignature === lastEventsSignature) {
    return;
  }
  lastEventsSignature = currentSignature;

  markersLayer.clearLayers();

  // Group events by location coordinates
  const locationGroups = new Map();

  props.events.forEach((event) => {
    const coords = getEventCoordinates(event);
    if (!coords) return;

    const locKey = `${coords[0].toFixed(3)},${coords[1].toFixed(3)}`;
    if (!locationGroups.has(locKey)) {
      locationGroups.set(locKey, {
        coords,
        locationName: event.country || event.region || 'Physical Location',
        events: []
      });
    }
    locationGroups.get(locKey).events.push(event);
  });

  let groupIdx = 0;
  locationGroups.forEach((group) => {
    groupIdx++;
    const [lat, lng] = group.coords;
    const count = group.events.length;
    const hasDeadline = group.events.some(e => e.type === 'deadline');
    const allConcluded = group.events.every(e => isConcluded(e));

    // Marker styling
    const markerBg = allConcluded ? '#10b981' : (hasDeadline ? '#f43f5e' : '#3b82f6');
    const markerContent = count > 1 ? count : (hasDeadline ? '⏰' : '📍');

    const iconHtml = `
      <div style="background: ${markerBg}; width: ${count > 1 ? '28px' : '24px'}; height: ${count > 1 ? '28px' : '24px'}; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: ${count > 1 ? '12px' : '11px'}; font-weight: 800; cursor: pointer; transition: transform 0.2s;">
        ${markerContent}
      </div>
    `;

    const customIcon = L.divIcon({
      html: iconHtml,
      className: 'custom-map-pin',
      iconSize: [count > 1 ? 28 : 24, count > 1 ? 28 : 24],
      iconAnchor: [count > 1 ? 14 : 12, count > 1 ? 14 : 12],
      popupAnchor: [0, count > 1 ? -14 : -12]
    });

    const marker = L.marker([lat, lng], { icon: customIcon });

    // Generate rich popup HTML with single or multiple events
    const eventsHtml = group.events.map((ev) => {
      const concluded = isConcluded(ev);
      const isDeadline = ev.type === 'deadline';
      const statusColor = concluded ? '#059669' : (isDeadline ? '#e11d48' : '#2563eb');
      const statusText = concluded ? `✓ ${t('status.ended')}` : formatDate(ev.time);
      const typeBadgeBg = isDeadline ? '#ffe4e6' : '#eff6ff';
      const typeBadgeColor = isDeadline ? '#9f1239' : '#1e40af';
      const typeBadgeLabel = isDeadline ? t('filters.deadline') : t('filters.event');
      const eventKey = encodeURIComponent(getEventUniqueKey(ev));
      const buttonLabel = t('map.viewDetailsAndTimer');
      
      return `
        <div style="padding: 10px; border-radius: 10px; background: #f9fafb; margin-bottom: 8px; border: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; margin-bottom: 4px;">
            <span style="font-weight: 700; font-size: 12px; color: #111827; line-height: 1.35;">${escapeHtml(ev.name)}</span>
            <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; background: ${typeBadgeBg}; color: ${typeBadgeColor}; padding: 2px 6px; border-radius: 4px; white-space: nowrap;">
              ${escapeHtml(typeBadgeLabel)}
            </span>
          </div>
          <div style="font-size: 11px; font-weight: 600; color: ${statusColor}; margin-bottom: 8px;">
            📅 ${statusText}
          </div>
          <button
            type="button"
            data-event-key="${eventKey}"
            onclick="window.__wikitimer_select_event &amp;&amp; window.__wikitimer_select_event('${eventKey}')"
            style="width: 100%; background: #2563eb; color: #ffffff; border: none; border-radius: 8px; padding: 6px 10px; font-size: 11px; font-weight: 700; cursor: pointer; text-align: center; display: block; box-shadow: 0 1px 3px rgba(0,0,0,0.12);"
          >
            ${escapeHtml(buttonLabel)}
          </button>
        </div>
      `;
    }).join('');

    const eventsCountLabel = t('map.eventsCount', { count });
    const popupHtml = `
      <div style="min-width: 220px; max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="padding-bottom: 6px; margin-bottom: 6px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between;">
          <div style="font-weight: 800; font-size: 12px; color: #374151; display: flex; align-items: center; gap: 4px;">
            📍 <span>${escapeHtml(group.locationName)}</span>
          </div>
          ${count > 1 ? `<span style="font-size: 10px; font-weight: 700; background: #e0e7ff; color: #3730a3; padding: 1px 6px; border-radius: 9999px;">${escapeHtml(eventsCountLabel)}</span>` : ''}
        </div>
        <div style="max-height: 240px; overflow-y: auto; padding-right: 2px;">
          ${eventsHtml}
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml, { maxWidth: 300, autoPan: true });

    markersLayer.addLayer(marker);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

watch(() => props.events, () => {
  renderMarkers();
});

watch(locale, () => {
  renderMarkers(true);
});

onMounted(() => {
  window.__wikitimer_select_event = (encodedKey) => {
    const rawKey = decodeURIComponent(encodedKey || '');
    const found = props.events.find(ev => getEventUniqueKey(ev) === rawKey || String(ev.id) === rawKey || String(ev.slug) === rawKey);
    if (found) {
      emit('select-event', found);
    }
  };

  initMap();

  if (mapContainer.value) {
    mapContainer.value.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-event-key]');
      if (btn) {
        e.preventDefault();
        const encodedKey = btn.getAttribute('data-event-key');
        if (encodedKey && window.__wikitimer_select_event) {
          window.__wikitimer_select_event(encodedKey);
        }
      }
    });
  }
});

onUnmounted(() => {
  delete window.__wikitimer_select_event;
  if (map) {
    map.remove();
  }
});
</script>

<style>
.custom-map-pin:hover div {
  transform: scale(1.25);
}
.leaflet-popup-content-wrapper {
  border-radius: 14px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
}
</style>
