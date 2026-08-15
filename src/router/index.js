import { createRouter, createWebHistory } from 'vue-router';
import AddTimer from '@/components/AddTimer.vue';
import WikiTimer from '@/components/WikiTimer.vue';

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
    path: '/add',
    name: 'AddTimer',
    component: AddTimer
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
