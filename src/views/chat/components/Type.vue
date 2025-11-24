<script setup lang="ts">
import { ref } from 'vue'
import { changeHandle } from '../hooks/useType'

const emit = defineEmits(['typeClickHandle'])

const btnActive = ref<string>('')

const btnList = [
  {
    id: '1',
    type: 'first',
    name: '初诊',
  },
  {
    id: '2',
    type: 'nofirst',
    name: '复诊',
  },

]

function clickHandle(val: string, name: string) {
  btnActive.value = val
  emit('typeClickHandle', name)
  changeHandle(false)
}
</script>

<template>
  <div class="type-container">
    <div
      v-for="btn in btnList" :key="btn.id" :class="btn.id === btnActive ? 'btn-active' : ''" class="btn"
      @click="clickHandle(btn.id, btn.name)"
    >
      {{ btn.name }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.type-container {
    --base-color: #2386ff;
    --active-bg: #C0DCFF;
    background: #fff;
    margin-top: 8px;
    border-radius: 8px;
    width: 100%;
    display: flex;

    .btn {
        flex: 1;
        text-align: center;
        padding: 8px;

        &:nth-of-type(1) {
            border-radius: 8px 0px 0px 8px;
            border-right: 1px solid #e3e4e5;
        }

        &:nth-of-type(2) {
            border-radius: 0px 8px 8px 0px;
        }

    }

    .btn-active {
        background: var(--active-bg);
    }
}
</style>
