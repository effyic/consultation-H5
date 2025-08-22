import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/index',
    },
    {
      path: '/index',
      name: 'index',
      component: () => import('@/views/index.vue'),
    },
    {
      // /:consultationId/:date
      path: '/chat',
      name: 'chat',
      props: true,
      component: () => import('@/views/ChatView.vue'),
      meta: {
        title: '智能分诊'
      }
    },
    {
      path: '/department',
      name: 'department',
      component: () => import('@/views/DepartmentView.vue'),
    },
    {
      path: '/hospital',
      name: 'hospital',
      component: () => import('@/views/HospitalView.vue'),
    },
    {
      path: '/detail/:id/:name/:data',
      name: 'detail',
      component: () => import('@/views/DetailView.vue'),
    },
    {
      path: '/voiceAssistant',
      name: 'voiceAssistant',
      component: () => import('@/views/VoiceAssistantView.vue'),
    },
    {
      path: '/reserve',
      name: 'reserve',
      component: () => import('@/views/reserve/index.vue'),
    },
    {
      path: '/registered',
      name: 'registered',
      component: () => import('@/views/registered/index.vue'),
    },
    {
      path: '/confirmReservation',
      name: 'confirmReservation',
      component: () => import('@/views/confirmReservation/index.vue'),
    },
    {
      path: '/caseMaterial',
      name: 'caseMaterial',
      component: () => import('@/views/caseMaterial/index.vue'),
    },
    {
      path: '/doctorDetail',
      name: 'doctorDetail',
      component: () => import('@/views/doctorDetail/index.vue'),
    },
  ],
})

export default router
