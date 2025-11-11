<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import chat from "@/api/chat.ts";
import { ElLoading, ElMessage, type UploadUserFile } from 'element-plus'

const route = useRoute()
const router = useRouter()

const active = ref(0);
const goback = () => {
  router.go(-1)
}


const fileList = ref<UploadUserFile[]>([])

// 上传前检查文件格式
const handleChange = (file: any) => {
  console.log(file);

  const isValidType = ['image/png', 'image/jpeg', 'image/jpg'].includes(file.raw?.type || '')
  const isValidSize = (file.size || 0) / 1024 / 1024 <= 20

  if (!isValidType) {
    ElMessage.error('只能上传 PNG、JPG、JPEG 格式的文件')
    removeFile(file)
  }

  if (!isValidSize) {
    ElMessage.error('文件大小不能超过 20MB')
    removeFile(file)
  }
}

const handleExceed = () => {
  ElMessage.error('最多只能上传九个文件')
}

// 自定义上传逻辑
const httpRequest = async (option: any) => {
  return
}
const isImage = (file: any) => {
  const type = file.raw?.type || file.type
  return type?.startsWith('image/')
}
// 删除文件
const removeFile = (index: number) => {
  fileList.value.splice(index, 1)
}

const isSuccess = ref(false)
const submit = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '上传中',
    background: 'rgba(0, 0, 0, 0.5)',
  })
  const formData = new FormData()
  fileList.value.forEach(file => {
    formData.append('files', file.raw!) // file.raw 是 UploadRawFile
  })
  chat.upload(parseInt(route.query.registration_no as string), formData).then(res => {
    isSuccess.value = true
    loading.close()
  })
}
</script>

<template>
  <div class="headerTab">
    <img alt="返回" src="@/assets/back1.png" @click="goback" />
    <div>病例材料</div>
  </div>
  <div class="container" v-if="!isSuccess">
    <div class="imgList" :style="`grid-template-columns: repeat(${fileList.length == 0 ? 1 : 3}, 1fr);`">
      <div v-for="(item, index) in fileList" class="imgDetail">
        <img :src="item.url" style="width:100%;height: 100%;">
        <div class="del">
          <img src="@/assets/del.png" @click="removeFile(index)">
        </div>
      </div>
      <el-upload list-type="picture-card" v-model:file-list="fileList" :auto-upload="false" :http-request="httpRequest"
        :limit="9" :on-change="handleChange" :on-exceed="handleExceed" :show-file-list="false"
        accept=".png,.jpg,.jpeg,.pdf" class="upload-demo" multiple style="width: 100%">
        <div class="upLoad">
          <img src="@/assets/upload.png" alt="">
          上传病例
        </div>
      </el-upload>
    </div>
    <div style="margin: 18px 0 8px;color: #666666;font-size: 14px;">上传化验单、检查资料、处方单、患处照片或疾病描述相关病历资料(最多上传9张)</div>
    <div style="font-size: 12px;color: #FF8E2E;">照片仅医生及自己可见</div>
  </div>
  <div v-else class="success">
    <img src="@/assets/successIcon.png" alt="">
    上传成功
  </div>
  <div class="submit">
    <div v-if="!isSuccess" class="btn" :class="{ disabled: fileList.length == 0 }" dis
      @click="fileList.length == 0 ? '' : submit()">提交</div>
    <div v-if="isSuccess" class="btn"
      @click=" router.push({ path: '/chat', query: { registration_no: route.query.registration_no, isCase: 1 } })">
      返回首页</div>
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

:deep(.el-upload) {
  width: 100%;
  height: 109px;
  border: none;
}

.success {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 200px;
  font-size: 20px;
  color: #333;

  img {
    width: 53px;
    margin-bottom: 20px;
  }
}

.container {
  margin-top: 50px;
  width: 100%;
  min-height: calc(100vh - 50px);
  background: #F5F5F5;
  padding: 16px 16px 81px;

  .upLoad {
    width: 100%;
    height: 109px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 6px;
    background: #FFFFFF;
    font-size: 12px;
    color: #333;

    img {
      width: 24px;
      margin-bottom: 8px;
    }
  }

  .imgList {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;

    .imgDetail {
      height: 109px;
      height: cover;
      position: relative;

      .del {
        position: absolute;
        top: 4px;
        right: 4px;

        img {
          width: 16px;
        }
      }
    }
  }
}

.submit {
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 0 16px 34px;

  .btn {
    width: 100%;
    display: flex;
    height: 47px;
    align-items: center;
    justify-content: center;
    background: #2386FF;
    color: #fff;
    font-size: 16px;

    &.disabled {
      background: #EDEFF2;
      color: #BEC2CC;
    }
  }
}
</style>