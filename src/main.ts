import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'

import router from './router'
import './assets/main.css'
import 'vant/lib/index.css'
import globalComponent from '@/components/SvgIcon/index'

import 'virtual:svg-icons-register'
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(globalComponent)
app.mount('#app')
