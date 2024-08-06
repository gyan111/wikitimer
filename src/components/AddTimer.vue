<template>
  <div class="container mx-auto text-center p-6">
    <h1 class="text-3xl font-bold mb-4">Add New Timer</h1>
    <div v-if="successMessage" class="mb-4 bg-green-100 text-green-700 p-4 rounded-md shadow-sm">
      {{ successMessage }}
      <button @click="goToTimers" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600">See all timers</button>
    </div>
    <form @submit.prevent="addTimer" class="w-full max-w-lg mx-auto">
      <div class="mb-4">
        <select v-model="newTimer.type" class="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm">
          <option value="" disabled>Select Type</option>
          <option value="event">Event</option>
          <option value="deadline">Deadline</option>
        </select>
      </div>
      <div class="mb-4">
        <input v-model="newTimer.name" type="text" placeholder="Name" class="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm">
      </div>
      <div class="mb-4">
        <input v-model="newTimer.link" type="text" placeholder="Link" class="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm">
      </div>
      <div class="mb-4">
        <input v-model="newTimer.time" type="datetime-local" placeholder="Time" class="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm">
      </div>
      <div class="mb-4">
        <select v-model="newTimer.region" class="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm">
          <option value="" disabled>Select Region</option>
          <option value="ESEAP: East and Southeast Asia, and the Pacific region">ESEAP: East and Southeast Asia, and the Pacific region</option>
          <option value="SAARC: South Asia">SAARC: South Asia</option>
          <option value="MENA: Middle East and North Africa">MENA: Middle East and North Africa</option>
          <option value="Indaba: Africa">Indaba: Africa</option>
          <option value="CEE and CA: Central and Eastern Europe and Central Asia">CEE and CA: Central and Eastern Europe and Central Asia</option>
          <option value="Northern and Western Europe">Northern and Western Europe</option>
          <option value="Latin America and the Caribbean">Latin America and the Caribbean</option>
          <option value="North America">North America</option>
        </select>
      </div>
      <div class="mb-4 relative">
        <input 
          v-model="newTimer.country" 
          @input="filterCountries" 
          type="text" 
          placeholder="Country" 
          class="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm"
        >
        <ul v-if="filteredCountries.length" class="absolute bg-white border border-gray-300 rounded-md shadow-sm mt-1 max-h-48 overflow-y-auto w-full z-10">
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
      <div class="mb-4">
        <select v-model="newTimer.timeZone" class="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm">
          <option value="" disabled>Select Time Zone</option>
          <option value="UTC-12:00">UTC-12:00</option>
          <option value="UTC-11:00">UTC-11:00</option>
          <option value="UTC-10:00">UTC-10:00</option>
          <option value="UTC-09:30">UTC-09:30</option>
          <option value="UTC-09:00">UTC-09:00</option>
          <option value="UTC-08:00">UTC-08:00</option>
          <option value="UTC-07:00">UTC-07:00</option>
          <option value="UTC-06:00">UTC-06:00</option>
          <option value="UTC-05:00">UTC-05:00</option>
          <option value="UTC-04:00">UTC-04:00</option>
          <option value="UTC-03:30">UTC-03:30</option>
          <option value="UTC-03:00">UTC-03:00</option>
          <option value="UTC-02:00">UTC-02:00</option>
          <option value="UTC-01:00">UTC-01:00</option>
          <option value="UTC+00:00">UTC+00:00</option>
          <option value="UTC+01:00">UTC+01:00</option>
          <option value="UTC+02:00">UTC+02:00</option>
          <option value="UTC+03:00">UTC+03:00</option>
          <option value="UTC+03:30">UTC+03:30</option>
          <option value="UTC+04:00">UTC+04:00</option>
          <option value="UTC+04:30">UTC+04:30</option>
          <option value="UTC+05:00">UTC+05:00</option>
          <option value="UTC+05:30">UTC+05:30</option>
          <option value="UTC+05:45">UTC+05:45</option>
          <option value="UTC+06:00">UTC+06:00</option>
          <option value="UTC+06:30">UTC+06:30</option>
          <option value="UTC+07:00">UTC+07:00</option>
          <option value="UTC+08:00">UTC+08:00</option>
          <option value="UTC+08:45">UTC+08:45</option>
          <option value="UTC+09:00">UTC+09:00</option>
          <option value="UTC+09:30">UTC+09:30</option>
          <option value="UTC+10:00">UTC+10:00</option>
          <option value="UTC+10:30">UTC+10:30</option>
          <option value="UTC+11:00">UTC+11:00</option>
          <option value="UTC+12:00">UTC+12:00</option>
          <option value="UTC+12:45">UTC+12:45</option>
          <option value="UTC+13:00">UTC+13:00</option>
          <option value="UTC+14:00">UTC+14:00</option>
        </select>
      </div>
      <div class="mb-4">
        <input v-model="newTimer.logo" @input="validateLogo" type="text" placeholder="Logo Link (Optional)" class="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm">
        <div v-if="logoError" class="text-red-500 text-sm mt-2">The logo link is not valid.</div>
        <div v-if="newTimer.logo && !logoError" class="mt-4">
          <img :src="newTimer.logo" alt="Logo Preview" class="w-32 h-auto mx-auto">
        </div>
      </div>
      <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600">Add Timer</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newTimer: {
        type: '',
        name: '',
        link: '',
        time: '',
        region: '',
        country: '',
        timeZone: '',
        logo: ''
      },
      successMessage: '',
      logoError: false,
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
      ],
      filteredCountries: []
    };
  },
  methods: {
    async addTimer() {
      try {
        const response = await fetch('/add-timer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.newTimer)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        this.successMessage = data.message;
      } catch (error) {
        console.error('Error adding timer:', error);
      }
    },
    validateLogo() {
      const img = new Image();
      img.onload = () => {
        this.logoError = false;
      };
      img.onerror = () => {
        this.logoError = true;
      };
      img.src = this.newTimer.logo;
    },
    filterCountries() {
      const searchTerm = this.newTimer.country.toLowerCase();
      if (searchTerm) {
        this.filteredCountries = this.countries.filter(country => country.toLowerCase().includes(searchTerm));
      } else {
        this.filteredCountries = [];
      }
    },
    selectCountry(country) {
      this.newTimer.country = country;
      this.filteredCountries = [];
    },
    goToTimers() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
</style>
