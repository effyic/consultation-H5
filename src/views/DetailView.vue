<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router';
import chat from "@/api/chat.ts";

const route = useRoute();
const router = useRouter();
const chat_id = ref(0)
const recommendDetail = ref<any>({})
const name = ref('')
const caseList = ref<any>()
onMounted(() => {
  if(route.params?.data){
    let data:any = route.params.data
    caseList.value = JSON.parse(data)
  }
    if(Number(route.params.id) == 0) {
      recommendDetail.value.appointment_time = route.params.name
    }else {
      chat_id.value = Number(route.params.id)
      name.value = route.params.name.toString()
      getDetail()
    }
})

function back(){
  router.push('/chat')
}

function getDetail() {
  chat.summary(chat_id.value).then((res) => {
    recommendDetail.value = res.data
    if(res.data.chat_file){
      res.data.chat_file.forEach((item:any)=>{
        item.file_url = 'http://172.16.1.24:30137/api/' + item.file_url
      })
    }
    console.log(res)
  })
}
</script>

<template>
  <div class="headerTab">
    <img alt="返回" @click="back" src="@/assets/back1.png" style="width: 24px; height: 24px;display: block;margin-left: 12px;"/>
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
      <div class="label">患者自述：
        <div>{{ recommendDetail?.description || '无' }}</div>
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
    </div>
    <div v-if="recommendDetail.chat_file && recommendDetail.chat_file.length >0">
      <div style="color:#333;margin-top: 16px">过往病例:</div>
      <div class="summaryBox" style="margin-top: 10px;padding-bottom: 20px">
       <div class="imgBox">
         <div v-for="item in recommendDetail.chat_file" :key="item.id">
           <el-image
               style="width: 100px; height: 100px;margin-right: 10px"
               :src="item.file_url"
               :zoom-rate="1.2"
               :max-scale="7"
               :min-scale="0.2"
               :preview-src-list="[item.file_url]"
               show-progress
               :initial-index="4"
               fit="cover"
           />
         </div>
       </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.headerTab{
  position: fixed;
  top: 0;
  height: 44px;
  background: #fff;
  width: 100vw;
  line-height: 44px;
  display: flex;
  align-items: center;
  div{
    position: absolute;
    left: 50%;
    transform: translate(-50%);
    color:#000000;
    font-size: 17px;
    font-weight: 500;
  }

}
.main {
  background: #F4F5F5;
  min-height: 100vh;
  width: 100%;
  height: 100%;
  padding:44px 20px 20px;


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
    }
  }
  .imgBox{
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
