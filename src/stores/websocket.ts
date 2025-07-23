import {ref} from 'vue'
import {defineStore} from 'pinia'

export const useWebSocket = defineStore('webSocket', () => {
        const userContext = ref('')
        const historyList: any = ref<Array<any>>([]) // 问答数组
        const messageCont = ref<any>(null)
        let ws: any = null // WebSocket 实例
        let reconnectTimeout: any = null // 重连超时控制
        const chat_id = ref(0)

        const connectWebSocket = () => {
            ws = new WebSocket('ws://192.168.0.160:8080/api/chat/ws')

            ws.onopen = () => {
                console.log('连接建立')
            }

            ws.onmessage = (e:any) => {
                const data = JSON.parse(e.data); // 转换为对象
                console.log(data);       // 现在才能访问 content
                historyList.value = data;
                chat_id.value = data.chat_id
            }
            ws.onerror = (error:any) => {
                console.error("WebSocket 发生错误", error);
            };

            ws.onclose = (event:any) => {
                console.log("WebSocket 连接已关闭", event.code);
                handleReconnect(); // WebSocket 连接关闭时尝试重连
            }
        }


        // 处理 WebSocket 连接断开后的重连
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
            if (ws.readyState === WebSocket.OPEN) {
                // console.log("WebSocket 连接正常");
            } else if (ws.readyState === WebSocket.CONNECTING) {
                console.log("WebSocket 正在连接...");
            } else if (ws.readyState === WebSocket.CLOSING) {
                console.log("WebSocket 连接正在关闭...");
            } else if (ws.readyState === WebSocket.CLOSED) {
                console.log("WebSocket 连接已关闭，准备重连");
                handleReconnect();
            }
        };

        const sendMessage = (context:string) => {
            if (!context) {
                return false
            }
            let data = {
                type: "chat",
                role:'user',
                message: context,
                hospital_id: 1,
                chat_id: chat_id.value,
            }
            console.log('????',data)
            historyList.value.push(data)
            ws.send(JSON.stringify(data))
            userContext.value = ''
        }
        return {
            historyList,
            ws,
            userContext,
            connectWebSocket,
            sendMessage,
            checkConnectionStatus
        }
    }
)
