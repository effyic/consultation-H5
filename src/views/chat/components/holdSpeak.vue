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
let analyser: any = null
let dataArray: Uint8Array | null = null
let animationId: number | null = null
let resizeObserver: ResizeObserver | null = null
let mediaRecorder: MediaRecorder | null = null
let recordedChunks: BlobPart[] = []
let isRecording = false

// 音频处理相关
let gainNode: GainNode | null = null
let compressorNode: DynamicsCompressorNode | null = null
let highpassFilter: BiquadFilterNode | null = null
let lowpassFilter: BiquadFilterNode | null = null

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

// =============== 音频降噪和增强处理 ===============
const createAudioProcessingChain = (audioContext: AudioContext, source: MediaStreamAudioSourceNode) => {
  // 1. 高通滤波器 - 去除低频噪音（如空调、风扇等）
  highpassFilter = audioContext.createBiquadFilter()
  highpassFilter.type = 'highpass'
  highpassFilter.frequency.setValueAtTime(80, audioContext.currentTime)  // 80Hz以下的频率被过滤
  highpassFilter.Q.setValueAtTime(0.7, audioContext.currentTime)

  // 2. 低通滤波器 - 去除高频噪音
  lowpassFilter = audioContext.createBiquadFilter()
  lowpassFilter.type = 'lowpass'
  lowpassFilter.frequency.setValueAtTime(8000, audioContext.currentTime)  // 8kHz以上的频率被过滤
  lowpassFilter.Q.setValueAtTime(0.7, audioContext.currentTime)

  // 3. 带通滤波器 - 专门针对人声频率范围（300Hz-3400Hz）
  const bandpassFilter = audioContext.createBiquadFilter()
  bandpassFilter.type = 'bandpass'
  bandpassFilter.frequency.setValueAtTime(1850, audioContext.currentTime)  // 中心频率
  bandpassFilter.Q.setValueAtTime(1.0, audioContext.currentTime)  // 较宽的带宽

  // 4. 动态压缩器 - 平衡音量，突出语音
  compressorNode = audioContext.createDynamicsCompressor()
  compressorNode.threshold.setValueAtTime(-24, audioContext.currentTime)    // 阈值
  compressorNode.knee.setValueAtTime(30, audioContext.currentTime)          // 膝点
  compressorNode.ratio.setValueAtTime(12, audioContext.currentTime)         // 压缩比
  compressorNode.attack.setValueAtTime(0.003, audioContext.currentTime)     // 攻击时间
  compressorNode.release.setValueAtTime(0.25, audioContext.currentTime)     // 释放时间

  // 5. 增益节点 - 语音增强
  gainNode = audioContext.createGain()
  gainNode.gain.setValueAtTime(2.0, audioContext.currentTime)  // 增加增益

  // 6. 噪声门限 - 静音时自动降噪
  const noiseGate = audioContext.createGain()

  // 连接音频处理链
  source.connect(highpassFilter)
  highpassFilter.connect(lowpassFilter)
  lowpassFilter.connect(bandpassFilter)
  bandpassFilter.connect(compressorNode)
  compressorNode.connect(gainNode)
  gainNode.connect(noiseGate)

  // 连接到分析器用于可视化
  noiseGate.connect(analyser)

  // 实现简单的噪声门限逻辑
  let silenceTimer = 0
  const checkAudioLevel = () => {
    if (analyser && dataArray && gainNode) {
      analyser.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length

      // 如果音量过低，逐渐降低增益
      if (average < 10) {
        silenceTimer++
        if (silenceTimer > 10) {  // 连续静音一段时间后降低增益
          const currentGain = Math.max(0.1, gainNode.gain.value * 0.95)
          gainNode.gain.setValueAtTime(currentGain, audioContext.currentTime)
        }
      } else {
        silenceTimer = 0
        // 有声音时恢复正常增益
        gainNode.gain.setValueAtTime(2.0, audioContext.currentTime)
      }
    }

    if (audioContext && audioContext.state === 'running') {
      setTimeout(checkAudioLevel, 100)  // 每100ms检查一次
    }
  }

  // 启动音频级别检查
  setTimeout(checkAudioLevel, 100)

  return noiseGate
}
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
    // 优化音频约束，提高语音识别质量
    const constraints = {
      audio: {
        echoCancellation: true,        // 回声消除
        noiseSuppression: true,        // 噪音抑制
        autoGainControl: true,         // 自动增益控制
        sampleRate: 16000,             // 采样率16kHz，适合语音识别
        channelCount: 1,               // 单声道
        volume: 1.0                    // 音量
      }
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    audioContext = new AudioContext({ sampleRate: 16000 })
    const source = audioContext.createMediaStreamSource(stream)

    analyser = audioContext.createAnalyser()
    analyser.fftSize = 128
    analyser.smoothingTimeConstant = 0.8  // 增加平滑度

    const bufferLength = analyser.frequencyBinCount
    dataArray = new Uint8Array(bufferLength)

    // 使用音频处理链进行降噪和增强
    const processedOutput = createAudioProcessingChain(audioContext, source)

    draw()

    // 为录音创建一个新的音频流，包含处理后的音频
    const destination = audioContext.createMediaStreamDestination()
    processedOutput.connect(destination)
    const processedStream = destination.stream

    let options
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      options = { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 16000 }
    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
      options = { mimeType: 'audio/webm', audioBitsPerSecond: 16000 }
    } else if (MediaRecorder.isTypeSupported('audio/wav')) {
      options = { mimeType: 'audio/wav' }
    } else {
      throw new Error('当前设备不支持录音')
    }

    // 使用处理后的音频流进行录音
    mediaRecorder = new MediaRecorder(processedStream, options)

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

  // 清理音频处理节点
  if (gainNode) {
    gainNode.disconnect()
    gainNode = null
  }
  if (compressorNode) {
    compressorNode.disconnect()
    compressorNode = null
  }
  if (highpassFilter) {
    highpassFilter.disconnect()
    highpassFilter = null
  }
  if (lowpassFilter) {
    lowpassFilter.disconnect()
    lowpassFilter = null
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
