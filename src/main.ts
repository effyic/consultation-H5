import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import VConsole from 'vconsole'

import router from './router'
import './assets/main.css'
import 'vant/lib/index.css'
import globalComponent from '@/components/SvgIcon/index'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import 'virtual:svg-icons-register'
const app = createApp(App)
const vconsole:any = new VConsole()

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(vconsole)

app.use(globalComponent)
app.mount('#app')
