<template>
  <div>
    <select v-model="selectedRegion" @change="updateRegion" class="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white text-black dark:bg-gray-800 dark:text-gray-100 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200">
  <option value="">Select Region</option>
      <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
    </select>
  </div>
</template>

<script>
export default {
  props: ['value'],
  data() {
    return {
      selectedRegion: this.value,
      regions: [
        "ESEAP: East and Southeast Asia, and the Pacific region",
        "SAARC: South Asia",
        "MENA: Middle East and North Africa",
        "Indaba: Africa",
        "CEE and CA: Central and Eastern Europe and Central Asia",
        "Northern and Western Europe",
        "Latin America and the Caribbean",
        "North America"
      ]
    };
  },
  watch: {
    value(newVal) {
      this.selectedRegion = newVal;
    }
  },
  methods: {
    updateRegion() {
      this.$emit('update:region', this.selectedRegion);
    }
  }
};
</script>

<style scoped>

</style>
