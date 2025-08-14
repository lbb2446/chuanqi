import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/character'
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/character',
      name: 'character',
      component: () => import('../views/CharacterView.vue'),
    },
    {
      path: '/equipment',
      name: 'equipment',
      component: () => import('../views/EquipmentView.vue'),
    },
    {
      path: '/maps',
      name: 'maps',
      component: () => import('../views/MapsView.vue'),
    },
    {
      path: '/battle',
      name: 'battle',
      component: () => import('../views/BattleView.vue'),
    },
  ],
})

export default router
