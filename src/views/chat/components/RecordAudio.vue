<script lang="ts" setup>
import { defineEmits, ref } from 'vue'
import ChatService from '@/api/chat'

const emit = defineEmits(['transcript'])

const isRecording = ref(false)
let mediaRecorder: MediaRecorder | null = null
let audioChunks: BlobPart[] = []

// 开始录音
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)

    audioChunks = []
    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.start()
    isRecording.value = true
    console.log('🎙 开始录音...')
  }
  catch (err) {
    console.error('录音失败:', err)
    alert('无法获取麦克风权限')
  }
}

// 停止录音并上传
async function stopRecording() {
  if (!mediaRecorder)
    return

  mediaRecorder.stop()
  isRecording.value = false

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
    const file = new File([audioBlob], 'record.webm', { type: 'audio/webm' })

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response: any = await ChatService.transcriptions(formData)
      emit('transcript', response.asr_text || '')
    }
    catch (err) {
      console.error('上传失败:', err)
    }
  }
}
</script>

<template>
  <div class="record-audio">
    <img v-if="!isRecording" alt="" src="@/assets/voiceStart.png" @click="startRecording">
    <img v-if="isRecording" alt="" src="@/assets/voiceStop.png" @click="stopRecording">
  </div>
</template>

<style scoped>
.record-audio {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #c5dcf5;
  border-radius: 50%;
  position: fixed;
  top: 170px;
  left: 10px;
  z-index: 99;
}
</style>
