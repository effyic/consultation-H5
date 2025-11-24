import { ref } from 'vue'

const isShowTypeBtn = ref<boolean>(true)

function changeHandle(bool: boolean) {
    isShowTypeBtn.value = bool
}

export {
    changeHandle,
    isShowTypeBtn,
}
