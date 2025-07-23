import apiClient from '@/utils/request'

class ChatApi {
  // 获取会话
  getConversations(consultation_id: string) {
    return apiClient.post('conversations', {consultation_id})
  }
  // 问答历史
  messages(params: {
    conversation_external_id: string
    page?: number
    limit?: number
  }) {
    return apiClient.get('messages', { params })
  }
}

export default new ChatApi()
