<script setup lang="ts">
import { RouterView } from 'vue-router'

function setViewHeight() {
  const windowVH = window.innerHeight / 100
  document.documentElement.style.setProperty('--vh', `${windowVH}px`)
}

const resizeEvent = 'orientationchange' in window ? 'orientationchange' : 'resize'
document.addEventListener('DOMContentLoaded', setViewHeight)
window.addEventListener(resizeEvent, setViewHeight)
</script>

<template>
  <RouterView />
</template>

<style>
:root {
    --vh: 1vh;
  }
/* 自定义失败 Toast 的样式 */
.van-toast--fail {
  background-color: rgba(0, 0, 0, .7) !important;
}

:deep(.van-popup) {
  background: rgba(0, 0, 0, .7) !important;
}
</style>
