<template>
  <div class="space-y-4">
    <!-- Top Header: Navigation, Month Label, Sub-view Switcher & Semantic Color Legend -->
    <div class="glass-panel p-3.5 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 shadow-sm flex flex-col gap-3">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <!-- Left: Month Navigation (< Month Year > + Today) -->
        <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
          <!-- Standalone Today Jump Button -->
          <button
            @click="goToToday"
            class="px-3 py-1.5 text-xs font-bold rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200/70 dark:border-gray-700/70 transition-all shadow-2xs hover:shadow-xs cursor-pointer min-h-[38px] flex items-center justify-center gap-1.5"
            :title="$t('calendar.today')"
          >
            <span class="text-primary-600 dark:text-primary-400">📍</span>
            <span>{{ $t('calendar.today') }}</span>
          </button>

          <!-- Interactive Month Switcher: < Month Year > -->
          <div class="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-2xs">
            <button
              @click="prevMonth"
              class="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all shadow-2xs cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              :title="$t('calendar.prevMonth')"
              aria-label="Previous Month"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div class="px-3 sm:px-4 py-1 text-center min-w-[130px] sm:min-w-[160px]">
              <h2 class="text-sm sm:text-base font-black text-gray-900 dark:text-white tracking-tight">
                {{ monthYearLabel }}
              </h2>
            </div>

            <button
              @click="nextMonth"
              class="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all shadow-2xs cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              :title="$t('calendar.nextMonth')"
              aria-label="Next Month"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Right: Sub-View Toggle (Month Grid vs Agenda Feed) -->
        <div class="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <div class="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200/60 dark:border-gray-700/60 w-full sm:w-auto">
            <button
              @click="calendarSubView = 'grid'"
              :class="calendarSubView === 'grid' ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium'"
              class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs transition-all cursor-pointer min-h-[36px]"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>{{ $t('calendar.monthView') }}</span>
            </button>
            <button
              @click="calendarSubView = 'agenda'"
              :class="calendarSubView === 'agenda' ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium'"
              class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs transition-all cursor-pointer min-h-[36px]"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>{{ $t('calendar.agendaView') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Color Legend Bar -->
      <div class="flex items-center flex-wrap gap-2 sm:gap-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-[10px] sm:text-[11px] font-medium text-gray-600 dark:text-gray-300">
        <span class="text-gray-400 dark:text-gray-500 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">Legend:</span>
        <div class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
          <span>Conferences</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>Deadlines</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-purple-500"></span>
          <span>Edit-a-thons</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Meetups</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>Contests</span>
        </div>
      </div>
    </div>

    <!-- VIEW 1: MONTH GRID (Responsive: Compact Keypad Matrix on Mobile + Integrated Day Stream) -->
    <div v-if="calendarSubView === 'grid'" class="space-y-4">
      <div class="glass-panel rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 shadow-lg overflow-hidden">
        <!-- Weekday Headers -->
        <div class="grid grid-cols-7 border-b border-gray-200/80 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-800/60 text-center py-2 text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div v-for="(day, idx) in weekdayNames" :key="idx" class="truncate px-0.5">
            <span class="hidden sm:inline">{{ day.full }}</span>
            <span class="sm:hidden">{{ day.short }}</span>
          </div>
        </div>

        <!-- 7x5 or 7x6 Calendar Grid -->
        <div class="grid grid-cols-7 auto-rows-fr bg-gray-200/60 dark:bg-gray-800/60 gap-[1px]">
          <div
            v-for="day in calendarDays"
            :key="day.dateString"
            @click="selectDay(day, true)"
            :class="[
              'min-h-[56px] sm:min-h-[110px] lg:min-h-[125px] p-1 sm:p-2 transition-all flex flex-col items-center sm:items-stretch justify-between cursor-pointer relative overflow-hidden',
              day.isCurrentMonth ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/90 dark:bg-gray-950/60 text-gray-400 dark:text-gray-600',
              selectedDay && selectedDay.dateString === day.dateString ? 'ring-2 ring-primary-500 ring-inset z-10 bg-primary-50/30 dark:bg-primary-950/30' : 'hover:bg-primary-50/15 dark:hover:bg-primary-950/10'
            ]"
          >
            <!-- Date Number & Mobile Indicator Dots -->
            <div class="flex flex-col sm:flex-row items-center justify-between w-full mb-0.5 z-10">
              <span
                :class="[
                  'text-xs sm:text-sm font-bold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full transition-all',
                  day.isToday
                    ? 'bg-primary-600 text-white shadow-xs font-black ring-2 ring-primary-300 dark:ring-primary-900'
                    : (selectedDay && selectedDay.dateString === day.dateString
                      ? 'bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-extrabold'
                      : (day.isCurrentMonth ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'))
                ]"
              >
                {{ day.dayNumber }}
              </span>

              <!-- Mobile Dots on small screens -->
              <div v-if="day.events.length > 0" class="flex sm:hidden items-center gap-0.5 mt-1">
                <span
                  v-for="(item, eIdx) in day.events.slice(0, 3)"
                  :key="eIdx"
                  :class="['w-1.5 h-1.5 rounded-full', item.theme.dotClass]"
                ></span>
                <span v-if="day.events.length > 3" class="text-[8px] font-bold text-gray-500 dark:text-gray-400">+</span>
              </div>
            </div>

            <!-- Desktop Event Chips (Hidden on small mobile screens, shown on sm+) -->
            <div class="hidden sm:flex flex-col gap-1 flex-1 overflow-hidden w-full">
              <button
                v-for="item in day.events.slice(0, 2)"
                :key="item.event.id || (item.event.name + item.labelPrefix + item.rangeBadge)"
                @click.stop="onEventClick(item, day)"
                :class="[
                  'w-full text-left px-2 py-1 rounded-lg text-[11px] font-semibold transition-all truncate border flex items-center justify-between gap-1 group cursor-pointer shadow-2xs hover:shadow-xs hover:scale-[1.01]',
                  item.theme.chipClass
                ]"
                :title="item.event.name + ' • ' + (item.durationLabel || item.fullDateRange)"
              >
                <div class="flex items-center gap-1 min-w-0 truncate">
                  <span class="text-[10px] shrink-0">{{ item.theme.icon }}</span>
                  <span class="truncate">{{ item.labelPrefix }}{{ item.event.name }}</span>
                </div>
                <!-- Badge: e.g. "3 Days", "Day 2/3", "Final Day" -->
                <span
                  v-if="item.rangeBadge"
                  class="text-[9px] px-1 py-0.2 rounded font-mono font-bold shrink-0 opacity-90 border"
                  :class="item.theme.badgeClass"
                >
                  {{ item.rangeBadge }}
                </span>
              </button>

              <!-- +N more button with smooth auto-scroll to information area -->
              <button
                v-if="day.events.length > 2"
                @click.stop="selectDay(day, true)"
                class="text-left px-1 py-0.5 text-[10px] font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline transition-colors cursor-pointer"
              >
                +{{ day.events.length - 2 }} {{ $t('calendar.moreEvents') }} ↓
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Integrated Active Day Details Stream (Essential on Mobile & Desktop) -->
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-3"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-3"
      >
        <div
          v-if="selectedDay"
          ref="selectedDayDrawerRef"
          class="glass-panel p-4 sm:p-6 rounded-2xl border-2 border-primary-300/80 dark:border-primary-700/80 bg-white/95 dark:bg-gray-900/95 shadow-xl scroll-mt-20"
        >
          <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
            <div class="flex items-center gap-2.5">
              <span class="p-2 sm:p-2.5 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 shadow-2xs">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              <div>
                <h3 class="font-black text-sm sm:text-lg text-gray-900 dark:text-white">
                  {{ formatFullSelectedDate(selectedDay.date) }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {{ uniqueSelectedEvents.length }} {{ uniqueSelectedEvents.length === 1 ? $t('calendar.eventScheduled') : $t('calendar.eventsScheduled') }}
                </p>
              </div>
            </div>
            <button
              @click="selectedDay = null"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              :title="$t('modal.close')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Empty Date State with Quick Jump to Next Event -->
          <div v-if="uniqueSelectedEvents.length === 0" class="py-6 sm:py-8 text-center text-sm text-gray-500 dark:text-gray-400 flex flex-col items-center gap-3">
            <p class="font-semibold">✨ {{ $t('calendar.noEventsOnDate') }}</p>
            <button
              v-if="nextActiveEventDay"
              @click="selectDay(nextActiveEventDay, true)"
              class="px-4 py-2 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold border border-primary-200 dark:border-primary-800 hover:bg-primary-100 transition-all text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next Event on {{ formatDateShort(nextActiveEventDay.date) }}</span>
              <span>→</span>
            </button>
          </div>

          <!-- Event Cards List -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="item in uniqueSelectedEvents"
              :key="item.event.id || (item.event.name + item.labelPrefix)"
              @click="$emit('select-event', item.event)"
              class="p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 hover:border-primary-400 dark:hover:border-primary-600 bg-gray-50/70 dark:bg-gray-800/50 hover:bg-primary-50/30 dark:hover:bg-primary-950/20 transition-all cursor-pointer flex flex-col justify-between gap-3 group shadow-2xs hover:shadow-md active:scale-[0.99]"
            >
              <div>
                <div class="flex items-start justify-between gap-2 mb-2">
                  <span
                    :class="[
                      'text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider border',
                      item.theme.badgeClass
                    ]"
                  >
                    {{ item.theme.label }}
                  </span>
                  <span v-if="item.durationLabel" class="text-xs font-mono font-bold text-primary-600 dark:text-primary-400">
                    {{ item.durationLabel }}
                  </span>
                  <span v-else-if="item.fullDateRange" class="text-xs font-mono font-semibold text-gray-500 dark:text-gray-400">
                    {{ item.fullDateRange }}
                  </span>
                </div>
                <h4 class="font-bold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                  {{ item.event.name }}
                </h4>
              </div>

              <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2.5 border-t border-gray-100 dark:border-gray-700/60">
                <span class="flex items-center gap-1 truncate max-w-[140px]">
                  <span>📍</span>
                  <span class="truncate">{{ item.event.country || item.event.region || 'Global / Online' }}</span>
                </span>
                <span class="font-bold text-primary-600 dark:text-primary-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>{{ $t('modal.viewDetails') }}</span>
                  <span>→</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- VIEW 2: AGENDA / TIMELINE FEED (Mobile-Friendly Continuous List) -->
    <div v-else class="space-y-4 sm:space-y-6">
      <div v-if="agendaDayGroups.length === 0" class="glass-panel p-10 rounded-2xl text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800">
        <p class="text-base font-semibold">✨ {{ $t('calendar.noEventsMatching') }}</p>
      </div>

      <div
        v-for="group in agendaDayGroups"
        :key="group.dateString"
        class="space-y-2.5"
      >
        <div class="flex items-center gap-2 px-1">
          <span class="w-2.5 h-2.5 rounded-full bg-primary-500"></span>
          <h3 class="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white tracking-tight uppercase">
            {{ group.dateFormatted }} ({{ group.events.length }})
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="item in group.events"
            :key="item.event.id || (item.event.name + item.labelPrefix)"
            @click="$emit('select-event', item.event)"
            class="glass-panel p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 bg-white/95 dark:bg-gray-900/95 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-xs hover:shadow-md group active:scale-[0.99]"
          >
            <div>
              <div class="flex items-start justify-between gap-2 mb-2">
                <span
                  :class="[
                    'text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider border',
                    item.theme.badgeClass
                  ]"
                >
                  {{ item.theme.label }}
                </span>
                <span class="text-xs font-mono font-bold text-gray-500 dark:text-gray-400">
                  {{ item.durationLabel || item.fullDateRange || formatTime(item.event.time) }}
                </span>
              </div>

              <h4 class="font-extrabold text-sm text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-2 transition-colors">
                {{ item.event.name }}
              </h4>
            </div>

            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2.5 border-t border-gray-100 dark:border-gray-800">
              <span class="truncate max-w-[140px]">
                📍 {{ item.event.country || item.event.region || 'Global / Online' }}
              </span>
              <span class="font-bold text-primary-600 dark:text-primary-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                <span>{{ $t('modal.viewDetails') }}</span>
                <span>→</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const props = defineProps({
  events: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select-event']);

const calendarSubView = ref('grid');
const activeDate = ref(new Date());
const selectedDay = ref(null);
const selectedDayDrawerRef = ref(null);

const weekdayNames = computed(() => {
  return [
    { short: 'Sun', full: 'Sunday' },
    { short: 'Mon', full: 'Monday' },
    { short: 'Tue', full: 'Tuesday' },
    { short: 'Wed', full: 'Wednesday' },
    { short: 'Thu', full: 'Thursday' },
    { short: 'Fri', full: 'Friday' },
    { short: 'Sat', full: 'Saturday' }
  ];
});

// Month & Year Label (e.g., August 2026)
const monthYearLabel = computed(() => {
  const date = activeDate.value;
  return date.toLocaleDateString(locale.value || 'en', {
    month: 'long',
    year: 'numeric'
  });
});

function prevMonth() {
  const d = new Date(activeDate.value);
  d.setMonth(d.getMonth() - 1);
  activeDate.value = d;
}

function nextMonth() {
  const d = new Date(activeDate.value);
  d.setMonth(d.getMonth() + 1);
  activeDate.value = d;
}

function goToToday() {
  const today = new Date();
  activeDate.value = today;
  const todayStr = formatLocalDate(today);
  const found = calendarDays.value.find(d => d.dateString === todayStr);
  if (found) {
    selectDay(found, false);
  }
}

function selectDay(day, shouldScroll = false) {
  selectedDay.value = day;
  if (shouldScroll) {
    nextTick(() => {
      if (selectedDayDrawerRef.value) {
        selectedDayDrawerRef.value.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }
}

function onEventClick(item, day) {
  selectDay(day, true);
  emit('select-event', item.event);
}

function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateShort(date) {
  if (!date) return '';
  return date.toLocaleDateString(locale.value || 'en', { month: 'short', day: 'numeric' });
}

function formatFullSelectedDate(date) {
  if (!date) return '';
  return date.toLocaleDateString(locale.value || 'en', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  try {
    const d = new Date(timeStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
}

// Semantic Theme Classifier for Distinct Colors by Event Type
function getEventTheme(event) {
  if (event.type === 'deadline') {
    return {
      type: 'deadline',
      icon: '⏳',
      label: 'Deadline',
      dotClass: 'bg-rose-500',
      chipClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-800/60',
      badgeClass: 'bg-rose-200 text-rose-900 dark:bg-rose-900/80 dark:text-rose-200 border-rose-300 dark:border-rose-700'
    };
  }

  const name = (event.name || '').toLowerCase();
  const topics = (event.topics || '').toLowerCase();
  const types = (event.eventTypes || '').toLowerCase();
  const fullText = `${name} ${topics} ${types}`;

  // 1. Conferences & Summits (Indigo / Royal Blue)
  if (fullText.includes('conference') || fullText.includes('summit') || fullText.includes('wikimania') || fullText.includes('indaba') || fullText.includes('meeting') || fullText.includes('convention')) {
    return {
      type: 'conference',
      icon: '🤝',
      label: 'Conference',
      dotClass: 'bg-indigo-500',
      chipClass: 'bg-indigo-100 text-indigo-950 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-200 dark:border-indigo-800/60',
      badgeClass: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900/80 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700'
    };
  }

  // 2. Photo Contests & Competitions (Amber / Gold)
  if (fullText.includes('monuments') || fullText.includes('earth') || fullText.includes('africa creatives') || fullText.includes('heritage') || fullText.includes('contest') || fullText.includes('competition') || fullText.includes('village')) {
    return {
      type: 'contest',
      icon: '📷',
      label: 'Contest',
      dotClass: 'bg-amber-500',
      chipClass: 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800/60',
      badgeClass: 'bg-amber-200 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200 border-amber-300 dark:border-amber-700'
    };
  }

  // 3. Edit-a-thons, GLAM & Writing Drives (Purple / Violet)
  if (fullText.includes('editathon') || fullText.includes('edit-a-thon') || fullText.includes('drive') || fullText.includes('feminism') || fullText.includes('wikisource') || fullText.includes('wiktionary') || fullText.includes('write4her') || fullText.includes('library')) {
    return {
      type: 'editathon',
      icon: '📚',
      label: 'Edit-a-thon',
      dotClass: 'bg-purple-500',
      chipClass: 'bg-purple-100 text-purple-950 border-purple-300 dark:bg-purple-950/70 dark:text-purple-200 dark:border-purple-800/60',
      badgeClass: 'bg-purple-200 text-purple-900 dark:bg-purple-900/80 dark:text-purple-200 border-purple-300 dark:border-purple-700'
    };
  }

  // 4. Meetups & Workshops (Emerald / Green)
  if (fullText.includes('meetup') || fullText.includes('workshop') || fullText.includes('hangout') || fullText.includes('office hour') || fullText.includes('call') || fullText.includes('training')) {
    return {
      type: 'meetup',
      icon: '☕',
      label: 'Meetup',
      dotClass: 'bg-emerald-500',
      chipClass: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-800/60',
      badgeClass: 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
    };
  }

  // Default Event (Sky / Blue)
  return {
    type: 'event',
    icon: event.isMeta ? '🌐' : '📅',
    label: event.isMeta ? 'Meta-Wiki' : 'Event',
    dotClass: 'bg-sky-500',
    chipClass: 'bg-sky-100 text-sky-950 border-sky-300 dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-800/60',
    badgeClass: 'bg-sky-200 text-sky-900 dark:bg-sky-900/80 dark:text-sky-200 border-sky-300 dark:border-sky-700'
  };
}

// Helper: Format date range for badge (e.g., "Sep 4–6" or "Aug 20")
function formatDateRange(startDate, endDate) {
  if (!endDate) {
    return startDate.toLocaleDateString(locale.value || 'en', { month: 'short', day: 'numeric' });
  }

  const startMonth = startDate.toLocaleDateString(locale.value || 'en', { month: 'short' });
  const endMonth = endDate.toLocaleDateString(locale.value || 'en', { month: 'short' });
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();

  if (startMonth === endMonth) {
    if (startDay === endDay) return `${startMonth} ${startDay}`;
    return `${startMonth} ${startDay}–${endDay}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
}

// Logic to map events cleanly to calendar dates:
// 1. Single-day events & Deadlines: placed on exact start/cutoff date.
// 2. Multi-day Conferences (2 to 7 days, like WikiConference India Sep 4-6):
//    - Day 1: [ 🤝 WikiConference India • 3 Days (Sep 4–6) ]
//    - Day 2: [ 🤝 Day 2/3: WikiConference India • Day 2 of 3 ]
//    - Day 3: [ 🏁 Day 3/3: WikiConference India • Final Day ]
// 3. Multi-week/month campaigns (> 7 days): marked on their START date (🚀) and END date (🏁).
function getEventsForDate(dateStr, dateObj) {
  const targetTime = dateObj.getTime();
  const dayEvents = [];

  for (const event of props.events) {
    if (!event.time) continue;
    const startDate = new Date(event.time);
    const startDateStr = formatLocalDate(startDate);
    const theme = getEventTheme(event);

    // Deadlines: exact cutoff date only
    if (event.type === 'deadline') {
      if (startDateStr === dateStr) {
        dayEvents.push({
          event,
          theme,
          labelPrefix: '',
          rangeBadge: 'Cutoff',
          durationLabel: 'Deadline Cutoff',
          fullDateRange: formatDateRange(startDate)
        });
      }
      continue;
    }

    if (event.endTime) {
      const endDate = new Date(event.endTime);
      const endDateStr = formatLocalDate(endDate);
      const startDayTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
      const endDayTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
      const totalDays = Math.round((endDayTime - startDayTime) / (1000 * 60 * 60 * 24)) + 1;
      const fullRange = formatDateRange(startDate, endDate);

      if (totalDays <= 1) {
        // Single day
        if (startDateStr === dateStr) {
          dayEvents.push({
            event,
            theme,
            labelPrefix: '',
            rangeBadge: '',
            durationLabel: '1 Day Event',
            fullDateRange: fullRange
          });
        }
      } else if (totalDays <= 7) {
        // Multi-day conference / workshop (2 to 7 days) -> Active progression across all days!
        if (targetTime >= startDayTime && targetTime <= endDayTime) {
          const currentDayNum = Math.round((targetTime - startDayTime) / (1000 * 60 * 60 * 24)) + 1;
          const isFirst = currentDayNum === 1;
          const isLast = currentDayNum === totalDays;

          let labelPrefix = '';
          let rangeBadge = '';

          if (isFirst) {
            labelPrefix = '';
            rangeBadge = `${totalDays} Days`;
          } else if (isLast) {
            labelPrefix = `🏁 Day ${currentDayNum}/${totalDays}: `;
            rangeBadge = 'Final Day';
          } else {
            labelPrefix = `Day ${currentDayNum}/${totalDays}: `;
            rangeBadge = `Day ${currentDayNum} of ${totalDays}`;
          }

          dayEvents.push({
            event,
            theme,
            labelPrefix,
            rangeBadge,
            durationLabel: `${totalDays} Days (${fullRange})`,
            fullDateRange: fullRange
          });
        }
      } else {
        // Long-running multi-week campaign (> 7 days): only on Start and End dates
        if (startDateStr === dateStr) {
          dayEvents.push({
            event,
            theme,
            labelPrefix: '🚀 Starts: ',
            rangeBadge: `${totalDays} Days`,
            durationLabel: `Starts • ${totalDays} Days Drive (${fullRange})`,
            fullDateRange: fullRange
          });
        } else if (endDateStr === dateStr) {
          dayEvents.push({
            event,
            theme,
            labelPrefix: '🏁 Concludes: ',
            rangeBadge: 'Campaign End',
            durationLabel: `Concludes (${fullRange})`,
            fullDateRange: fullRange
          });
        }
      }
    } else {
      // Single-day event without end time
      if (startDateStr === dateStr) {
        dayEvents.push({
          event,
          theme,
          labelPrefix: '',
          rangeBadge: '',
          durationLabel: '1 Day Event',
          fullDateRange: formatDateRange(startDate)
        });
      }
    }
  }

  return dayEvents;
}

// Generate standard 7x5 or 7x6 month days grid
const calendarDays = computed(() => {
  const year = activeDate.value.getFullYear();
  const month = activeDate.value.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startWeekday = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  const todayStr = formatLocalDate(new Date());
  const days = [];

  // 1. Leading days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startWeekday - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const dateObj = new Date(year, month - 1, dayNum);
    const dateStr = formatLocalDate(dateObj);
    days.push({
      dayNumber: dayNum,
      date: dateObj,
      dateString: dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      events: getEventsForDate(dateStr, dateObj)
    });
  }

  // 2. Current Month Days
  for (let i = 1; i <= totalDays; i++) {
    const dateObj = new Date(year, month, i);
    const dateStr = formatLocalDate(dateObj);
    days.push({
      dayNumber: i,
      date: dateObj,
      dateString: dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      events: getEventsForDate(dateStr, dateObj)
    });
  }

  // 3. Trailing days from next month
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const dateObj = new Date(year, month + 1, i);
    const dateStr = formatLocalDate(dateObj);
    days.push({
      dayNumber: i,
      date: dateObj,
      dateString: dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      events: getEventsForDate(dateStr, dateObj)
    });
  }

  return days;
});

// Find next upcoming active event day for empty state quick jump
const nextActiveEventDay = computed(() => {
  if (!selectedDay.value) return null;
  return calendarDays.value.find(
    d => d.isCurrentMonth && d.date.getTime() > selectedDay.value.date.getTime() && d.events.length > 0
  ) || null;
});

// Deduplicate unique events in selected day drawer
const uniqueSelectedEvents = computed(() => {
  if (!selectedDay.value || !selectedDay.value.events) return [];
  const seen = new Set();
  const list = [];
  for (const item of selectedDay.value.events) {
    const key = item.event.id || item.event.name;
    if (!seen.has(key)) {
      seen.add(key);
      list.push(item);
    }
  }
  return list;
});

// Grouped days for Agenda / Timeline view
const agendaDayGroups = computed(() => {
  const currentMonthDays = calendarDays.value.filter(d => d.isCurrentMonth && d.events.length > 0);
  return currentMonthDays.map(day => {
    const seen = new Set();
    const uniqueEvents = [];
    for (const item of day.events) {
      const key = item.event.id || item.event.name;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueEvents.push(item);
      }
    }
    return {
      dateString: day.dateString,
      dateFormatted: day.date.toLocaleDateString(locale.value || 'en', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      events: uniqueEvents
    };
  });
});

// Auto-select today or first day with events on initial mount
watch(
  calendarDays,
  (newDays) => {
    if (!selectedDay.value) {
      const todayStr = formatLocalDate(new Date());
      const foundToday = newDays.find(d => d.dateString === todayStr);
      if (foundToday && foundToday.events.length > 0) {
        selectedDay.value = foundToday;
      } else {
        const firstWithEvents = newDays.find(d => d.isCurrentMonth && d.events.length > 0);
        if (firstWithEvents) selectedDay.value = firstWithEvents;
      }
    } else {
      const updated = newDays.find(d => d.dateString === selectedDay.value.dateString);
      if (updated) selectedDay.value = updated;
    }
  },
  { immediate: true }
);
</script>
