import { ref } from 'vue'

const isShowTypeBtn = ref<boolean>(true)

function changeTriageHandle(bool: boolean) {
    isShowTypeBtn.value = bool
}

export {
    changeTriageHandle,
    isShowTypeBtn,
}
