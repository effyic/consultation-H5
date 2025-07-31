<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router';
import chat from "@/api/chat.ts";
import {ElLoading} from "element-plus";

const route = useRoute();
const router = useRouter();
const chat_id = ref(0)
const recommendDetail = ref<any>({})
const name = ref('')
const caseList = ref<any>({})
const dialogVisible = ref(false)
const pdfUrl = ref('')
const pdfName = ref('')

onMounted(() => {
  if (route.params?.data) {
    const raw = decodeURIComponent(route.params.data as string)
    caseList.value = JSON.parse(raw)
  }

  if (Number(route.params.id) == 0) {
    recommendDetail.value.appointment_time = route.params.name
  } else {
    chat_id.value = Number(route.params.id)
    name.value = route.params.name.toString()
    getDetail()
  }
})

function back() {
  router.back()
}

function getDetail() {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  chat.summary(chat_id.value).then((res) => {
    recommendDetail.value = res.data
    if (res.data.chat_file) {
      res.data.chat_file.forEach((item: any) => {
        item.file_url = 'https://cyh.effyic.com/api/' + item.file_url
      })
    }
    loading.close()
  })
}

const isPDF = (name: any) => {
  return name?.endsWith('.pdf')
}
</script>

<template>
  <div class="headerTab">
    <img alt="返回" src="@/assets/back1.png" style="width: 24px; height: 24px;display: block;margin-left: 12px;"
         @click="back"/>
    <div>病情信息</div>
  </div>
  <div class="main">
    <!--    <div class="headerBox">-->
    <!--      <img src="@/assets/detailHeaderIcon.png" style="width: 50px;height:50px"/>-->
    <!--      <div class="name">-->
    <!--        <div>{{ name }}</div>-->
    <!--        <p>知名专家 辛弃疾</p>-->
    <!--      </div>-->
    <!--    </div>-->
    <div class="summaryBox" style="margin-top: 16px">
      <div class="label">就诊时间：
        <div style="color:#529EEE;">{{ recommendDetail?.appointment_time }}</div>
      </div>
      <div class="label">主诉：
        <div>{{ recommendDetail?.chief_complaint || '无' }}</div>
      </div>
      <div class="label">现病况：
        <div>{{ recommendDetail?.present_illness || '无' }}</div>
      </div>
      <div class="label">即往史：
        <div>{{ caseList?.past_history || '无' }}</div>
      </div>
      <div class="label">过敏史：
        <div>{{ caseList?.allergy_history || '无' }}</div>
      </div>
      <div class="label">家族史：
        <div>{{ caseList?.family_history || '无' }}</div>
      </div>
      <div class="label">患者自述：
        <div>{{ recommendDetail?.description || '无' }}</div>
      </div>
    </div>
    <div v-if="recommendDetail.chat_file && recommendDetail.chat_file.length >0">
      <div style="color:#333;margin-top: 16px">过往病例，检查文档:</div>
      <div class="summaryBox" style="margin-top: 10px;padding-bottom: 20px">
        <div class="imgBox">
          <div v-for="item in recommendDetail.chat_file" :key="item.id">
            <div class="imgDetail" style="display: flex;flex-direction: column;align-items: center;">
              <div v-if="!isPDF(item.name)" class="cont">
                <el-image
                    :initial-index="4"
                    :max-scale="7"
                    :min-scale="0.2"
                    :preview-src-list="[item.file_url]"
                    :src="item.file_url"
                    :zoom-rate="1.2"
                    fit="cover"
                    show-progress
                    style="width: 80px; height: 80px;margin-right: 10px"
                />
                <div class="name">{{ item.name }}</div>
              </div>
              <div v-else class="cont" @click="pdfUrl = item.file_url;dialogVisible = true;pdfName = item.name">
                <img src="@/assets/pdf.png"
                     style="width: 80px; height: 80px;"
                />
                <div class="name">{{ item.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
    <el-dialog
        v-model="dialogVisible"
        :title="pdfName"
        width="500"
    >
            <iframe
                :src="pdfUrl"
                width="100%"
                style="border: none;">
            </iframe>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="dialogVisible = false">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
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
  background: #F4F5F5;
  min-height: 100vh;
  width: 100vw;
  height: 100%;
  padding: 44px 20px 20px;
  overflow: hidden;


  .headerBox {
    width: 100%;
    height: 84px;
    display: flex;
    padding: 22px 16px;
    background: #fff;
    border-radius: 10px;

    img {
      margin-right: 23px;
    }

    .name {
      display: flex;
      flex-direction: column;

      div {
        font-size: 16px;
        font-weight: 500;
        color: #000000D9;
      }

      p {
        color: #000000A6;
        font-size: 14px;
        font-weight: 400;
      }
    }
  }

  .summaryBox {
    width: 100%;
    background: #fff;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    padding: 16px 10px;

    .label {
      color: #000000A6;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 10px;
      display: flex;
      flex-direction: column;

      div {
        width: 100%;
        word-break: break-all;
      }

    }
  }

  .imgBox {
    width: 100%;
    display: flex;
    flex-wrap: wrap;

    .imgDetail {
      width: 100px;
      height: 100px;
      display: flex;

      .cont {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .name {
        width: 80px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        color: #000;

      }

      .el-image {
        width: 80px !important;

      }

      img {
        width: 80px !important;
      }
    }
  }
}
:deep(.el-dialog){
  --el-dialog-margin-top:10vh;
  width: 100% !important;
  max-height: 90vh;
  .el-dialog__body{
    iframe{
      height: 60vh !important;
    }
  }
}
</style>
