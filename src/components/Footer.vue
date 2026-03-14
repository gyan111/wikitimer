<template>
  <footer :class="['w-full py-2 px-2 text-center text-xs sm:text-sm transition-colors duration-300', darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900']">
    <p :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
      Created by
      <a
        href="https://meta.wikimedia.org/wiki/User:Jnanaranjan_sahu"
        target="_blank"
        rel="noopener noreferrer"
        class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200"
      >
        Jnanaranjan Sahu (Gyan)
      </a>
    </p>
  </footer>
</template>
  
<script>
export default {
  name: 'Footer',
  data() {
    return {
      darkMode: false
    }
  },
  mounted() {
    this.darkMode = document.documentElement.classList.contains('dark');
    // Listen for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          this.darkMode = document.documentElement.classList.contains('dark');
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
  }
}
</script>
  
<style scoped>
footer {
  box-shadow: 0 -2px 8px rgba(0,0,0,0.03);
}
</style>