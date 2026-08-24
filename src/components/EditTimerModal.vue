<template>
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 z-[100] overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <!-- Backdrop click -->
      <div class="fixed inset-0" @click="closeModal"></div>

      <!-- Modal Dialog -->
      <div class="relative max-w-2xl w-full max-h-[90vh] flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-10 my-auto">
        <!-- Header (Sticky top) -->
        <div class="shrink-0 relative bg-gradient-to-r from-primary-600 to-indigo-600 p-5 sm:p-6 text-white">
          <button
            @click="closeModal"
            class="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            :title="$t('modal.close')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div class="flex items-center gap-3 pr-10">
            <div class="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shrink-0">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            <div>
              <h3 class="text-xl sm:text-2xl font-bold tracking-tight">{{ $t('form.editTitle') }}</h3>
              <p class="text-white/80 text-xs sm:text-sm">{{ $t('form.editSubtitle') }}</p>
            </div>
          </div>
        </div>

        <!-- Form Body (Scrollable flex-1) -->
        <div class="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
          <!-- Success Message -->
          <div v-if="successMessage" class="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-2xl flex items-center gap-3">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            <p class="text-sm font-medium">{{ successMessage }}</p>
          </div>

          <form id="edit-timer-form" @submit.prevent="saveTimer" class="space-y-5">
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

              <!-- Organizers / Affiliates / User Groups -->
              <div>
                <div class="flex items-center justify-between mb-1 ml-1">
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {{ $t('form.organizers') }} <span class="text-xs font-normal text-gray-400">({{ $t('form.optional') }})</span>
                  </label>
                  <span v-if="isSearchingOrganizers" class="text-[10px] text-primary-500 animate-pulse flex items-center gap-1 font-medium">
                    <svg class="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    Searching...
                  </span>
                </div>

                <!-- Type Selector (User / Affiliate / Custom) -->
                <div class="flex items-center gap-1 mb-2 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
                  <button
                    type="button"
                    @click="activeOrganizerType = 'user'"
                    class="px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer"
                    :class="activeOrganizerType === 'user' ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-300 shadow-2xs' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'"
                  >
                    <span>👤</span>
                    <span>{{ $t('form.organizerTypeUser') }}</span>
                  </button>
                  <button
                    type="button"
                    @click="activeOrganizerType = 'affiliate'"
                    class="px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer"
                    :class="activeOrganizerType === 'affiliate' ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-300 shadow-2xs' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'"
                  >
                    <span>🏛️</span>
                    <span>{{ $t('form.organizerTypeAffiliate') }}</span>
                  </button>
                  <button
                    type="button"
                    @click="activeOrganizerType = 'custom'"
                    class="px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer"
                    :class="activeOrganizerType === 'custom' ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-300 shadow-2xs' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'"
                  >
                    <span>🌐</span>
                    <span>{{ $t('form.organizerTypeCustom') }}</span>
                  </button>
                </div>

                <!-- Chips List -->
                <div v-if="organizerList.length > 0" class="flex flex-wrap gap-1.5 mb-2">
                  <span
                    v-for="(org, idx) in organizerList"
                    :key="idx"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                  >
                    <span>{{ org.type === 'user' ? '👤' : (org.type === 'affiliate' ? '🏛️' : '🌐') }}</span>
                    <span>{{ org.name }}</span>
                    <button
                      type="button"
                      @click="removeOrganizer(idx)"
                      class="ml-0.5 text-gray-400 hover:text-red-500 rounded-full focus:outline-none cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                </div>

                <!-- Input & Add button with suggestions -->
                <div class="relative flex gap-2">
                  <div class="relative flex-1">
                    <input
                      id="edit-organizer-input"
                      v-model="organizerInput"
                      @input="handleOrganizersInput"
                      @keydown.enter.prevent="addOrganizerFromInput"
                      type="text"
                      :placeholder="activeOrganizerType === 'user' ? $t('form.organizerPlaceholderUser') : (activeOrganizerType === 'affiliate' ? $t('form.organizerPlaceholderAffiliate') : $t('form.organizerPlaceholderCustom'))"
                      class="w-full py-2 px-3 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                    <transition
                      enter-active-class="transition duration-200 ease-out"
                      enter-from-class="opacity-0 translate-y-2"
                      enter-to-class="opacity-100 translate-y-0"
                      leave-active-class="transition duration-150 ease-in"
                      leave-from-class="opacity-100 translate-y-0"
                      leave-to-class="opacity-0 translate-y-2"
                    >
                      <ul v-if="organizerSuggestions.length" class="absolute bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl mt-1.5 max-h-48 overflow-y-auto w-full z-50 py-1 divide-y divide-gray-100 dark:divide-gray-700">
                        <li
                          v-for="(item, idx) in organizerSuggestions"
                          :key="idx"
                          @click="selectOrganizer(item)"
                          class="py-2 px-3 hover:bg-primary-50 dark:hover:bg-gray-700/70 cursor-pointer transition-colors text-xs flex items-center justify-between gap-2"
                        >
                          <div class="flex items-center gap-1.5 truncate">
                            <span>{{ item.startsWith('User:') ? '👤' : '🏛️' }}</span>
                            <span class="font-medium text-gray-900 dark:text-gray-100 truncate">{{ item }}</span>
                          </div>
                          <span class="text-[10px] text-primary-500 font-semibold shrink-0">Meta-Wiki</span>
                        </li>
                      </ul>
                    </transition>
                  </div>
                  <button
                    type="button"
                    @click="addOrganizerFromInput"
                    class="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs transition-all shrink-0 shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>+</span>
                    <span>{{ $t('form.addOrganizer') }}</span>
                  </button>
                </div>
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
                @input="handleLocationInput"
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
                <ul v-if="locationSuggestions.length" class="absolute bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl mt-1.5 max-h-48 overflow-y-auto w-full z-50 py-1 divide-y divide-gray-100 dark:divide-gray-700">
                  <li
                    v-for="(loc, idx) in locationSuggestions"
                    :key="idx"
                    @click="selectLocation(loc)"
                    class="py-2.5 px-3.5 hover:bg-primary-50 dark:hover:bg-gray-700 cursor-pointer transition-colors text-xs font-medium text-gray-900 dark:text-gray-100 flex items-center justify-between gap-2"
                  >
                    <div class="flex items-center gap-2 truncate">
                      <span>📍</span>
                      <span class="truncate">{{ loc.label }}</span>
                    </div>
                    <span v-if="loc.subtitle" class="text-[10px] text-gray-400 shrink-0">{{ loc.subtitle }}</span>
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
          </form>
        </div>

        <!-- Footer (Sticky bottom) -->
        <div class="shrink-0 p-4 sm:px-7 border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 flex items-center justify-end gap-3 z-10">
          <button
            type="button"
            @click="closeModal"
            class="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
          >
            {{ $t('modal.close') }}
          </button>
          <button
            type="submit"
            form="edit-timer-form"
            :disabled="isSubmitting"
            class="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <svg v-if="isSubmitting" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            <span>{{ isSubmitting ? $t('form.updating') : $t('form.saveChanges') }}</span>
          </button>
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

// Structured Organizers State
const organizerList = ref([]);
const activeOrganizerType = ref('user');
const organizerInput = ref('');
const organizerSuggestions = ref([]);
const isSearchingOrganizers = ref(false);
let organizersTimeout = null;

function handleOrganizersInput() {
  clearTimeout(organizersTimeout);
  const query = organizerInput.value.trim();

  if (query.length < 2) {
    organizerSuggestions.value = [];
    return;
  }

  isSearchingOrganizers.value = true;
  organizersTimeout = setTimeout(async () => {
    try {
      let searchQuery = query;
      if (activeOrganizerType.value === 'user' && !query.startsWith('User:')) {
        searchQuery = `User:${query}`;
      }
      const url = `https://meta.wikimedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(searchQuery)}&limit=6&format=json&origin=*`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      const list = data[1] || [];
      organizerSuggestions.value = list.filter(item => !/\/[a-z]{2,3}$/i.test(item) && !item.includes('/draft'));
    } catch (err) {
      console.warn('Error searching organizers on Meta-Wiki:', err);
      organizerSuggestions.value = [];
    } finally {
      isSearchingOrganizers.value = false;
    }
  }, 250);
}

function selectOrganizer(item) {
  const type = item.startsWith('User:') ? 'user' : 'affiliate';
  if (!organizerList.value.some(o => o.name === item)) {
    organizerList.value.push({ type, name: item });
  }
  organizerInput.value = '';
  organizerSuggestions.value = [];
}

function addOrganizerFromInput() {
  const val = organizerInput.value.trim();
  if (!val) return;
  let formattedName = val;
  if (activeOrganizerType.value === 'user' && !val.startsWith('User:')) {
    formattedName = `User:${val}`;
  }
  if (!organizerList.value.some(o => o.name.toLowerCase() === formattedName.toLowerCase())) {
    organizerList.value.push({ type: activeOrganizerType.value, name: formattedName });
  }
  organizerInput.value = '';
  organizerSuggestions.value = [];
}

function removeOrganizer(idx) {
  organizerList.value.splice(idx, 1);
}

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

    // Parse organizers string into chips
    organizerList.value = [];
    organizerInput.value = '';
    if (ev.organizers) {
      const parts = ev.organizers.split(',').map(s => s.trim()).filter(Boolean);
      organizerList.value = parts.map(name => {
        let type = 'custom';
        if (name.startsWith('User:')) {
          type = 'user';
        } else if (/wikimedia|chapter|user group|affiliate|foundation|ug/i.test(name)) {
          type = 'affiliate';
        }
        return { type, name };
      });
    }

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

    // Combine organizer chips + raw input if any
    const orgNames = organizerList.value.map(o => o.name);
    if (organizerInput.value.trim()) {
      orgNames.push(organizerInput.value.trim());
    }
    form.value.organizers = orgNames.join(', ');

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
