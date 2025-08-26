import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/chat',
    },
    {
      path: '/chat',
      name: 'chat',
      props: true,
      component: () => import('@/views/chat/index.vue'),
      meta: {
        title: '智能分诊'
      }
    },
    {
      path: '/caseMaterial',
      name: 'caseMaterial',
      component: () => import('@/views/caseMaterial/index.vue'),
    },
  ],
})

export default router
