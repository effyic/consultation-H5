import { ref } from 'vue'
import { defineStore } from 'pinia'
import { showToast } from "vant";

export const useWebSocket = defineStore('webSocket', () => {
  const userContext = ref('')
  const ws = ref<any>(null) // WebSocket 实例
  let reconnectTimeout: any = null // 重连超时控制
  const chat_id = ref(0)
  const historyList = ref<any[]>([]) // 问答数组
  const hos_code = ref<any>('1')
  const isReplying = ref(false)
  const step = ref('recommend')

  const connectWebSocket = () => {
    // ws.value = new WebSocket('ws://192.168.0.16:8080/api/chat/ws')
    ws.value = new WebSocket('wss://cyh.effyic.com/api/chat/ws')
    ws.value.onopen = () => {
      console.log('连接建立')
    }
    ws.value.onmessage = (e: any) => {
      const data = JSON.parse(e.data); // 转换为对象
      chat_id.value = data.chat_id
      const last = historyList.value[historyList.value.length - 1];
      if (last.role === 'assistant') {
        historyList.value[historyList.value.length - 1] = data
      } else {
        historyList.value[historyList.value.length - 1].content += data.content
      }
      // 判断是否结束
      if (data.done) {
        historyList.value[historyList.value.length - 1].id = data.id
        historyList.value[historyList.value.length - 2].id = data.user_message_id
      } else {
        if (data.quick_options) {
          historyList.value[historyList.value.length - 1].quick_options = data.quick_options
        }
        if (data.recommended_dept) {
          historyList.value[historyList.value.length - 1].recommended_dept = data.recommended_dept
          historyList.value[historyList.value.length - 1].recommended_doctor = data.recommended_doctor || ''
        }
        isReplying.value = false;
      }
    }
    ws.value.onerror = (error: any) => {
      console.error("WebSocket 发生错误", JSON.parse(error));
    };

    ws.value.onclose = (event: any) => {
      console.log("WebSocket 连接已关闭");
      handleReconnect(); // WebSocket 连接关闭时尝试重连
    }
  }


  const handleReconnect = () => {
    // 如果已经在重连，避免重复重连
    if (reconnectTimeout) {
      return;
    }
    reconnectTimeout = setTimeout(() => {
      console.log("正在尝试重新连接 WebSocket...");
      connectWebSocket();
      reconnectTimeout = null; // 重连后清除重连超时
    }, 5000); // 5 秒后重连
  }

  // 检查 WebSocket 连接状态
  const checkConnectionStatus = () => {
    if (ws.value.readyState === WebSocket.OPEN) {
      // console.log("WebSocket 连接正常");
    } else if (ws.value.readyState === WebSocket.CONNECTING) {
      console.log("WebSocket 正在连接...");
    } else if (ws.value.readyState === WebSocket.CLOSING) {
      console.log("WebSocket 连接正在关闭...");
    } else if (ws.value.readyState === WebSocket.CLOSED) {
      console.log("WebSocket 连接已关闭，准备重连");
      handleReconnect();
    }
  };

  const sendMessage = (context: string) => {
    if (!context) {
      return false
    }
    if (isReplying.value) {
      showToast('请等待当前回答完成')
      return false
    } else {
      let user = {
        type: "chat",
        role: 'user',
        message: context,
        content: context,
        hos_code: hos_code.value,
        chat_id: chat_id.value,
        step: step.value,
        id: 1
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
      type: "chat",
      role: 'user',
      message: '',
      content: '',
      hos_code: hos_code.value,
      chat_id: chat_id.value,
      step: step.value,
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
    finsh
  }
}
)
