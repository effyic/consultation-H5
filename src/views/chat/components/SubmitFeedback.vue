<script setup lang="ts">
import { ref } from 'vue'

interface btnI {
  name: string
  id: number
}

const { callback } = defineProps({
  callback: {
    type: Function,
    required: true,
  },
})
const autoSize = {
  maxHeight: 120,
  minHeight: 120,
}
const placeholder = '准确详细的根据问题回复相应内容更有助于科室的准确推荐哦，您也可以试着说明推荐不准确的原因，比如‘我实际应该看皮肤科而不是过敏科’'

const btnList = ref<btnI[]>([
  {
    name: '准确',
    id: 1,
  },
  {
    name: '不准确',
    id: 2,
  },
])

const val = ref<string>('')

const btnActive = ref<number>(0)
function btnHandle(id: number) {
  btnActive.value = id

  callback && callback(id, val.value, true)
}
function sumbitHandle() {
  callback && callback(btnActive.value, val.value, false)
}
</script>

<template>
  <div class="submit-feedback">
    <div class="title">
      您觉得本次推荐挂号科室准确吗？
    </div>
    <div class="btns">
      <div v-for="btn in btnList" :key="btn.id" class="btn" :class="btnActive === btn.id ? 'active' : ''" @click="btnHandle(btn.id)">
        <svg
          :class="btn.id === 1 ? '' : 'icon-no'"
          t="1763363327307" class="icon" viewBox="0 0 1024 1024" version="1.1"
          xmlns="http://www.w3.org/2000/svg" p-id="14036" width="128" height="128"
        >
          <path
            d="M773.6 912.7h-1.2c-37.2-0.4-74.5-0.4-111.8-0.4h-56.9c-38 0-76 0-114.1-0.5-21.1-0.6-41.9-5-61.5-13-33.3-13-52.3-42-52.2-79.7l0.1-141.4c0-78.3 0-156.7 0.7-235 0.1-21.3 13.8-41.3 25.5-51.8 45.3-41.4 94.5-93 115.1-162.6 5.7-19.4 7.9-40.8 10.2-63.4 4.6-45 33.8-74.3 72.8-74.3 15.3 0 30.6 4.6 45.6 13.5 30.1 18.1 50.2 46.5 61.3 87 17.8 64.3 8.7 126.7-1.3 180.2v0.2c-2.3 12.5 7.1 24.1 19.9 24.1h130c22.4 0 54.5 2.8 74.3 26.8 14.4 17.5 18.5 41.1 12.4 72.3-18.6 95.9-41.4 192.6-63.2 282.7-6.8 28.1-18.1 54.1-29 79.3l-4.7 10.8c-12.4 29.2-38 45.2-72 45.2zM216.1 903.3h-11.9c-43 0-78.2-35.2-78.2-78.2V476.6c0-43 35.2-78.2 78.2-78.2h11.9c43 0 78.2 35.2 78.2 78.2V825c0.1 43.1-35.1 78.3-78.2 78.3z"
            fill="#8f8f8f" p-id="14037"
          />
        </svg>
        <span>{{ btn.name }}</span>
      </div>
    </div>
    <div v-if="btnActive === 2" class="submit-content">
      <van-field
        v-model="val"
        style="border: 1px solid #f0f0f0; border-radius: 6px; font-size: 12px;"
        type="textarea"
        :placeholder="placeholder"
        :autosize="autoSize"
        :show-word-limit="true"
        maxlength="100"
        :clearable="true"
        border
      />
      <div class="submit-button" @click="sumbitHandle">
        提交
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.submit-feedback {
    --base-color: #2386ff;
    --active-bg:#C0DCFF;
    background: #fff;
    padding: 10px;
    margin-top: 8px;
    border-radius: 8px;

    .title {
        font-size: 14px;
        font-weight: bold;
        color: #333333;
    }

    .btns {
        // width: 400px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin: 10px 0px;
        .active{
            background: var(--active-bg) !important;
            border: 1px solid var(--base-color);
            span{
                color: var(--base-color);
            }
            .icon{
                path{
                    fill:var(--base-color)
                }
            }
        }

        .btn {
            background: #ebebeb;
            height: 28px;
            border-radius: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            .icon-no{
                transform: rotate(-180deg);
            }

            .icon {
                width: 16px;
                height: 16px;
                margin-top: -1px;
            }
            span{
                margin-left: 4px;
            }

        }
    }
    .submit-content{
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        .submit-button{
            width: 50%;
            border-radius: 28px;
            color:#fff;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 10px;
            height: 28px;
            background: var(--base-color);
        }
    }
}
</style>
