import { createRouter, createWebHistory } from 'vue-router';
import WikiTimer from '@/components/WikiTimer.vue';

const AddTimer = () => import('@/components/AddTimer.vue');
const EmbedTimer = () => import('@/components/EmbedTimer.vue');

const routes = [
  {
    path: '/',
    name: 'WikiTimer',
    component: WikiTimer
  },
  {
    path: '/timer/:id(.*)',
    name: 'TimerDetail',
    component: WikiTimer,
    props: true
  },
  {
    path: '/embed/:id(.*)',
    name: 'EmbedTimer',
    component: EmbedTimer,
    props: true
  },
  {
    path: '/add',
    name: 'AddTimer',
    component: AddTimer
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Auto-reload on deployment chunk changes
router.onError((error, to) => {
  if (
    error.message?.includes('Failed to fetch dynamically imported module') ||
    error.message?.includes('Importing a module script failed') ||
    error.message?.includes('error loading dynamically imported module')
  ) {
    if (!window.sessionStorage.getItem('wikitimer_chunk_reloaded')) {
      window.sessionStorage.setItem('wikitimer_chunk_reloaded', 'true');
      window.location.href = to?.fullPath || '/';
    }
  }
});

export default router;
