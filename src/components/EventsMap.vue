<template>
  <div class="relative w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900">
    <!-- Map Container -->
    <div ref="mapContainer" class="w-full h-[520px] sm:h-[600px] z-10"></div>

    <!-- Map Floating Stats & Online Drawer Overlay -->
    <div class="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
      <button
        @click="showOnlineDrawer = !showOnlineDrawer"
        class="glass-panel px-4 py-2.5 rounded-xl shadow-md border border-gray-200/60 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 flex items-center gap-2 transition-all"
        :title="showOnlineDrawer ? 'Hide Online Events' : 'View Online & Global Events'"
      >
        <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
        <span>🌐 {{ $t('map.onlineEvents') || 'Online / Global Events' }} ({{ onlineEvents.length }})</span>
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
            <span>🌐 Online & Virtual Events</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold">{{ onlineEvents.length }}</span>
          </h3>
          <button @click="showOnlineDrawer = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div v-if="onlineEvents.length === 0" class="py-6 text-center text-xs text-gray-500 dark:text-gray-400">
          No online events match the current filter.
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
                {{ event.type }}
              </span>
            </div>
            <div class="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span>{{ formatDate(event.time) }}</span>
              <span class="font-mono font-bold" :class="isConcluded(event) ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary-600 dark:text-primary-400'">
                {{ isConcluded(event) ? 'Concluded' : 'View Timer →' }}
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
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

const countryCentroids = {
  'Afghanistan': [33.9391, 67.7100],
  'Albania': [41.1533, 20.1683],
  'Algeria': [28.0339, 1.6596],
  'Argentina': [-38.4161, -63.6167],
  'Armenia': [40.0691, 45.0382],
  'Australia': [-25.2744, 133.7751],
  'Austria': [47.5162, 14.5501],
  'Azerbaijan': [40.1431, 47.5769],
  'Bangladesh': [23.6850, 90.3563],
  'Belgium': [50.5039, 4.4699],
  'Benin': [9.3077, 2.3158],
  'Bolivia': [-16.2902, -63.5887],
  'Botswana': [-22.3285, 24.6849],
  'Brazil': [-14.2350, -51.9253],
  'Bulgaria': [42.7339, 25.4858],
  'Burkina Faso': [12.2383, -1.5616],
  'Cameroon': [7.3697, 12.3547],
  'Canada': [56.1304, -106.3468],
  'Chile': [-35.6751, -71.5430],
  'China': [35.8617, 104.1954],
  'Colombia': [4.5709, -74.2973],
  'Congo': [-0.2280, 15.8277],
  'Costa Rica': [9.7489, -83.7534],
  'Croatia': [45.1000, 15.2000],
  'Czech Republic': [49.8175, 15.4730],
  'Denmark': [56.2639, 9.5018],
  'Dominican Republic': [18.7357, -70.1627],
  'Ecuador': [-1.8312, -78.1834],
  'Egypt': [26.8206, 30.8025],
  'Estonia': [58.5953, 25.0136],
  'Ethiopia': [9.1450, 40.4897],
  'Finland': [61.9241, 25.7482],
  'France': [46.2276, 2.2137],
  'Georgia': [42.3154, 43.3569],
  'Germany': [51.1657, 10.4515],
  'Ghana': [7.9465, -1.0232],
  'Greece': [39.0742, 21.8243],
  'Guatemala': [15.7835, -90.2308],
  'Guinea': [9.9456, -9.6966],
  'Haiti': [18.9712, -72.2852],
  'Honduras': [15.2000, -86.2419],
  'Hungary': [47.1625, 19.5033],
  'India': [20.5937, 78.9629],
  'Indonesia': [-0.7893, 113.9213],
  'Iran': [32.4279, 53.6880],
  'Iraq': [33.2232, 43.6793],
  'Ireland': [53.1424, -7.6921],
  'Israel': [31.0461, 34.8516],
  'Italy': [41.8719, 12.5674],
  'Ivory Coast': [7.5400, -5.5471],
  'Japan': [36.2048, 138.2529],
  'Jordan': [30.5852, 36.2384],
  'Kazakhstan': [48.0196, 66.9237],
  'Kenya': [-0.0236, 37.9062],
  'South Korea': [35.9078, 127.7669],
  'Latvia': [56.8796, 24.6032],
  'Lebanon': [33.8547, 35.8623],
  'Lithuania': [55.1694, 23.8813],
  'Malaysia': [4.2105, 101.9758],
  'Mexico': [23.6345, -102.5528],
  'Morocco': [31.7917, -7.0926],
  'Nepal': [28.3949, 84.1240],
  'Netherlands': [52.1326, 5.2913],
  'New Zealand': [-40.9006, 174.8860],
  'Nigeria': [9.0820, 8.6753],
  'Norway': [60.4720, 8.4689],
  'Pakistan': [30.3753, 69.3451],
  'Palestine': [31.9522, 35.2332],
  'Peru': [-9.1900, -75.0152],
  'Philippines': [12.8797, 121.7740],
  'Poland': [51.9194, 19.1451],
  'Portugal': [39.3999, -8.2245],
  'Romania': [45.9432, 24.9668],
  'Russia': [61.5240, 105.3188],
  'Rwanda': [-1.9403, 29.8739],
  'Saudi Arabia': [23.8859, 45.0792],
  'Senegal': [14.4974, -14.4524],
  'Serbia': [44.0165, 21.0059],
  'Singapore': [1.3521, 103.8198],
  'Slovakia': [48.6690, 19.6990],
  'Slovenia': [46.1512, 14.9955],
  'South Africa': [-30.5595, 22.9375],
  'Spain': [40.4637, -3.7492],
  'Sri Lanka': [7.8731, 80.7718],
  'Sweden': [60.1282, 18.6435],
  'Switzerland': [46.8182, 8.2275],
  'Taiwan': [23.6978, 120.9605],
  'Tanzania': [-6.3690, 34.8888],
  'Thailand': [15.8700, 100.9925],
  'Tunisia': [33.8869, 9.5375],
  'Turkey': [38.9637, 35.2433],
  'Uganda': [1.3733, 32.2903],
  'Ukraine': [48.3794, 31.1656],
  'United Arab Emirates': [23.4241, 53.8478],
  'United Kingdom': [55.3781, -3.4360],
  'United States': [37.0902, -95.7129],
  'Uruguay': [-32.5228, -55.7658],
  'Uzbekistan': [41.3775, 64.5853],
  'Venezuela': [6.4238, -66.5897],
  'Vietnam': [14.0583, 108.2772],
  'Zambia': [-13.1339, 27.8493],
  'Zimbabwe': [-19.0154, 29.1549]
};

const cityCentroids = {
  'Katowice': [50.2649, 19.0238],
  'Nairobi': [-1.2921, 36.8219],
  'Paris': [48.8566, 2.3522],
  'Istanbul': [41.0082, 28.9784],
  'Singapore': [1.3521, 103.8198],
  'Stockholm': [59.3293, 18.0686],
  'Cape Town': [-33.9249, 18.4241],
  'Montreal': [45.5017, -73.5673],
  'Esino Lario': [45.9964, 9.3333],
  'Mexico City': [19.4326, -99.1332],
  'London': [51.5074, -0.1278],
  'Hong Kong': [22.3193, 114.1694],
  'Washington': [38.9072, -77.0369],
  'Haifa': [32.7940, 34.9896],
  'Gdansk': [54.3520, 18.6466],
  'Buenos Aires': [-34.6037, -58.3816],
  'Alexandria': [31.2001, 29.9187],
  'Taipei': [25.0330, 121.5654],
  'Cambridge': [42.3736, -71.1097],
  'Frankfurt': [50.1109, 8.6821],
  'Berlin': [52.5200, 13.4050],
  'Prague': [50.0755, 14.4378],
  'Vienna': [48.2082, 16.3738],
  'Warsaw': [52.2297, 21.0122],
  'Tokyo': [35.6762, 139.6503],
  'Sydney': [-33.8688, 151.2093],
  'Rio de Janeiro': [-22.9068, -43.1729],
  'Sao Paulo': [-23.5505, -46.6333],
  'Athens': [37.9838, 23.7275],
  'Rome': [41.9028, 12.4964],
  'Madrid': [40.4168, -3.7038],
  'Lisbon': [38.7223, -9.1393],
  'Dublin': [53.3498, -6.2603],
  'Lagos': [6.5244, 3.3792],
  'Accra': [5.6037, -0.1870],
  'Bhubaneswar': [20.2961, 85.8245],
  'Delhi': [28.6139, 77.2090],
  'Bangalore': [12.9716, 77.5946],
  'Bengaluru': [12.9716, 77.5946],
  'Mumbai': [19.0760, 72.8777],
  'Dhaka': [23.8103, 90.4125],
  'Kathmandu': [27.7172, 85.3240],
  'Jakarta': [-6.2088, 106.8456],
  'Manila': [14.5995, 120.9842],
  'Kuala Lumpur': [3.1390, 101.6869],
  'Bangkok': [13.7563, 100.5018]
};

const regionCentroids = {
  'CEE': [49.0, 22.0],
  'Central and Eastern Europe': [49.0, 22.0],
  'ESEAP': [2.0, 115.0],
  'East, Southeast Asia and Pacific': [2.0, 115.0],
  'MENA': [26.0, 35.0],
  'Middle East and North Africa': [26.0, 35.0],
  'LATAM': [-15.0, -60.0],
  'Latin America and Caribbean': [-15.0, -60.0],
  'North America': [45.0, -100.0],
  'Sub-Saharan Africa': [2.0, 20.0],
  'South Asia': [22.0, 80.0],
  'West Africa': [10.0, 0.0],
  'Northern and Western Europe': [53.0, 8.0]
};

function getEventCoordinates(event) {
  if (!event) return null;
  const fullLoc = `${event.country || ''} ${event.region || ''} ${event.name || ''}`;
  
  // 1. Check specific city match
  for (const [city, coords] of Object.entries(cityCentroids)) {
    const regex = new RegExp(`\\b${city}\\b`, 'i');
    if (regex.test(fullLoc)) {
      return coords;
    }
  }

  // 2. Check country centroid
  const country = (event.country || '').trim();
  if (country && countryCentroids[country]) {
    return countryCentroids[country];
  }
  if (country) {
    const matchedKey = Object.keys(countryCentroids).find(k => k.toLowerCase() === country.toLowerCase() || country.toLowerCase().includes(k.toLowerCase()));
    if (matchedKey) return countryCentroids[matchedKey];
  }

  // 3. Check region centroid
  const region = (event.region || '').trim();
  if (region && regionCentroids[region]) {
    return regionCentroids[region];
  }
  return null;
}

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
      const statusText = concluded ? '✓ Concluded' : formatDate(ev.time);
      const typeBadgeBg = isDeadline ? '#ffe4e6' : '#eff6ff';
      const typeBadgeColor = isDeadline ? '#9f1239' : '#1e40af';
      const eventKey = encodeURIComponent(getEventUniqueKey(ev));
      
      return `
        <div style="padding: 10px; border-radius: 10px; background: #f9fafb; margin-bottom: 8px; border: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; margin-bottom: 4px;">
            <span style="font-weight: 700; font-size: 12px; color: #111827; line-height: 1.35;">${escapeHtml(ev.name)}</span>
            <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; background: ${typeBadgeBg}; color: ${typeBadgeColor}; padding: 2px 6px; border-radius: 4px; white-space: nowrap;">
              ${ev.type || 'Event'}
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
            View Details &amp; Timer →
          </button>
        </div>
      `;
    }).join('');

    const popupHtml = `
      <div style="min-width: 220px; max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="padding-bottom: 6px; margin-bottom: 6px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between;">
          <div style="font-weight: 800; font-size: 12px; color: #374151; display: flex; align-items: center; gap: 4px;">
            📍 <span>${escapeHtml(group.locationName)}</span>
          </div>
          ${count > 1 ? `<span style="font-size: 10px; font-weight: 700; background: #e0e7ff; color: #3730a3; padding: 1px 6px; border-radius: 9999px;">${count} events</span>` : ''}
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
