import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/chat',
    },
    {
    // /:consultationId/:date
      path: '/chat',
      name: 'chat',
      component: () => import('@/views/ChatView.vue'),
    },
    {
        path: '/department',
        name: 'department',
        component: () => import('@/views/DepartmentView.vue'),
      },
  ],
})

export default router
