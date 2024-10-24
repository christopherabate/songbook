import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:catchAll(.*)',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'home',
    component: () => import ('../views/Home.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import ('../views/Settings.vue'),
  },
  {
    path: '/book/:id',
    name: 'book',
    component: () => import ('../views/Book.vue'),
  },
  {
    path: '/song/:id',
    name: 'song',
    component: () => import ('../views/Song.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
