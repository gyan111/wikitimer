<template>
  <div class="relative">
    <input 
      v-model="searchTerm" 
      @input="filterCountries" 
      type="text" 
      placeholder="Country" 
      class="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white text-black dark:bg-gray-800 dark:text-gray-100 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"
    >
    <ul v-if="filteredCountries.length" class="absolute bg-white text-black dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm mt-1 max-h-48 overflow-y-auto w-full z-10">
      <li 
        v-for="country in filteredCountries" 
        :key="country" 
        @click="selectCountry(country)" 
        class="py-2 px-3 hover:bg-gray-100 cursor-pointer"
      >
        {{ country }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ['value'],
  data() {
    return {
      searchTerm: this.value,
      filteredCountries: [],
      countries: [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", 
        "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", 
        "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", 
        "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the", 
        "Congo, Republic of the", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", 
        "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", 
        "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", 
        "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", 
        "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", 
        "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", 
        "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", 
        "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", 
        "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", 
        "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", 
        "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", 
        "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", 
        "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", 
        "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", 
        "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", 
        "Vietnam", "Yemen", "Zambia", "Zimbabwe"
      ]
    };
  },
  watch: {
    value(newVal) {
      this.searchTerm = newVal;
    }
  },
  methods: {
    filterCountries() {
      const searchTerm = this.searchTerm.toLowerCase();
      if (searchTerm) {
        this.filteredCountries = this.countries.filter(country => country.toLowerCase().includes(searchTerm));
      } else {
        this.filteredCountries = [];
      }
    },
    selectCountry(country) {
      this.$emit('update:country', country);
      this.searchTerm = country; // Update the search term with the selected country
      this.filteredCountries = [];
    }
  }
};
</script>

<style scoped>
</style>
