import apiClient from '@/utils/request'

class ChatApi {
  // 获取问题
  questions() {
    return apiClient.get('faq/common-questions')
  }

  // 历史记录
  history(id: any) {
    return apiClient.get(`chat/h5/${id}/history`)
  }

  // 就诊类型
  visitType(id: any) {
    return apiClient.get(`chat/h5/${id}/visit_type`)
  }

  // 上传病例
  upload(id: any, data: any) {
    return apiClient.postForm(`chat/h5/${id}/upload`, data)
  }

  // 获取上传病例资料
  medical(id: any) {
    return apiClient.get(`chat/h5/${id}/medical`)
  }

  // 删除回话记录
  deleteMessages(data: any) {
    return apiClient.delete(`chat/messages`, { data })
  }

  // 语音转文字 AsrText
  transcriptions(data: any) {
    return apiClient.post('AsrText', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Accept': 'application/json',
      },
    })
  }

  /**
   *
   * @param id 聊天ID
   * @param data  // {"is_accurate": 1,"content": ""}
   * @returns
   */
  feedback(id: number, data: {
    is_accurate: number
    content: string | ''
  }) {
    return apiClient.post(`chat/${id}/feedback`, data)
  }
}

export default new ChatApi()
