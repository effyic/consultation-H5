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

    //语音转文字 AsrText
    transcriptions(data: any) {
        return apiClient.post("AsrText", data, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            Accept: "application/json",
        },
        });
    }
}

export default new ChatApi()
