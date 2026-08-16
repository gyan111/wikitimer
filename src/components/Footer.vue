<template>
  <footer :class="['w-full py-4 px-4 text-center text-xs sm:text-sm transition-colors duration-300 border-t border-gray-200/50 dark:border-gray-800/50 backdrop-blur-md', darkMode ? 'bg-gray-900/80 text-gray-400' : 'bg-white/80 text-gray-600']">
    <div class="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl px-2">
      <div class="flex items-center gap-1.5 font-medium">
        <span>WikiTimer</span>
        <span class="opacity-40">•</span>
        <span>Created by</span>
        <a
          href="https://meta.wikimedia.org/wiki/User:Jnanaranjan_sahu"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary-600 dark:text-primary-400 hover:underline font-semibold transition-colors duration-200"
        >
          Jnanaranjan Sahu (Gyan)
        </a>
      </div>

      <div class="flex items-center flex-wrap justify-center gap-4 text-xs">
        <a
          href="https://toolforge.org"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-gray-900 dark:hover:text-gray-200 transition-colors inline-flex items-center gap-1"
        >
          <span>⚡ Hosted on Wikimedia Toolforge</span>
        </a>
        <span class="opacity-30 hidden sm:inline">•</span>
        <a
          href="https://github.com/gyan111/wikitimer"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-gray-900 dark:hover:text-gray-200 transition-colors inline-flex items-center gap-1"
        >
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          <span>Source Code</span>
        </a>
        <span class="opacity-30 hidden sm:inline">•</span>
        <a
          href="https://github.com/gyan111/wikitimer/issues"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <span>Report an Issue</span>
        </a>
      </div>
    </div>
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