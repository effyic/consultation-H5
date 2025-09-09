<template>
  <div class="voice-visualizer" ref="containerRef">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, nextTick, defineExpose, defineEmits } from 'vue'
import ChatService from '@/api/chat'

const emit = defineEmits(['transcript'])

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let dataArray: Uint8Array | null = null
let animationId: number | null = null
let resizeObserver: ResizeObserver | null = null
let mediaRecorder: MediaRecorder | null = null
let recordedChunks: BlobPart[] = []
let isRecording = false

const SMOOTHNESS = 0.1
let heights: number[] = []
let lastVolume = 0

// =============== UI 相关 ===============
const updateCanvasSize = () => {
  const canvas = canvasRef.value!
  const container = containerRef.value!
  const dpr = window.devicePixelRatio || 1

  const width = container.clientWidth
  const height = container.clientHeight

  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'

  const ctx = canvas.getContext('2d')!
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.scale(dpr, dpr)

  const barWidth = 4
  const gap = 2
  const totalBars = Math.floor(width / (barWidth + gap))

  if (heights.length !== totalBars) {
    heights = new Array(totalBars).fill(0)
  }
}

const initResizeObserver = () => {
  resizeObserver = new ResizeObserver(() => {
    updateCanvasSize()
  })
  resizeObserver.observe(containerRef.value!)
}

// =============== 上传转写 ===============
const uploadAudioAndGetTranscript = async (blob: Blob) => {
  const formData = new FormData()
  const extension = blob.type.includes('webm') ? 'webm' : 'wav'
  formData.append('file', blob, `recording.${extension}`)

  const response: any = await ChatService.transcriptions(formData)
  return response.asr_text || ''
}

// =============== 录音相关 ===============
const startRecording = () => {
  recordedChunks = []
  mediaRecorder?.start()
  isRecording = true
  console.log('开始录音')
}

const stopRecordingAndUpload = async () => {
  if (!isRecording) return
  isRecording = false
  mediaRecorder?.stop() // 会触发 onstop
}

// =============== 绘制音量柱 ===============
const draw = () => {
  animationId = requestAnimationFrame(draw)
  if (!analyser || !dataArray) return

  analyser.getByteTimeDomainData(dataArray)
  const volume =
    dataArray.reduce((sum, val) => sum + Math.abs(val - 128), 0) /
    dataArray.length

  const smoothVolume = lastVolume + (volume - lastVolume) * SMOOTHNESS
  lastVolume = smoothVolume

  const canvas = canvasRef.value!
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio || 1
  const width = canvas.width / dpr
  const height = canvas.height / dpr

  const barWidth = 4
  const gap = 2
  const totalBars = heights.length

  const newHeight = (smoothVolume / 128) * height * 2

  heights.pop()
  heights.unshift(newHeight)

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < totalBars; i++) {
    const h = heights[i]
    const x = width - (i + 1) * (barWidth + gap)
    const y = (height - h) / 2

    ctx.fillStyle = 'black'
    ctx.fillRect(x, y, barWidth, h)
  }
}

// =============== 初始化音频流 ===============
const start = async () => {
  await nextTick()
  updateCanvasSize()
  initResizeObserver()

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    audioContext = new AudioContext()
    const source = audioContext.createMediaStreamSource(stream)

    analyser = audioContext.createAnalyser()
    analyser.fftSize = 128

    const bufferLength = analyser.frequencyBinCount
    dataArray = new Uint8Array(bufferLength)

    source.connect(analyser)
    draw()

    let options
    if (MediaRecorder.isTypeSupported('audio/webm')) {
      options = { mimeType: 'audio/webm' }
    } else if (MediaRecorder.isTypeSupported('audio/wav')) {
      options = { mimeType: 'audio/wav' }
    } else {
      throw new Error('当前设备不支持录音')
    }

    mediaRecorder = new MediaRecorder(stream, options)

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) recordedChunks.push(e.data)
    }

    mediaRecorder.onstop = async () => {
      if (recordedChunks.length === 0) {
        console.log('无录音数据')
        return
      }
      const audioBlob = new Blob(recordedChunks, { type: options.mimeType })
      try {
        const text = await uploadAudioAndGetTranscript(audioBlob)
        emit('transcript', text)
      } catch (err) {
        console.error('转写失败:', err)
        emit('transcript', '')
      }
    }
  } catch (e) {
    console.error('获取麦克风失败:', e)
    emit('transcript', '')
  }
}

const stop = () => {
  if (animationId) cancelAnimationFrame(animationId)
  animationId = null

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }

  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
  analyser = null
  dataArray = null

  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  const canvas = canvasRef.value
  if (canvas) {
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}

defineExpose({
  start,
  stop,
  startRecording,
  stopRecordingAndUpload,
})
onBeforeUnmount(() => {
  stop()
})
</script>

<style scoped>
.voice-visualizer {
  width: 100%;
  height: 80px;
  background: rgba(90, 185, 61, 1);
  border-radius: 20px;
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  width: 50px;
  height: 100%;
  background: transparent;
  display: block;
}
</style>
