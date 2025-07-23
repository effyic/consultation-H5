/// <reference types="vite/client" />
/// <reference types="vite/client" />
// 引入插件中ts报错
declare module 'element-plus/dist/locale/zh-cn.mjs'
declare module '@element-plus/icons-vue'
declare module 'event-source-polyfill'
declare module 'markdown-it'
declare module 'vant'
declare module '@microsoft/fetch-event-source'
declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<any, any, object>
  export default component
}
