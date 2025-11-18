<script lang="ts" setup>
import MarkdownIt from 'markdown-it'
import { showToast } from 'vant'
import { nextTick, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import wx from 'weixin-js-sdk'
import chat from '@/api/chat.ts'
import { useWebSocket } from '@/stores/websocket.ts'
import holdSpeak from './components/holdSpeak.vue'
import SubmitFeedback from './components/SubmitFeedback.vue'
import { changeHandle, fetchHandle, submitFeedbackRes } from './hooks/useFeedback'

const router = useRouter()
const route = useRoute()
const webSocket = useWebSocket()
const messageCont = ref<any>(null)
const isDialog = ref(false)
const inputRef = ref<HTMLTextAreaElement | null>(null)
const visualizerRef = ref()
const isVoice = ref(false)
const md = new MarkdownIt({ html: true })

//  聊天信息置底
function toScrollBottom() {
  nextTick(() => {
    const container = messageCont.value
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  })
}

const isCase = ref(false)
const imgList = ref<any>([])
onMounted(() => {
  console.log('window', window.location.href)
  if (inputRef.value) {
    inputRef.value.addEventListener('focus', () => {
      setTimeout(() => {
        toScrollBottom() // 软键盘弹起后滚动到底部
      }, 300) // 延迟可保证软键盘弹起完成
    })
  }
  nextTick(() => {
    const container = messageCont.value
    if (container) {
      container.style.cssText = `
        will-change: transform;
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      `
    }
    // 获取小程序参数（院区编码为字符串）
    webSocket.hos_code = route.query.hos_code ? String(route.query.hos_code) : '11010500'
    webSocket.medical_record_no = route.query.medical_record_no ? String(route.query.medical_record_no) : ''
    webSocket.patId = route.query.pat_id ? String(route.query.pat_id) : ''
    webSocket.cardNo = route.query.card_no ? String(route.query.card_no) : ''
    webSocket.registration_no = route.query.registration_no ? String(route.query.registration_no) : ''
    webSocket.SourceType = route.query.type
    webSocket.connectWebSocket()
    // 每隔 5 秒检查一次 WebSocket 状态
    if (webSocket.registration_no) {
      if (route.query.isCase) {
        chat.medical(webSocket.registration_no).then((res) => {
          imgList.value = res.data
          isCase.value = true
        })
      }
      webSocket.step = 'collect'
      getHistory()
    }
    else {
      webSocket.step = 'recommend'
    }
    setInterval(webSocket.checkConnectionStatus, 5000)
  })
})

const isFirst = ref(true)
function getHistory() {
  chat.history(webSocket.registration_no).then((res) => {
    webSocket.historyList = res.data.chat.messages.filter((item: any) => item.content !== '')
    chat.visitType(webSocket.registration_no).then((res) => {
      isFirst.value = res.data.visit_type == 'first_visit'
    })
    if (JSON.parse(webSocket.historyList[webSocket.historyList.length - 1].metadata).recommended_dept) {
      setTimeout(() => {
        webSocket.finsh()
      }, 3000)
    }
  })
}

watchEffect(() => {
  if (webSocket.historyList[webSocket.historyList.length - 1]?.content) {
    toScrollBottom()
  }
  if (webSocket.historyList[webSocket.historyList.length - 1]) {
    toScrollBottom()
  }
  // 当有推荐科室时，停止语音输入
  if (webSocket.historyList[webSocket.historyList.length - 1]?.recommended_dept) {
    changeHandle(webSocket.historyList[webSocket.historyList.length - 1]?.id)
    isVoice.value = false
    visualizerRef.value?.stop()
    toScrollBottom()
  }
})

function sendTag(item: any, name: string) {
  webSocket.historyList[webSocket.historyList.length - 1].quick_options = ''
  webSocket.sendMessage(name)
}

onUnmounted(() => {
  if (webSocket.ws) {
    webSocket.ws.close() // 组件销毁时关闭 WebSocket 连接
  }
})

function onTranscript(text: string) {
  webSocket.sendMessage(text)
  nextTick(() => {
    getHeight()
  })
}

const isRecording = ref(false)

const holdSpeakRef = ref()
async function startRecord() {
  navigator.vibrate?.(200)
  isRecording.value = true
  holdSpeakRef.value?.startRecording()
}

function stopRecord() {
  isRecording.value = false
  holdSpeakRef.value?.stopRecordingAndUpload()
}

const holdSpeakStart = ref(false)

function withdraw(id: number) {
  chat.deleteMessages({ message_ids: [id, id + 1] }).then((res) => {
    webSocket.historyList = webSocket.historyList.filter(item => item.id !== id && item.id !== id + 1)
  })
}

function getHeight() {
  const target = document.getElementById('input') as HTMLTextAreaElement
  target.style.height = 'auto'
  if (target.value) {
    target.style.height = `${target.scrollHeight}px`
  }
}

function handleGoWX(dept: any) {
  // 从推荐科室对象与全局会话中提取参数
  const deptCode = dept.code
  const chatCode = webSocket.chat_id
  const courtyardCode = webSocket.hos_code
  const patId = webSocket.patId
  const cardNo = webSocket.cardNo
  const url = `/book-offline/doc-list/index?deptCode=${String(deptCode)}`
    + `&chatCode=${String(chatCode)}`
    + `&courtyardCode=${String(courtyardCode)}`
    + `&patId=${String(patId)}`
    + `&cardNo=${String(cardNo)}`

  console.log('url', url)

  // 优先在微信小程序 WebView 环境内跳转
  if (wx.miniProgram?.redirectTo) {
    wx.miniProgram.redirectTo({ url })
  }
  else {
    // 非小程序环境的兜底处理
    console.warn('未检测到微信小程序环境，无法跳转。目标URL:', url)
    alert('请在微信小程序中跳转')
  }
}

function callbackHandle(val: number, text: string, type: boolean) {
  nextTick(() => {
    toScrollBottom()
  })

  if (val === 1) {
    fetchHandle(webSocket.chat_id, val)
  }
  else {
    if (type)
      return
    fetchHandle(webSocket.chat_id, val, text)
  }

  changeHandle(-1)
}
</script>

<template>
  <!-- <recordAudio @transcript="onTranscript" style="margin-top: 50px;"></recordAudio> -->
  <div class="holdSpeak" :style="`z-index:${isRecording ? 999 : -1}`">
    <holdSpeak ref="holdSpeakRef" @transcript="onTranscript" />
  </div>
  <div class="headerTab">
    <div>智能分诊</div>
  </div>
  <div ref="main" class="main">
    <div class="dialogue">
      <div v-if="isCase" class="cases" @click="isDialog = true">
        <img src="@/assets/cases1.png" alt="">
        已传病例
        <img class="caseImg" src="@/assets/cases2.png" alt="">
      </div>
      <div ref="messageCont" class="content">
        <div class="message-wrapper">
          <img class="chatTop" src="@/assets/chatTop.png" alt="">
          <div class="responseCont" style="margin-top: 20px">
            <div class="chatAnswer">
              <div class="chatTxt" style="max-width: 100%;">
                <div style="color: #2386FF;margin-bottom: 20px;">
                  您好，欢迎来到智能分诊服务～
                </div>
                <div style="margin-bottom: 20px;">
                  为了更高效地帮您办理就诊事宜，想先问一下：您本次就诊是【初诊】还是【复诊】呢？
                </div>
                <p>如果是【初诊】，我会先帮您分析您的病情信息，以便更精准地推荐就诊科室；</p>
                <p>如果是【复诊】，您可以直接告诉我想挂号的科室，我会马上为您查询号源～</p>
              </div>
            </div>
          </div>

          <div v-for="(item, i) in webSocket.historyList" :key="i" class="responseCont">
            <!-- 用户消息 -->
            <div v-if="item.role == 'user'" ref="msgRefs" class="infoCont">
              <img class="withdraw" src="@/assets/icon/withdraw.png" alt="" @click="withdraw(item.id)">
              <div class="textCont">
                <div>{{ item.content }}</div>
              </div>
            </div>
            <!-- AI助手消息 -->
            <div
              v-else :class="{ 'mt-30': i > 0 && webSocket.historyList[i - 1].type === 'chat_stream' }"
              class="chatAnswer"
            >
              <div :class="item.content === '' ? 'isLoading' : 'chatTxt'">
                <div>
                  <span v-html="md.render(item.content)" />
                  <span
                    v-if="(item.metadata ? JSON.parse(item.metadata)?.upload_medical_record : false) || item.upload_medical_record"
                    style="color: #2386FF;" @click="router.push({
                      path: '/caseMaterial',
                      query: {
                        hos_code: webSocket.hos_code,
                        medical_record_no: webSocket.medical_record_no,
                        pat_id: webSocket.patId,
                        card_no: webSocket.cardNo,
                        type: webSocket.SourceType,
                        registration_no: webSocket.registration_no,
                      },
                    })"
                  >
                    【上传】
                  </span>
                </div>
              </div>
            </div>
            <div v-if="item.role !== 'user'">
              <div
                v-if="item.quick_options?.length > 0 && item.recommended_dept?.length == 0" class="tagBox"
                style="color:#000"
              >
                <div class="tagList">
                  <div v-for="name in item.quick_options" :key="name" class="tagName" @click="sendTag(item, name)">
                    {{ name }}
                  </div>
                </div>
              </div>
              <div v-if="item.recommended_dept" class="recommendBox">
                <div style="font-size: 14px;color: #333333;">
                  <span style="color: #666666;margin-right: 4px;">推荐至</span>
                  {{ item.recommended_dept?.parent?.name || '' }} {{ item.recommended_dept?.name || '' }}
                </div>
                <div class="recommendContainer">
                  <div class="department">
                    科室介绍
                    <img src="@/assets/departmentIcon.png" alt="">
                  </div>
                  <div class="item">
                    <div class="itemTitle">
                      <img src="@/assets/recommendIcon.png">
                      {{ item.recommended_dept?.name || '' }} {{ item.recommended_doctor || '' }}
                    </div>
                    <div class="itemContent">
                      <div class="info">
                        {{ item.recommended_dept?.desc || '' }}
                      </div>
                      <div class="btn" @click="handleGoWX(item.recommended_dept)">
                        去挂号
                      </div>
                    </div>
                  </div>
                  <!-- <div class="msg">
                    没有符合的科室，选择<span @click="backPrev">其他科室</span>
                  </div> -->
                </div>
                <!-- 推荐反馈提交 -->
                <SubmitFeedback
                  v-if="submitFeedbackRes === item.id" :callback="callbackHandle"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="AIcheck">
        AI智能分诊推荐的科室仅供参考、具体诊疗及科室选择建议以线下医院医生的专业判断为准
      </div>
      <div class="Bottombox">
        <div class="defaultInputText">
          <div class="sendbox">
            <img
              v-if="!isVoice" alt="" src="@/assets/voiceStart.png"
              @click="holdSpeakStart ? '' : holdSpeakRef?.start(); holdSpeakStart = true; isVoice = true"
            >
            <div v-if="isVoice" style="display: flex;align-items: center;" @click="isVoice = false">
              <img alt="" src="@/assets/keyboard.png">
            </div>
            <textarea
              v-show="!isVoice" id="input" ref="inputRef" v-model.trim="webSocket.userContext" rows="1"
              style="overflow: hidden" class="sendInput" placeholder="请描述病情、症状、持续时长"
              @keydown.enter.prevent=" onTranscript(webSocket.userContext)" @input="getHeight()"
            />
            <div v-if="!isVoice" class="sendBtn" @click="onTranscript(webSocket.userContext)">
              发送
            </div>
            <button
              v-show="isVoice" class="record" :class="{ active: isRecording }" @touchstart.prevent="startRecord"
              @touchend.prevent="stopRecord"
            >
              按住说话
            </button>
          </div>
        </div>
      </div>
    </div>
    <el-dialog v-model="isDialog">
      <div class="imgList">
        <img v-for="(item, index) in imgList" :key="index" :src="item.file_url" alt="">
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.holdSpeak {
  position: fixed;
  width: 100%;
  top: 50%;
  padding: 0 50px;
  z-index: 999;
}

.cases {
  position: fixed;
  z-index: 9;
  top: 44px;
  left: 0;
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  background: #ffffff;
  font-size: 14px;
  color: #333333;
  padding: 0 8px;

  img {
    margin: 0 8px;
    width: 24px;
  }

  .caseImg {
    width: 16px;
  }
}

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

.imgList {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;

  img {
    width: 100%;
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
  box-sizing: border-box;
  width: 100vw !important;
  height: 100vh;
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
    height: 100%;
    //background:#F8F8FA;
    background-image: linear-gradient(180deg, rgba(249, 250, 251, 0.9), rgba(242, 244, 247, 0.9) 90.48%);
    //border-top-left-radius: 20px;
    //border-top-right-radius: 20px;
    //padding:24px 16px;
    padding: 16px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    .content {
      flex: 1;
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
        padding-top: 50px;
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

      .chatTop {
        margin-top: 10;
        width: 100%;
      }

      .responseCont {
        &:first-of-type {
          .infoCont {
            padding-top: 0;
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
          align-items: center;
          padding: 30px 0 0;

          .withdraw {
            width: 28px;
            margin-right: 20px;
          }

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
            word-break: break-all;
            background: #529EEE4D;
            max-width: calc(100% - 80px);
            font-size: 15px;
            //color: #101828;
            color: #000000D9;
            padding: 12px 16px;
            box-sizing: border-box;
            display: inline-block;
            border-radius: 15px;
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
            margin-top: 30px;
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

            0%,
            100% {
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
          width: 100%;
          margin: 15px 0;

          .recommendContainer {
            margin-top: 8px;
            width: 100%;
            background: #E3EFFF;
            border-radius: 8px;
            padding: 10px;

            .department {
              width: 100%;
              display: flex;
              align-items: center;
              font-size: 16px;
              color: #333333;
              font-weight: bold;
              margin-bottom: 10px;

              img {
                width: 24px;
                margin-right: 4px;
              }
            }

            .item {
              width: 100%;
              background: #ffffff;
              padding: 10px;
              border-radius: 6px;

              .itemTitle {
                width: 100%;
                display: flex;
                align-items: center;
                font-size: 14px;
                color: #333;
                margin-bottom: 7px;

                img {
                  width: 20px;
                  margin-right: 4px;
                }
              }

              .itemContent {
                width: 100%;
                display: flex;
                justify-content: space-between;

                .info {
                  flex: 1;
                  color: #999999;
                  font-size: 11px;
                }

                .btn {
                  margin-left: 16px;
                  width: 66px;
                  height: 24px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: #2386FF;
                  font-size: 14px;
                  color: #FFFFFF;
                  border-radius: 20px;
                }
              }
            }

            .msg {
              margin-top: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 13px;
              color: #999999;

              span {
                color: #2386FF;
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

  .AIcheck {
    font-size: 8px;
    padding-top: 8px;
    text-align: center;
    margin: auto;
  }

  .Bottombox {
    width: calc(100vw - 32px);
    padding-top: 8px;
    box-sizing: border-box;

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

    .defaultInputText {
      width: 100%;

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
        width: 88px;
        height: 32px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 14px;
        color: #fff;
        background: #2B7DFF;
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
          filter: brightness(0) invert(1);
          /* 使图标变为白色 */
          margin-left: 4px;
        }
      }

      .record {
        width: 100%;
        height: 32px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 13px;
        color: #fff;
        background: #2B7DFF;
        font-weight: 500;
        border: none;

        &.active {
          background: #1c64f2;
        }
      }

      .sendbox {
        width: 100%;
        min-height: 48px;
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
        // background: url("@/assets/sendBg.png") no-repeat;
        background-size: 100% 100%;
        border: 2px solid #62ace9;

        img {
          width: 24px;
          margin-right: 8px;
        }

        .sendInput {
          font-size: 12px;
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
