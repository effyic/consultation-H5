import { showToast } from 'vant'
import { ref } from 'vue'
import chat from '@/api/chat'

const submitFeedbackRes = ref<number>(-1)

/**
 *
 * @param id 当前的chat-id
 */
function changeHandle(id: number) {
  submitFeedbackRes.value = id
}

/**
 *
 * @param chat_id  聊天的chat_id
 * @param val 反馈类型 1 准确，2 不准确
 * @param text 反馈意见(可选)
 */
async function fetchHandle(chat_id: number, val: number, text?: string) {
  try {
    const params = {
      is_accurate: val,
      content: text || '',
    }
    const res: any = await chat.feedback(chat_id, params)
    if (res?.code === 0) {
      showToast({
        message: res?.data.message,
      })
    }
  }
  catch (e) {
    console.error(e)
  }
}

export {
  changeHandle,
  fetchHandle,
  submitFeedbackRes,
}
