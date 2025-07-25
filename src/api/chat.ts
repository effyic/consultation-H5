import apiClient from '@/utils/request'

class ChatApi {
    // 获取问题
    questions() {
        return apiClient.get('faq/common-questions')
    }

    //挂号信息
    summary(id: number) {
        return apiClient.get(`chat/${id}/summary`)
    }
}

export default new ChatApi()
