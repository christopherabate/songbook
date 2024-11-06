import { createRouter, createWebHistory } from '@ionic/vue-router';

const routes = [
  {
    path: '/songbook/:id?',
    name: 'Songbook',
    component: () => import ('@/views/Songbook.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'Songbook' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
