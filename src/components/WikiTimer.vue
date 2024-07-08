<template>
  <div class="container mx-auto text-center p-6">
    <h1 class="text-3xl font-bold mb-4">Wiki Timer</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="(event, index) in events"
        :key="index"
        :class="['p-6 rounded-lg shadow-md', randomColorClass(index)]"
      >
        <h2 class="text-xl font-semibold">{{ event.name }}</h2>
        <a :href="event.link" class="text-blue-500">{{ event.link }}</a>
        <p class="text-gray-600">{{ event.time }}</p>
        <p class="text-red-500 font-bold">{{ formatTime(event.time) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      events: [
        { name: "Wikimedia Hackathon", link: "https://example.com/hackathon", time: "2024-11-04T00:00:00Z" },
        { name: "Wikimania", link: "https://example.com/wikimania", time: "2024-12-01T01:00:00Z" },
        { name: "Wiki Women Camp", link: "https://example.com/wikicamp", time: "2025-01-15T02:00:00Z" },
        { name: "Wikipedia Day", link: "https://example.com/wikipediaday", time: "2025-01-05T03:00:00Z" },
        { name: "Wikidata Workshop", link: "https://example.com/wikidata", time: "2024-10-30T04:00:00Z" },
        { name: "Wiki Loves Monuments", link: "https://example.com/monuments", time: "2024-11-20T05:00:00Z" },
        { name: "Wikimedia Summit", link: "https://example.com/summit", time: "2025-02-25T06:00:00Z" },
        { name: "Wikimedia Conference", link: "https://example.com/conference", time: "2025-03-10T07:00:00Z" },
        { name: "Wiki Education Program", link: "https://example.com/education", time: "2025-04-01T08:00:00Z" },
        { name: "Wiki Techstorm", link: "https://example.com/techstorm", time: "2024-12-15T09:00:00Z" },
        { name: "Wiki Loves Earth", link: "https://example.com/earth", time: "2025-05-10T10:00:00Z" },
        { name: "WikiConference North America", link: "https://example.com/northamerica", time: "2024-12-25T11:00:00Z" },
      ],
    };
  },
  methods: {
    formatTime(time) {
      const eventTime = new Date(time);
      const now = new Date();
      let diff = eventTime - now;

      const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
      diff -= months * (1000 * 60 * 60 * 24 * 30);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= days * (1000 * 60 * 60 * 24);
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      diff -= hours * (1000 * 60 * 60);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      diff -= minutes * (1000 * 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return `${months}m ${days}d ${hours}h ${minutes}m ${seconds}s`;
    },
    randomColorClass(index) {
      const classes = ['bg-red-200', 'bg-blue-200', 'bg-purple-200', 'bg-green-200', 'bg-yellow-200'];
      return classes[index % classes.length];
    },
  },
  mounted() {
    setInterval(() => {
      this.$forceUpdate();
    }, 1000);
  },
};
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
