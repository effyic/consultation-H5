<script lang="ts" setup>
import { useRouter } from 'vue-router';

const router = useRouter();


function toRegister() {
  router.push('/Department');
}

function backPrev() {
  router.push('/index')
}
</script>

<template>
  <div class="headerTab">
    <img alt="返回" src="@/assets/back1.png" @click="backPrev" />
    <div>选择院区</div>
  </div>
  <div class="main">
    <img class="img" src="@/assets/1.png" @click="toRegister">
    <img class="img" src="@/assets/2.png" @click="toRegister">
    <img class="img" src="@/assets/3.png" @click="toRegister">
  </div>
</template>

<style lang="scss" scoped>
.headerTab {
  position: fixed;
  top: 0;
  height: 44px;
  background: #fff;
  width: 100vw;
  line-height: 44px;
  display: flex;
  align-items: center;
  z-index: 99;

  img {
    width: 24px;
    height: 24px;
    display: block;
    margin-left: 12px;
  }

  div {
    position: absolute;
    left: 50%;
    transform: translate(-50%);
    color: #000000;
    font-size: 17px;
    font-weight: 500;
  }
}

.main {
  padding: 44px 16px;
  width: 100vw;
  height: 100vh;
  background: #F4F5F5;
  color: #000;
  display: flex;
  flex-direction: column;

  .img {
    margin: 12px 0;
    width: 100%;
    height: 210px;
  }
}
</style>
