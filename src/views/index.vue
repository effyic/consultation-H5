<script setup lang="ts">
import {useRouter} from 'vue-router';
const router = useRouter();


function toRegister(){
  router.push('/hospital');
}
</script>

<template>
<div class="main" @click="toRegister"></div>
</template>

<style scoped lang="scss">

.main {
  width: 100vw;
  height: 100vh;
  background: url("@/assets/homeBg.png") no-repeat center center fixed;
  background-size: 100% 100%;


}
</style>
