import apiClient from '@/utils/request'

class ChatApi {
  // 获取问题
  questions() {
    return apiClient.get('faq/common-questions')
  }

}

export default new ChatApi()
