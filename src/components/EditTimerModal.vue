<template>
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" @click="closeModal"></div>

      <!-- Modal Dialog -->
      <div class="relative max-w-2xl w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-10 my-8">
        <!-- Header -->
        <div class="relative bg-gradient-to-r from-primary-600 to-indigo-600 p-6 sm:p-8 text-white">
          <button
            @click="closeModal"
            class="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            :title="$t('modal.close')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            <div>
              <h3 class="text-2xl font-bold tracking-tight">{{ $t('form.editTitle') }}</h3>
              <p class="text-white/80 text-xs sm:text-sm">{{ $t('form.editSubtitle') }}</p>
            </div>
          </div>
        </div>

        <!-- Form Body -->
        <div class="p-6 sm:p-8 max-h-[75vh] overflow-y-auto space-y-5">
          
          <!-- Success Message -->
          <div v-if="successMessage" class="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-2xl flex items-center gap-3">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            <p class="text-sm font-medium">{{ successMessage }}</p>
          </div>

          <form @submit.prevent="saveTimer" class="space-y-5">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Type -->
              <div>
                <label for="edit-type" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                  {{ $t('form.type') }} <span class="text-red-500">*</span>
                </label>
                <select
                  id="edit-type"
                  v-model="form.type"
                  required
                  class="w-full py-2.5 px-3.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="event">{{ $t('form.typeEventDesc') }}</option>
                  <option value="deadline">{{ $t('form.typeDeadlineDesc') }}</option>
                </select>
              </div>

              <!-- Name -->
              <div>
                <label for="edit-name" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                  {{ $t('form.name') }} <span class="text-red-500">*</span>
                </label>
                <input
                  id="edit-name"
                  v-model="form.name"
                  type="text"
                  required
                  :placeholder="$t('form.namePlaceholder')"
                  class="w-full py-2.5 px-3.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
              </div>
            </div>

            <!-- Link -->
            <div>
              <label for="edit-link" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                {{ $t('form.link') }} <span class="text-red-500">*</span>
              </label>
              <input
                id="edit-link"
                v-model="form.link"
                type="url"
                required
                :placeholder="$t('form.linkPlaceholder')"
                class="w-full py-2.5 px-3.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
            </div>

            <!-- Datetimes -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="edit-time" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                  {{ $t('form.startDateTime') }} <span class="text-red-500">*</span>
                </label>
                <input
                  id="edit-time"
                  v-model="form.time"
                  type="datetime-local"
                  required
                  class="w-full py-2.5 px-3.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
              </div>

              <div>
                <label for="edit-endTime" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                  {{ $t('form.endDateTime') }} <span class="text-xs font-normal text-gray-400">({{ $t('form.optional') }})</span>
                </label>
                <input
                  id="edit-endTime"
                  v-model="form.endTime"
                  type="datetime-local"
                  class="w-full py-2.5 px-3.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
              </div>
            </div>

            <!-- Timezone & Organizers -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="edit-timeZone" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                  {{ $t('form.timeZone') }} <span class="text-red-500">*</span>
                </label>
                <select
                  id="edit-timeZone"
                  v-model="form.timeZone"
                  required
                  class="w-full py-2.5 px-3.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
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
              </div>

              <div>
                <label for="edit-organizers" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                  {{ $t('form.organizers') }} <span class="text-xs font-normal text-gray-400">({{ $t('form.optional') }})</span>
                </label>
                <input
                  id="edit-organizers"
                  v-model="form.organizers"
                  type="text"
                  :placeholder="$t('form.organizersPlaceholder')"
                  class="w-full py-2.5 px-3.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
              </div>
            </div>

            <!-- Participation, Region & Participants -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label for="edit-participation" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                  {{ $t('form.format') }}
                </label>
                <select
                  id="edit-participation"
                  v-model="form.participation"
                  class="w-full py-2.5 px-3.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="Hybrid">{{ $t('form.formatHybrid') }}</option>
                  <option value="In-person">{{ $t('form.formatInPerson') }}</option>
                  <option value="Online">{{ $t('form.formatOnline') }}</option>
                </select>
              </div>

              <div>
                <label for="edit-region" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                  {{ $t('form.regionScope') }} <span class="text-red-500">*</span>
                </label>
                <select
                  id="edit-region"
                  v-model="form.region"
                  required
                  class="w-full py-2.5 px-3.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="Global">{{ $t('form.regionGlobal') }}</option>
                  <option value="Africa">Africa</option>
                  <option value="Asia">Asia</option>
                  <option value="Europe">Europe</option>
                  <option value="Latin America">Latin America & Caribbean</option>
                  <option value="North America">North America</option>
                  <option value="Oceania">Oceania / Pacific</option>
                  <option value="MENA">Middle East & North Africa</option>
                  <option value="CEE & CA">Central & Eastern Europe & Central Asia</option>
                </select>
              </div>

              <div>
                <label for="edit-participants" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                  {{ $t('form.participants') }}
                </label>
                <input
                  id="edit-participants"
                  v-model.number="form.participants"
                  type="number"
                  min="0"
                  :placeholder="$t('form.participantsPlaceholder')"
                  class="w-full py-2.5 px-3.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
              </div>
            </div>

            <!-- Location -->
            <div class="relative z-20">
              <label for="edit-country" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                {{ $t('form.hostLocation') }} <span class="text-red-500">*</span>
              </label>
              <input
                id="edit-country"
                v-model="form.country"
                @input="filterLocations"
                type="text"
                required
                :placeholder="$t('form.locationPlaceholder')"
                class="w-full py-2.5 px-3.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
              <transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-2"
              >
                <ul v-if="filteredLocations.length" class="absolute bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl mt-1.5 max-h-48 overflow-y-auto w-full z-50 py-1 divide-y divide-gray-100 dark:divide-gray-700">
                  <li
                    v-for="c in filteredLocations"
                    :key="c"
                    @click="selectLocation(c)"
                    class="py-2.5 px-3.5 hover:bg-primary-50 dark:hover:bg-gray-700 cursor-pointer transition-colors text-xs font-medium text-gray-900 dark:text-gray-100"
                  >
                    {{ c }}
                  </li>
                </ul>
              </transition>
            </div>

            <!-- Category Tags -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
                {{ $t('form.categoryTags') }}
              </label>
              <div class="flex flex-wrap gap-1.5 mb-2.5">
                <button
                  v-for="tag in availableTags"
                  :key="tag.name"
                  type="button"
                  @click="toggleTag(tag.name)"
                  :class="selectedTags.includes(tag.name) ? 'bg-primary-600 text-white shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                  class="px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{{ tag.icon }}</span>
                  <span>{{ tag.name }}</span>
                  <span v-if="selectedTags.includes(tag.name)">✓</span>
                </button>
              </div>
            </div>

            <!-- Logo -->
            <div>
              <label for="edit-logo" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                {{ $t('form.logo') }} <span class="text-xs font-normal text-gray-400">({{ $t('form.optional') }})</span>
              </label>
              <input
                id="edit-logo"
                v-model="form.logo"
                type="url"
                placeholder="https://upload.wikimedia.org/wikipedia/commons/..."
                class="w-full py-2.5 px-3.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
            </div>

            <p v-if="errorMessage" class="text-xs text-red-500 font-medium p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              {{ errorMessage }}
            </p>

            <div class="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                @click="closeModal"
                class="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                {{ $t('modal.close') }}
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <svg v-if="isSubmitting" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                <span>{{ isSubmitting ? $t('form.updating') : $t('form.saveChanges') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { resolveCommonsImageUrl } from '../utils/wiki';

const props = defineProps({
  event: {
    type: Object,
    default: null
  },
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'timer-updated']);

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
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Dynamic Global Location Autocomplete State
const locationSuggestions = ref([]);
const isSearchingLocations = ref(false);
let locationSearchTimeout = null;

function handleLocationInput() {
  clearTimeout(locationSearchTimeout);
  const query = (form.value.country || '').trim();

  if (query.length < 2) {
    locationSuggestions.value = [];
    return;
  }

  isSearchingLocations.value = true;
  locationSearchTimeout = setTimeout(async () => {
    try {
      // Privacy-compliant dynamic location search using official Wikimedia/Wikidata API
      const endpoint = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&origin=*&limit=7&type=item`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Wikidata search failed');
      const data = await res.json();

      const results = [];
      for (const item of (data.search || [])) {
        results.push({
          label: item.label,
          subtitle: item.description || ''
        });
      }

      if ('online / virtual'.includes(query.toLowerCase())) {
        results.unshift({ label: 'Online / Virtual', subtitle: 'Global' });
      }

      locationSuggestions.value = results;
    } catch (err) {
      console.warn('Error searching locations on Wikidata:', err);
      locationSuggestions.value = [];
    } finally {
      isSearchingLocations.value = false;
    }
  }, 250);
}

function selectLocation(loc) {
  form.value.country = typeof loc === 'string' ? loc : loc.label;
  locationSuggestions.value = [];
}

const form = ref({
  type: 'event',
  name: '',
  link: '',
  time: '',
  endTime: '',
  timeZone: 'UTC+00:00',
  region: 'Global',
  country: '',
  participation: 'Hybrid',
  participants: null,
  organizers: '',
  logo: ''
});

function utcToDatetimeLocal(dateVal, timeZoneStr) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';

  let offsetMinutes = 0;
  if (timeZoneStr && typeof timeZoneStr === 'string') {
    const match = timeZoneStr.match(/([+-])(\d{2}):?(\d{2})?/);
    if (match) {
      const sign = match[1] === '-' ? -1 : 1;
      const hours = parseInt(match[2], 10);
      const mins = parseInt(match[3] || '0', 10);
      offsetMinutes = sign * (hours * 60 + mins);
    }
  }

  const targetTimeMs = d.getTime() + offsetMinutes * 60000;
  const targetDate = new Date(targetTimeMs);
  const year = targetDate.getUTCFullYear();
  const month = String(targetDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getUTCDate()).padStart(2, '0');
  const hours = String(targetDate.getUTCHours()).padStart(2, '0');
  const minutes = String(targetDate.getUTCMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

watch(
  () => props.event,
  (ev) => {
    if (!ev) return;
    errorMessage.value = '';
    successMessage.value = '';

    const tz = ev.timeZone || 'UTC+00:00';
    form.value = {
      type: ev.type || 'event',
      name: ev.name || '',
      link: ev.link || '',
      time: utcToDatetimeLocal(ev.time, tz),
      endTime: ev.endTime ? utcToDatetimeLocal(ev.endTime, tz) : '',
      timeZone: tz,
      region: ev.region || 'Global',
      country: ev.country || '',
      participation: ev.participation || 'Hybrid',
      participants: ev.participants != null ? ev.participants : null,
      organizers: ev.organizers || '',
      logo: ev.logo || ''
    };

    if (ev.topics) {
      selectedTags.value = ev.topics.split(',').map((t) => t.trim()).filter(Boolean);
    } else {
      selectedTags.value = [];
    }
  },
  { immediate: true }
);

function toggleTag(tagName) {
  const idx = selectedTags.value.indexOf(tagName);
  if (idx > -1) {
    selectedTags.value.splice(idx, 1);
  } else {
    selectedTags.value.push(tagName);
  }
}

function closeModal() {
  emit('close');
}

async function saveTimer() {
  if (!props.event || !props.event.id) return;
  errorMessage.value = '';
  successMessage.value = '';
  isSubmitting.value = true;

  try {
    if (form.value.logo) {
      const resolvedLogo = await resolveCommonsImageUrl(form.value.logo);
      if (resolvedLogo) form.value.logo = resolvedLogo;
    }

    const payload = {
      ...form.value,
      topics: selectedTags.value.join(', ')
    };

    const res = await fetch(`/timers/${props.event.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `Server error (${res.status})`);
    }

    const data = await res.json();
    successMessage.value = data.message || 'Timer updated successfully!';
    emit('timer-updated', data.timer);
    setTimeout(() => {
      closeModal();
    }, 800);
  } catch (err) {
    console.error('Error updating timer:', err);
    errorMessage.value = err.message || 'Failed to update timer.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>
