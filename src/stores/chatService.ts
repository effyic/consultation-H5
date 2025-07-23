import {ref} from 'vue'
import {defineStore} from 'pinia'
import chat from "@/api/chat.ts";

export const useChat = defineStore('chat', () => {
    const questionList = ref<any>([])

    function questions() {
        chat.questions().then(res => {
            questionList.value = res.data.questions
        })
    }

    return { questionList, questions,}
})
