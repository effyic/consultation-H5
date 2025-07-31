<script lang="ts" setup>
import MarkdownIt from 'markdown-it'
import {nextTick, onMounted, onUnmounted, ref, watchEffect} from 'vue'
import {useWebSocket} from "@/stores/websocket.ts";
import {useChat} from "@/stores/chatService.ts";
import {useRoute, useRouter} from 'vue-router';
import axios from "axios";
import chat from "@/api/chat.ts";
import {ElLoading, ElMessage, type UploadUserFile} from 'element-plus'
import voiceInput from './components/VoiceInput.vue'

const router = useRouter();
const route = useRoute();
const chatStore = useChat();
const md = new MarkdownIt()
const webSocket = useWebSocket()
const messageCont = ref<any>(null)
const recommendDetail = ref<any>({})
const isDialog = ref(false)
const recommendName = ref('')
const visualizerRef = ref();
const isVoice = ref(false)
const fileList = ref<UploadUserFile[]>([])
const isMedicalHistory = ref(false)
const past_history = ref('')
const allergy_history = ref('')
const family_history = ref('')
const isSendFlg = ref(false)


//  聊天信息置底
function toScrollBottom() {
  nextTick(() => {
    const container = messageCont.value
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  })
}

function removeSpaceAfterNumber(str: any) {
  return str.replace(/(\d+)\.\s+/g, '\$1.')
}

onMounted(() => {
  if (webSocket.historyList.length > 0 && webSocket.historyList[webSocket.historyList.length - 1]?.recommended_dept.length > 0) {
    webSocket.historyList[webSocket.historyList.length - 1].recommended_dept = []
    isSendFlg.value = true
  }
  chatStore.questions()
  nextTick(() => {
    const container = messageCont.value
    if (container) {
      container.style.cssText = `
        will-change: transform;
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      `
    }
    webSocket.connectWebSocket()
    // 每隔 5 秒检查一次 WebSocket 状态
    setInterval(webSocket.checkConnectionStatus, 5000);
  })
})

watchEffect(() => {
  if (webSocket.historyList[webSocket.historyList.length - 1]?.content) {
    toScrollBottom()
  }
  if (webSocket.historyList[webSocket.historyList.length - 1]?.quick_options) {
    toScrollBottom()
  }
  // 当有推荐科室时，停止语音输入
  if (webSocket.historyList[webSocket.historyList.length - 1]?.recommended_dept) {
    isMedicalHistory.value = true
    isVoice.value = false;
    visualizerRef.value?.stop();
    toScrollBottom()
  }
})

function more() {
  chatStore.questions()
}

function sendTag(item: any, name: string) {
  webSocket.historyList[webSocket.historyList.length - 1].quick_options = ''
  webSocket.sendMessage(name)
}

function backPrev(flg: boolean) {
  if (flg) {
    let data = JSON.stringify({
      past_history: past_history.value,
      allergy_history: allergy_history.value,
      family_history: family_history.value,
    })
    let name = recommendName.value || '无'
    let id = webSocket.chat_id
    router.push({
      name: 'department',
      query: {id, name, data}
    })
  } else {
    router.push({
      name: 'department',
    })
  }

}

function backNext(id: number, name: string) {
  recommendName.value = name
  const loading = ElLoading.service({
    lock: true,
    text: '加载中',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  chat.summary(id).then((res) => {
    isDialog.value = true
    loading.close()
    recommendDetail.value = res.data
  })
  // router.push({
  //   name: 'detail',
  //   params: {id, name}
  // })
}


async function toDetail() {
  let data = encodeURIComponent(JSON.stringify({
    past_history: past_history.value,
    allergy_history: allergy_history.value,
    family_history: family_history.value,
  }))
  if (fileList.value.length === 0) {
    let name = recommendName.value || '无'
    let id = webSocket.chat_id
    router.push({
      name: 'detail',
      params: {id, name, data}
    })
    isDialog.value = false
  } else {
    const loading = ElLoading.service({
      lock: true,
      text: '上传中',
      background: 'rgba(0, 0, 0, 0.7)',
    })
    const formData = new FormData()
    fileList.value.forEach(file => {
      formData.append('files', file.raw!) // file.raw 是 UploadRawFile
    })
    try {
      await axios.post(`https://cyh.effyic.com/api/chat/${webSocket.chat_id}/upload`, formData)
      ElMessage.success('上传成功！')
      const name = recommendName.value || '无'
      const id = webSocket.chat_id
      loading.close()
      router.push({
        name: 'detail',
        params: {id, name, data}
      })
      isDialog.value = false
    } catch (err) {
      loading.close()
      ElMessage.error('上传失败，请稍后重试')
    }


  }
}

onUnmounted(() => {
  if (webSocket.ws) {
    webSocket.ws.close(); // 组件销毁时关闭 WebSocket 连接
  }
})

const handleStart = () => {
  // if (isSendFlg.value) return;
  isVoice.value = true
  visualizerRef.value.start();
  visualizerRef.value.setAutoSend(true)
};
const onTranscript = (text: string) => {
  // if (isSendFlg.value) return;
  webSocket.sendMessage(text)
};
const handleStop = () => {
  visualizerRef.value.stop();
  isVoice.value = false
};


// 上传前检查文件格式
const handleChange = (file: any, fileListNow: any) => {
  const isValidType = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'].includes(file.raw?.type || '')
  const isValidSize = (file.size || 0) / 1024 / 1024 <= 20

  if (!isValidType) {
    ElMessage.error('只能上传 PNG、JPG、JPEG、PDF 格式的文件')
    removeFile(file)
  }

  if (!isValidSize) {
    ElMessage.error('文件大小不能超过 20MB')
    removeFile(file)
  }
}

const handleExceed = () => {
  ElMessage.error('最多只能上传十个文件')
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
const close = () => {
  isDialog.value = false
  if (webSocket.historyList.length > 0 && webSocket.historyList[webSocket.historyList.length - 1]?.recommended_dept) {
    webSocket.historyList[webSocket.historyList.length - 1].recommended_dept = []
    // isSendFlg.value = true
  }
}
</script>

<template>
  <div class="headerTab">
    <img alt="返回" src="@/assets/back1.png" style="width: 24px; height: 24px;display: block;margin-left: 12px;"
         @click="backPrev(false)"/>
    <div>智能分诊</div>
  </div>
  <div ref="main" class="main">
    <div class="dialogue">
      <div ref="messageCont" class="content">
        <div class="message-wrapper">
          <div class="promptBox">
            <div class="promptHeader">
              <img src="@/assets/logo.png">
              <div class="titleName">
                <div>
                  Hi～我是朝阳医院智能分诊助手
                </div>
                <p>我已解答108万+问题，有什么需要我帮你的？</p>
              </div>
            </div>
            <!--            <div class="problemBox">-->
            <!--              <div class="problemHeader">-->
            <!--                <div>常见问题</div>-->
            <!--                <div @click="more">换一换</div>-->
            <!--              </div>-->
            <!--              <div class="listBox">-->
            <!--                <div v-for="(item,index) in chatStore.questionList" :key="index" class="problemList"-->
            <!--                     @click="webSocket.sendMessage(item.question)">-->
            <!--                  {{ item.question }}-->
            <!--                </div>-->
            <!--              </div>-->
            <!--            </div>-->
          </div>
          <div class="responseCont" style="margin-top: 20px">
            <div class="chatAnswer">
              <div class="chatTxt">
                <div v-html="md.render('我是朝阳医院预问诊全科大夫，请问您感觉哪里不舒服呢？')"/>
              </div>
            </div>
          </div>
          <div v-for="(item, i) in webSocket.historyList" :key="i" class="responseCont">
            <!-- 用户消息 -->
            <div v-if="item.role == 'user'" class="infoCont">
              <div class="textCont">
                <p>{{ item.content }}</p>
              </div>
            </div>
            <!-- AI助手消息 -->
            <div v-else :class="{ 'mt-30': i > 0 && webSocket.historyList[i-1].type === 'chat_stream' }"
                 class="chatAnswer">
              <!--              <div :style="{ backgroundImage: `url(${chatIcon})` }" class="avatar"/>-->
              <div :class="item.content === '' ? 'isLoading':'chatTxt'">
                <div v-html="md.render(item.content ? removeSpaceAfterNumber(item.content) : '')"/>
              </div>
            </div>
            <div v-if="item.role !== 'user'">
              <div v-if="item.quick_options?.length > 0 && item.recommended_dept?.length == 0" class="tagBox"
                   style="color:#000">
                <div class="tagList">
                  <div v-for="name in item.quick_options" class="tagName" @click="sendTag(item,name)">
                    {{ name }}
                  </div>
                </div>
              </div>
              <div v-if="item.recommended_dept?.length > 0" class="chatAnswer"
                   style="margin-top: 24px">
                <div class="chatTxt">
                  <div
                      v-html="md.render('请问您是否有既往史，过敏史，家族史，如果有您可在下方输入框中填写后再点击挂号。')"/>
                </div>
              </div>
              <!--             -->
              <div v-if="item.recommended_dept?.length > 0" class="recommendBox">
                <div class="titleName">
                  推荐挂号科室
                  <div style="display:flex;width: 100%;align-items: center;color:#FFF;font-size: 16px;margin-top: 6px;">
                    <img src="@/assets/recommendIcon.png" style="width: 16px; height: 16px;margin-right: 10px;">
                    {{ item.recommended_dept || '无' }}
                  </div>
                </div>
                <div class="detail">
                  <div class="top">
                    <div class="isHistoryBox">
                      <div class="inputBox">
                        <div class="label">既往史：</div>
                        <el-input v-model="past_history" placeholder="请输入" type="text"/>
                      </div>
                      <div class="inputBox">
                        <div class="label">过敏史：</div>
                        <el-input v-model="allergy_history" placeholder="请输入" type="text"/>
                      </div>
                      <div class="inputBox">
                        <div class="label">家族史：</div>
                        <el-input v-model="family_history" placeholder="请输入" type="text"/>
                      </div>
                    </div>
                  </div>
                  <div class="btnBox">
                    <div class="leftBtn" @click="backNext(item.chat_id,item.recommended_dept)">自动挂号</div>
                    <div class="rightBtn" @click="backPrev(true)">手动挂号</div>
                  </div>
                </div>
              </div>
<!--              <div v-if="isSendFlg" class="chatAnswer"-->
<!--                   style="margin-top: 24px">-->
<!--                <div class="chatTxt">-->
<!--                  <div-->
<!--                      v-html="md.render('感谢您的使用，您提供的信息都会传给问诊医生作为诊断参考，请按时到院进行报道问诊。')"/>-->
<!--                </div>-->
<!--              </div>-->
            </div>
          </div>
        </div>
      </div>
      <div class="Bottombox">
        <div class="defaultInputText">
          <div class="sendbox">
            <input
                v-show="!isVoice"
                v-model.trim="webSocket.userContext"
                class="sendInput" placeholder="请输入您想要咨询的问题"
                @keydown.enter.stop="onTranscript(webSocket.userContext)"
            >
            <voiceInput v-show="isVoice" ref="visualizerRef" @transcript="onTranscript">
            </voiceInput>
            <div v-if="isVoice" style="display: flex;align-items: center;" @click="handleStop">
              <img alt="" src="@/assets/voiceStop.png" style="width: 24px;margin-right: 8px;cursor: pointer;">
            </div>
            <div v-else style="display: flex;align-items: center;">
              <img alt="" src="@/assets/voiceStart.png"
                   style="width: 24px;margin-right: 8px;cursor: pointer;" @click="handleStart">
              <div class="sendBtn" @click="onTranscript(webSocket.userContext)">
                <div class="iconWrapper">
                  <svg-icon class="icon" height="24px" name="sendIcon" style="color:#529EEE" width="24px"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog
        v-model="isDialog"
    >
      <div class="dialogBox">
        <img src="@/assets/success.png" style="width: 64px; height: 64px;">
        <span>预约成功</span>
        <div class="detailBox">
          <img src="@/assets/detailHeaderIcon.png" style="width:50px; height:50px;">
          <div class="detailCont">
            <div class="name">{{ recommendName || '内心科' }}</div>
            <p>知名专家 辛弃疾</p>
          </div>
        </div>
        <div class="time" style="margin-top: 16px;">就诊时间：</div>
        <div class="time">{{ recommendDetail?.appointment_time }}</div>
        <el-upload
            v-if="fileList.length < 10"
            v-model:file-list="fileList"
            :auto-upload="false"
            :http-request="httpRequest"
            :limit="10"
            :on-change="handleChange"
            :on-exceed="handleExceed"
            :show-file-list="false"
            accept=".png,.jpg,.jpeg,.pdf"
            class="upload-demo"
            multiple
            style="width: 100%"
        >
          <div class="upLoad">点击上传过往病例或检查文档</div>
        </el-upload>
        <div class="imgBox">
          <div v-for="(item,index) in fileList" class="imgList">
            <div class="imgDetail">
              <img v-if="isImage(item?.raw)" src="@/assets/fileIcon.png" style="width:40px; height:40px;">
              <img v-else src="@/assets/pdf.png" style="width:40px; height:40px;">
              <div class="name">{{ item.name }}</div>
              <div class="del">
                <img src="@/assets/del.png" style="width:32px; height:32px;" @click="removeFile(index)">
              </div>
            </div>
          </div>
        </div>
        <div style="display: flex;">
          <div class="bacChat" @click="close">返回</div>
          <div class="btn" @click="toDetail">病历文档临时查看</div>
        </div>
      </div>
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
  z-index: 99;

  div {
    position: absolute;
    left: 50%;
    transform: translate(-50%);
    color: #000000;
    font-size: 17px;
    font-weight: 500;
  }

}

:deep(.el-dialog) {
  width: 311px !important;
  padding: 0 !important;
  background: transparent !important;

  .el-dialog__header {
    display: none !important;
  }

  .dialogBox {
    border-radius: 20px !important;
    background: #fff;
    display: flex;
    flex-direction: column;
    padding: 32px 20px;
    align-items: center;

    span {
      font-size: 18px;
      font-weight: 500;
      padding: 16px 0 24px;
      color: #000000;
    }

    .detailBox {
      display: flex;
      padding: 18px 16px;
      width: 100%;
      background: #F0F2F5;
      border-radius: 8px;
      align-items: center;

      img {
        margin-right: 20px;
      }

      .detailCont {
        display: flex;
        flex-direction: column;

        .name {
          color: #000000D9;
          font-size: 16px;
          font-weight: 500;
        }

        p {
          color: #000000A6;
          font-size: 14px;
          font-weight: 400;
        }
      }
    }

    .time {
      width: 100%;
      color: #333333;
      font-size: 14px;
      font-weight: 500;
    }

    .upLoad {
      margin-top: 6px;
      width: 100%;
      font-size: 14px;
      font-weight: 500;
      color: rgba(82, 158, 238, 0.8);
    }

    .bacChat {
      margin-top: 10px;
      height: 40px;
      padding: 0 20px;
      margin-right: 20px;
      min-height: 40px;
      border-radius: 100px;
      background: #fff;
      border: 1px #529EEE solid;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: 500;
      font-size: 16px;
      color: #333333;
    }

    .btn {
      margin-top: 10px;
      width: 151px;
      height: 40px;
      min-height: 40px;
      border-radius: 100px;
      background: #529EEE;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: 500;
      font-size: 16px;
      color: #fff;
    }
  }
}

.imgBox {
  display: flex;
  flex-wrap: wrap;
  white-space: nowrap;
  width: 100%;

  .imgList {
    display: flex;

    .imgDetail {
      display: flex;
      flex-direction: column;
      width: 40px;
      flex-wrap: wrap;
      position: relative;
      justify-content: center;
      align-items: center;
      margin-right: 4px;
      margin-bottom: 4px;

      .name {
        width: 100%;
        font-size: 12px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .del {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}

@mixin thinking-border {
  color: #57606a;
  border-left: 2px solid #989a9f;
  padding-left: 10px
}

@mixin avatar-img {
  width: 40px;
  height: 40px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  // border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin tool {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  background: #fff;
  border-radius: 20px;
  padding: 0 10px;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.3s ease;
  color: black;

  &.active {
    background: #E1EFFF;
    color: #2B7DFF;
  }

  img {
    display: inline-block;
    width: 16px;
    height: 16px;
  }

}

.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.news {
  width: calc(100vw - 30px);
  height: calc(100vh - 40px);
  background-color: #fff;
  border-radius: 15px;
  position: relative;
  display: flex;
  flex-direction: column;
}

.news-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  padding: 20px 20px 0;
  border-radius: 15px 15px 0 0;
  height: 30px;

  .close-btn {
    position: absolute;
    right: 10px;
    top: 8px;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 23px;
    font-weight: bold;
    color: #333;
    transition: all 0.3s ease;
    background-color: #f5f5f5;
    border-radius: 50%;
  }
}

.news-content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-top: 13px;

  .news-card {
    background: #fff;
    border-radius: 15px;
    padding: 10px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 10px;
    border: 1px solid #f7f8fa;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .news-title {
      font-size: 15px;
      font-weight: bold;
      color: #2B7DFF;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }

    .news-content {
      font-size: 13px;
      color: #606266;
      line-height: 1.6;
    }
  }
}

.main {
  margin: 0;
  padding-top: 44px;
  box-sizing: border-box;
  width: 100vw !important;
  height: calc(100vh - 44px);
  background: #E6E9EE;

  &.white-bg {
    background: white;
  }

  .welcome-box {
    background: white;
    padding: 50px;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .welcome-title {
      font-size: 24px;
      font-weight: 600;
      color: #1c64f2;
      text-align: center;
      margin-bottom: 32px;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        display: inline-block;
        width: 50px;
        height: 50px;
        margin-right: 5px;
      }

      span {
        font-weight: bold;
        color: #425192;
      }
    }

    .welcome-content {
      margin-bottom: 40px;

      p {
        font-size: 16px;
        color: #333;
        margin-bottom: 16px;
        text-align: center;
      }

      ul {
        list-style: none;
        padding: 0;

        li {
          font-size: 15px;
          color: #666;
          margin-bottom: 12px;
          position: relative;
          padding-left: 24px;
          line-height: 24px;

          &:before {
            content: "";
            position: absolute;
            left: 0;
            top: 10px;
            width: 6px;
            height: 6px;
            background: #425192;
            border-radius: 50%;
          }
        }
      }
    }

    .welcome-button {
      background: #425192;
      color: white;
      padding: 14px 0;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      text-align: center;
      transition: all 0.3s ease;
      width: 200px;

      &:hover {
        background: #1955cc;
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }


  .Title {
    display: flex;
    position: absolute;

    img {
      width: 32px;
      height: 32px;
      display: inline-block;
    }

  }

  .dialogue::-webkit-scrollbar {
    width: 0 !important;
  }

  .content::-webkit-scrollbar {
    width: 0 !important;
  }

  .message-wrapper::-webkit-scrollbar {
    display: none !important;
  }

  .titleContainer {
    height: 56px;
    color: #354052;
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 8px;

    .titleName {
      flex-grow: 1;
      text-align: center;
    }

    .icon {
      cursor: pointer;
    }
  }

  .dialogue {
    // height: calc(100vh - 90px); /* 回退方案 */
    height: calc(100vh - 44px);
    //background:#F8F8FA;
    background-image: linear-gradient(180deg, rgba(249, 250, 251, 0.9), rgba(242, 244, 247, 0.9) 90.48%);
    //border-top-left-radius: 20px;
    //border-top-right-radius: 20px;
    //padding:24px 16px;
    padding: 16px 12px;
    box-sizing: border-box;

    .content {
      height: calc(var(--vh) * 100 - 90px - 44px);
      overflow-y: auto;
      background-size: cover;
      padding-bottom: 20px;
      position: relative;

      .loading-more {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 2;
        text-align: center;
        padding: 10px 0;
        color: #2B7DFF;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: rgba(248, 248, 250, 0.9);
        backdrop-filter: blur(4px);

        &::before,
        &::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #E5E7EB;
        }
      }

      .message-wrapper {
        min-height: 100%;
        //padding-top: 10px;
      }

      .promptBox {
        //height: 282px;
        width: 100%;
        border-radius: 16px;
        color: #000;
        overflow: hidden;
        background: linear-gradient(180deg, #CAE3FF 0%, #E8F3FF 100%);

        .promptHeader {
          display: flex;
          align-items: center;
          padding: 22px 10px;

          img {
            width: 40px;
            height: 40px;
          }

          .titleName {
            margin-left: 10px;
            white-space: nowrap;

            div {
              font-weight: 500;
              color: #092E5C;
              font-size: 20px;
            }

            p {
              font-size: 14px;
              //font-size: 13px;
            }
          }
        }

        .problemBox {
          width: 100%;
          border-radius: 16px;
          background: #fff;
          height: 100%;

          .problemHeader {
            display: flex;
            justify-content: space-between;

            div:nth-child(1) {
              width: 64px;
              height: 22px;
              background: linear-gradient(93.11deg, #529EEE 4.29%, #31E2F9 124.29%);
              border-radius: 16px 0 16px 0;
              font-size: 12px;
              font-weight: 500;
              color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            div:nth-child(2) {
              margin: 10px 16px 0 0;
              color: #092E5C;
              font-size: 14px;
            }
          }

          .listBox {
            padding: 0 16px;
            box-sizing: border-box;

            .problemList {
              white-space: nowrap;
              border-radius: 60px;
              background: #f0f2f5;
              width: 100%;
              padding: 8px 14px;
              margin: 8px 0;
              font-size: 14px;
              font-weight: 400;
              color: #5E6C83;
            }
          }

        }
      }

      .responseCont {
        &:first-of-type {
          .infoCont {
            padding-top: 0;
          }
        }
      }

      .stopMessage {
        position: fixed;
        bottom: 70px;
        width: 95%;
        text-align: center;
        border-radius: 10px;
        color: #fff;
        display: inline-grid;
        margin-bottom: 5px;

        .stopBtn {
          width: 82px;
          height: 32px;
          background: #fff;
          box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
          border-radius: 20px;
          margin: 0 auto;
          cursor: pointer;
          display: flex;
          justify-content: center;
          font-size: 12px;
          align-items: center;
          color: #0A1629;

          .stopIcon {
            width: 16px;
            height: 16px;
          }
        }
      }

      .responseCont {

        //padding-bottom:14px;
        &:last-child {
          padding-bottom: 14px;
        }

        .infoCont {
          display: flex;
          justify-content: end;
          padding: 30px 0;

          .avatar {
            @include avatar-img;
            margin-left: 16px;
            flex-shrink: 0;
            background: #BBDCFC;
            border-radius: 50%;
            position: relative;
            overflow: hidden;

            img {
              display: inline-block;
              width: 40px;
              height: 40px;
              position: absolute;
              bottom: -7px;
            }
          }

          .textCont {
            //background: #e1effe;
            background: #529EEE4D;
            font-size: 15px;
            //color: #101828;
            color: #000000D9;
            padding: 12px 16px;
            box-sizing: border-box;
            display: inline-block;
            border-radius: 15px;
            white-space: pre-wrap;
            min-height: 48px;
          }
        }

        .chatAnswer {
          display: flex;
          justify-content: start;

          &.mt-30 {
            margin-top: 30px;
          }

          .avatar {
            @include avatar-img;
            margin-right: 16px;
            flex-shrink: 0;
          }

          .chatTxt {
            font-size: 15px;
            background: #fff;
            color: #101828;
            padding: 10px;
            box-sizing: border-box;
            border-radius: 10px;
            // display: flex;
            // align-items: center;
            max-width: calc(100% - 40px);
            // flex-direction: column;
            .webSearch {
              color: #57606a;
              color: #2B7DFF;
              // padding-left: 8px;
              box-sizing: border-box;

              p.title {
                display: flex;
                align-items: center;
                gap: 5px;
              }

              .webSearch-list {
                display: flex;
                flex-wrap: wrap;
                padding-left: 20px;
                box-sizing: border-box;

                span {
                  padding: 2px 8px;
                  border-radius: 20px;
                  font-size: 11px;
                  font-weight: 400;
                  line-height: 20px;
                  letter-spacing: .25px;
                  text-align: left;
                  // background: #e5e7ed;
                  color: #333;
                  border: 1px solid rgba(87, 96, 106, 0.3);
                  cursor: pointer;
                }
              }

              .webSearch-link {
                padding-left: 20px;
                box-sizing: border-box;

                p {
                  a {
                    color: #2B7DFF;
                    text-decoration: none;
                    display: inline-block;
                    height: 20px;
                  }
                }
              }

              div:nth-child(2) {
                margin: 5px 0px;
              }
            }

            .arrow-up {
              display: inline-block;
              width: 6px;
              height: 6px;
              border-left: 1px solid #2B7DFF;
              border-top: 1px solid #2B7DFF;
              transform: rotate(45deg);
              transition: transform 0.3s ease;
              vertical-align: middle;
              position: relative;
              top: -1px;
              margin-right: 3px;

              &.rotate {
                transform: rotate(134deg);
                //   position: relative;
                // top: -2px;
              }
            }

            .borderColor {
              border-left: 1px solid #57606a;
              border-top: 1px solid #57606a;
            }

            .thinking-text {
              @include thinking-border;
            }

            .thinking-content {
              @include thinking-border;
            }

            .question-item {
              p::before {
                content: '';
                display: inline-block;
                /* 确保圆点在文本旁边 */
                width: 5px;
                /* 圆点的宽度 */
                height: 5px;
                /* 圆点的高度 */
                background-color: #fff;
                /* 圆点的颜色 */
                border-radius: 50%;
                /* 圆形 */
                margin-right: 8px;
                /* 圆点与文本之间的间距 */
                vertical-align: middle;
                /* 垂直对齐 */
              }
            }

            div {
              :deep .hljs {
                white-space: normal;
              }
            }

            .loading {
              display: inline-block;
              width: 10px;
              height: 10px;
              margin-left: 10px;
              border: 2px solid #333;
              border-top-color: transparent;
              border-radius: 100%;
              background-color: transparent;
              animation: circle infinite 0.75s linear;
            }

            @keyframes circle {
              0% {
                transform: rotate(0);
              }

              100% {
                transform: rotate(360deg);
              }
            }
          }

          .isLoading,
          .isLoading::before,
          .isLoading::after {
            content: '';
            display: inline-block;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background-color: rgba(102, 112, 133, 0.357);
            animation: pulse 1s infinite ease-in-out;
          }

          .isLoading {
            position: relative;
            animation-delay: 0s;
            margin: 20px 10px;
            background: #fff;
          }

          .isLoading::before {
            position: absolute;
            left: -10px;
            animation-delay: 0.33s;
          }

          .isLoading::after {
            position: absolute;
            right: -10px;
            animation-delay: 0.66s;
          }

          @keyframes pulse {
            0%, 100% {
              background-color: rgba(102, 112, 133, 0.357);
            }
            50% {
              background-color: rgba(102, 112, 133, 0.857);
            }
          }


        }

        .tagBox {
          margin-top: 10px;

          p {
            color: #000000D9;
            font-size: 14px;
            font-weight: 400;
          }

          .tagList {
            display: flex;
            margin-top: 10px;
            overflow: hidden;
            white-space: nowrap;
            flex-wrap: wrap;

            .tagName {
              padding: 10px 14px;
              background: #529EEE;
              border-radius: 100px;
              margin-right: 10px;
              color: #FFFFFFD9;
              font-size: 14px;
              margin-bottom: 10px;
            }

          }
        }

        .recommendBox {
          margin-top: 16px;
          margin-bottom: 25px;
          width: 325px;
          min-height: 322px;
          border-radius: 16px;
          background: url("@/assets/recommendBg.png") no-repeat;
          background-size: 100% 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;

          .titleName {
            color: #FFFFFF;
            font-weight: 500;
            font-size: 17px;
            padding: 16px 20px 0px;
          }

          .detail {
            display: flex;
            background: #FFF;
            flex-direction: column;
            padding: 0 16px 20px;
            border: 2px #fff solid;
            box-sizing: border-box;
            min-height: 236px;
            margin: auto 0 0;
            border-radius: 16px;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) -0.84%, #FFFFFF 109.34%);

            .top {
              display: flex;
              align-items: center;
              flex-direction: column;
              color: #262626;
              font-size: 16px;
              font-weight: 400;
              width: 100%;

              img {
                margin-right: 7px;
              }

              .isHistoryBox {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-content: center;
                font-size: 12px;
                //margin-top: 10px;
                padding-top: 16px;
                width: 100%;

                .inputBox {
                  height: 40px;
                  padding: 0 10px;
                  white-space: nowrap;
                  background: #fff;
                  display: flex;
                  font-size: 14px;
                  align-items: center;
                  margin-bottom: 10px;
                  border-radius: 6px;

                  :deep(.el-input) {
                    .el-input__wrapper {
                      border: none !important;
                      box-shadow: unset !important;
                    }

                    border: none !important;
                    box-shadow: unset !important;
                  }

                  &:nth-last-child(1) {
                    margin-bottom: 0;
                  }
                }

                .btn {
                  display: flex;
                  width: 60px;
                  align-items: center;
                  border-radius: 100px;
                  justify-content: center;
                  color: #fff;
                  font-size: 12px;
                  font-weight: 500;
                  background: #529EEE;
                  padding: 6px 10px;
                  margin: 0 auto;
                }
              }
            }

            .btnBox {
              display: flex;
              width: 100%;
              justify-content: space-between;
              color: #000;
              margin-top: 10px;

              .leftBtn, .rightBtn {
                width: 139px;
                height: 40px;
                border-radius: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #529EEE;
                font-weight: 500;
                font-size: 16px;
                color: #fff;
                cursor: pointer;

                &.rightBtn {
                  background: #fff;
                  border: 1px #529EEE solid;
                  color: #529EEE;
                }
              }
            }
          }
        }
      }

      .box {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: 50px 30px 10px 30px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .probleText {
          font-size: 12px;
          color: #2D2D2D;
          display: flex;
          align-items: center;
          font-weight: 500;

          .Icon {
            width: 14px;
            height: 14px;
            margin-right: 6px;
          }
        }

      }
    }
  }

  .Bottombox {
    width: calc(100vw - 32px);
    height: 52px;
    box-sizing: border-box;
    position: fixed;
    bottom: 15px;
    left: 16px;
    z-index: 10;

    .audioPlaying {
      // display: flex;
      // align-items: center;
      width: 100%;
      height: calc(50px - 16px);
      z-index: 1;
      overflow: hidden;
      border: 2px solid transparent;
      border-radius: 70px;

      background: linear-gradient(white, white) padding-box,
        /* 背景色 */
      linear-gradient(90deg, #2F82FF, #05AFF8) border-box;

    }

    .tip {
      color: #00000073;
      font-size: 9px;
      text-align: center;
      margin: 0px;
      margin-top: 5px;
    }

    .stopMessage {
      position: fixed;
      bottom: 70px;
      width: 95%;
      text-align: center;
      border-radius: 10px;
      color: #fff;
      display: inline-grid;
      margin-bottom: 5px;

      .stopBtn {
        width: 82px;
        height: 32px;
        background: #fff;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
        border-radius: 20px;
        margin: 0 auto;
        cursor: pointer;
        display: flex;
        justify-content: center;
        font-size: 12px;
        align-items: center;
        color: #0A1629;

        .stopIcon {
          width: 16px;
          height: 16px;
        }
      }
    }

    .defaultInputText {
      width: 100%;
      height: 52px;

      .icon {
        display: inline-block;
        width: 24px;
        height: 24px;
      }

      .toolbox {
        display: flex;
        gap: 15px;
        align-items: center;
        margin-top: 5px;

        .deepThinking {
          @include tool;

        }

        .onlineSearch {
          @include tool;
        }

      }

      .sendBtn {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 13px;
        color: #2B7DFF;
        font-weight: 500;

        &.disabled {
          cursor: not-allowed;
        }

        .iconWrapper {
          //background-color: #1c64f2;
          border-radius: 8px;
          margin-right: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.3s ease;
        }

        .sendicon {
          width: 24px;
          height: 24px;
          padding: 0;
          filter: brightness(0) invert(1); /* 使图标变为白色 */
          margin-left: 4px;
        }
      }

      .sendbox {
        width: 100%;
        height: 48px;
        line-height: 48px;
        z-index: 1;
        overflow: hidden;
        border-radius: 70px;
        padding-left: 10px;
        padding-right: 10px;
        box-sizing: border-box;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: (0px 0px #0000, 0 0 #0000), (0px 0px #0000, 0px 0px #0000), 0px 2px 4px -2px rgba(16, 24, 40, .06), 0px 4px 8px -2px rgba(16, 24, 40, .1);
        // padding-bottom: 9px;
        background: url("@/assets/sendBg.png") no-repeat;
        background-size: 100% 100%;

        .sendInput {
          font-size: 15px;
          color: #333;
          font-weight: 400;
          background: transparent !important;

          &:disabled {
            background-color: #f5f5f5;
            cursor: not-allowed;
          }

          &:focus {
            outline: none;
          }

          display: inline-block;
          border: none;
          background: #fff;
          width: 80%;
          box-sizing: border-box;
          overflow: auto;
          word-break: break-word;
        }

        .sendicon {
          width: 24px;
          height: 24px;
          padding-right: 3px;
        }
      }
    }

    .bgbom {
      height: 95px;
    }
  }

}
</style>
