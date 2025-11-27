import { ref } from 'vue'
import { useWebSocket } from '@/stores/websocket.ts'

const webSocket = useWebSocket()

const isShowTypeBtn = ref<boolean>(webSocket.historyList.length === 0)

function changeTriageHandle(bool: boolean) {
  isShowTypeBtn.value = bool
}

export {
  changeTriageHandle,
  isShowTypeBtn,
}
