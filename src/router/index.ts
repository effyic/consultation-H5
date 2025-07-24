import {createRouter, createWebHistory} from 'vue-router'

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
            path: '/detail/:id/:name',
            name: 'detail',
            component: () => import('@/views/DetailView.vue'),
        },
    ],
})

export default router
