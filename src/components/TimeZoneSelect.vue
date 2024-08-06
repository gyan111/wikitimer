<template>
  <div>
    <select v-model="selectedTimeZone" @change="updateTimeZone" class="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm">
      <option value="">Select Time Zone</option>
      <option v-for="zone in timeZones" :key="zone" :value="zone">{{ zone }}</option>
    </select>
  </div>
</template>

<script>
export default {
  props: ['value'],
  data() {
    return {
      selectedTimeZone: this.value,
      timeZones: [
        "UTC-12:00", "UTC-11:00", "UTC-10:00", "UTC-09:30", "UTC-09:00", "UTC-08:00", "UTC-07:00", "UTC-06:00", "UTC-05:00", "UTC-04:00", 
        "UTC-03:30", "UTC-03:00", "UTC-02:00", "UTC-01:00", "UTC+00:00", "UTC+01:00", "UTC+02:00", "UTC+03:00", "UTC+03:30", "UTC+04:00", 
        "UTC+04:30", "UTC+05:00", "UTC+05:30", "UTC+05:45", "UTC+06:00", "UTC+06:30", "UTC+07:00", "UTC+08:00", "UTC+08:45", "UTC+09:00", 
        "UTC+09:30", "UTC+10:00", "UTC+10:30", "UTC+11:00", "UTC+12:00", "UTC+12:45", "UTC+13:00", "UTC+14:00"
      ]
    };
  },
  watch: {
    value(newVal) {
      this.selectedTimeZone = newVal;
    }
  },
  methods: {
    updateTimeZone() {
      this.$emit('update:timeZone', this.selectedTimeZone);
    }
  }
};
</script>

<style scoped>
</style>
