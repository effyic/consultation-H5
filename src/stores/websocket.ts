import { defineStore } from 'pinia'
import { showToast } from 'vant'
import { ref } from 'vue'

export const useWebSocket = defineStore('webSocket', () => {
  const userContext = ref('')
  const ws = ref<any>(null) // WebSocket 实例
  let reconnectTimeout: any = null // 重连超时控制
  const chat_id = ref(0)// 会话id
  const registration_no = ref<any>(null)// 挂号流水号
  const historyList = ref<any[]>([]) // 问答数组·
  const hos_code = ref<string>('1') // 小程序给的院区id（字符串类型）
  const medical_record_no = ref<any>('')// 小程序的就诊人id
  const patId = ref<any>('')
  const cardNo = ref<any>('')
  const isReplying = ref(false)
  const step = ref('recommend')
  const SourceType = ref<any>('wx')

  const connectWebSocket = () => {
    ws.value = new WebSocket('wss://cyh-test.effyic.com/api/chat/ws')

    // const protocol = window.location.protocol === 'https:' ? '' : 'ws:'
    // const wsUrl = `${protocol}//${window.location.host}/api/chat/ws`
    // ws.value = new WebSocket('wss://pre-consultation.bjcyh.mobi/api/chat/ws')

    ws.value.onopen = () => {
      console.log('连接建立')
    }
    ws.value.onmessage = (e: any) => {
      const data = JSON.parse(e.data) // 转换为对象
      if (data.type === 'error') {
        isReplying.value = false
        showToast(data.error)
        historyList.value[historyList.value.length - 1].content = '系统错误'
        return false
      }
      chat_id.value = data.chat_id
      const last = historyList.value[historyList.value.length - 1]

      if (last && last.role === 'assistant') {
        // 更新助手消息内容
        if (data.content) {
          historyList.value[historyList.value.length - 1].content += data.content
        }

        // 更新其他属性，保持现有数据
        if (data.quick_options) {
          historyList.value[historyList.value.length - 1].quick_options = data.quick_options
        }
        if (data.recommended_dept) {
          historyList.value[historyList.value.length - 1].recommended_dept = data.recommended_dept
          historyList.value[historyList.value.length - 1].recommended_doctor = data.recommended_doctor || ''
        }
        if (data.metadata) {
          historyList.value[historyList.value.length - 1].metadata = data.metadata
        }
        if (data.upload_medical_record !== undefined) {
          historyList.value[historyList.value.length - 1].upload_medical_record = data.upload_medical_record
        }
      }

      // 判断是否结束
      if (data.done) {
        if (historyList.value[historyList.value.length - 1]) {
          historyList.value[historyList.value.length - 1].id = data.id
        }
        if (historyList.value[historyList.value.length - 2]) {
          historyList.value[historyList.value.length - 2].id = data.user_message_id
        }
        isReplying.value = false
      }
    }
    ws.value.onerror = (error: any) => {
      console.error('WebSocket 发生错误', JSON.parse(error))
    }

    ws.value.onclose = (event: any) => {
      console.log('WebSocket 连接已关闭')
      handleReconnect() // WebSocket 连接关闭时尝试重连
    }
  }

  const handleReconnect = () => {
    // 如果已经在重连，避免重复重连
    if (reconnectTimeout) {
      return
    }
    reconnectTimeout = setTimeout(() => {
      console.log('正在尝试重新连接 WebSocket...')
      connectWebSocket()
      reconnectTimeout = null // 重连后清除重连超时
    }, 5000) // 5 秒后重连
  }

  // 检查 WebSocket 连接状态
  const checkConnectionStatus = () => {
    if (ws.value.readyState === WebSocket.OPEN) {
      // console.log("WebSocket 连接正常");
    }
    else if (ws.value.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket 正在连接...')
    }
    else if (ws.value.readyState === WebSocket.CLOSING) {
      console.log('WebSocket 连接正在关闭...')
    }
    else if (ws.value.readyState === WebSocket.CLOSED) {
      console.log('WebSocket 连接已关闭，准备重连')
      handleReconnect()
    }
  }

  const sendMessage = (context: string) => {
    if (!context) {
      return false
    }
    if (isReplying.value) {
      showToast('请等待当前回答完成')
      return false
    }
    else {
      let user = {
        type: 'chat',
        role: 'user',
        message: context,
        content: context,
        hos_code: hos_code.value,
        chat_id: chat_id.value,
        step: step.value,
        medical_record_no: medical_record_no.value,
        registration_no: registration_no.value,
        id: 0,
      }
      historyList.value.push(user)
      let assistantData = {
        role: 'assistant',
        content: '',
      }
      historyList.value.push(assistantData)
      ws.value.send(JSON.stringify(user))
      isReplying.value = true
      userContext.value = ''
    }
  }

  const finsh = () => {
    let user = {
      type: 'chat',
      role: 'user',
      message: '',
      content: '',
      hos_code: hos_code.value,
      chat_id: chat_id.value,
      step: step.value,
      medical_record_no: medical_record_no.value,
      registration_no: registration_no.value,
    }
    let assistantData = {
      role: 'assistant',
      content: '',
    }
    historyList.value.push(assistantData)
    ws.value.send(JSON.stringify(user))
  }
  return {
    historyList,
    ws,
    userContext,
    chat_id,
    step,
    connectWebSocket,
    sendMessage,
    checkConnectionStatus,
    finsh,
    patId,
    cardNo,
    hos_code,
    SourceType,
    registration_no,
    medical_record_no,
  }
})
