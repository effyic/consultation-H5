<template>
    <div class="voice-visualizer" ref="containerRef">
      <canvas ref="canvasRef"></canvas>
    </div>
  </template>
  
  <script setup>
  import { ref, onBeforeUnmount, nextTick, defineExpose, defineEmits } from 'vue';
  import ChatService from '@/api/chat'
  
  const emit = defineEmits(['transcript']);
  
  const canvasRef = ref(null);
  const containerRef = ref(null);
  
  let audioContext = null;
  let analyser = null;
  let dataArray = null;
  let animationId = null;
  let resizeObserver = null;
  let mediaRecorder = null;
  let recordedChunks = [];
  
  const SMOOTHNESS = 0.1;
  let heights = [];
  
  const VOLUME_THRESHOLD = 5; // 声音阈值:当音量超过5时，开始录音
  const SILENCE_DELAY = 2000; // 当音量低于阈值持续 2 秒，停止录音
  
  let lastVolume = 0;
  let isRecording = false;
  let silenceTimeout = null;
  
  const autoSendEnabled = ref(true); // 是否自动收录用户说话
  
  const updateCanvasSize = () => {
    const canvas = canvasRef.value;
    const container = containerRef.value;
    const dpr = window.devicePixelRatio || 1;
  
    const width = container.clientWidth;
    const height = container.clientHeight;
  
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
  
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  
    const barWidth = 4;
    const gap = 2;
    const totalBars = Math.floor(width / (barWidth + gap));
  
    if (heights.length !== totalBars) {
      heights = new Array(totalBars).fill(0);
    }
  };
  
  const initResizeObserver = () => {
    resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(containerRef.value);
  };
  
  const uploadAudioAndGetTranscript = async (blob) => {
    const formData = new FormData();
    // 根据实际的音频格式设置文件扩展名
    const extension = blob.type.includes('webm') ? 'webm' : 'wav';
    formData.append('file', blob, `recording.${extension}`);

    const response = await ChatService.transcriptions(formData);
    console.log(response);

    return response.asr_text || '';
  };
  
  const startRecording = () => {
    if (!autoSendEnabled.value) return;
  
    recordedChunks = [];
    mediaRecorder.start();
    isRecording = true;
    console.log('开始录音');
  };
  
  const stopRecordingAndUpload = async () => {
    if (!isRecording) return;
  
    isRecording = false;
    silenceTimeout = null;
  
    mediaRecorder.stop(); // 会触发 onstop
  };
  
  const draw = () => {
    animationId = requestAnimationFrame(draw);
  
    if (!analyser || !dataArray) return;
  
    analyser.getByteTimeDomainData(dataArray);
  
    const volume =
      dataArray.reduce((sum, val) => sum + Math.abs(val - 128), 0) / dataArray.length;
  
    const smoothVolume = lastVolume + (volume - lastVolume) * SMOOTHNESS;
    lastVolume = smoothVolume;
  
    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');
  
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
  
    const barWidth = 4;
    const gap = 2;
    const totalBars = heights.length;
  
    const newHeight = (smoothVolume / 128) * height * 0.8;
  
    heights.pop();
    heights.unshift(newHeight);
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    for (let i = 0; i < totalBars; i++) {
      const h = heights[i];
      const x = width - (i + 1) * (barWidth + gap);
      const y = (height - h) / 2;
  
      ctx.fillStyle = 'black';
      ctx.fillRect(x, y, barWidth, h);
    }
  
    // 说话检测逻辑
    if (smoothVolume > VOLUME_THRESHOLD) {
      if (autoSendEnabled.value && !isRecording) {
        startRecording();
      }
  
      if (silenceTimeout) {
        clearTimeout(silenceTimeout);
        silenceTimeout = null;
      }
    } else {
      if (autoSendEnabled.value && isRecording && !silenceTimeout) {
        silenceTimeout = setTimeout(() => {
          stopRecordingAndUpload();
        }, SILENCE_DELAY);
      }
    }
  };
  
  const start = async () => {
    await nextTick();
    updateCanvasSize();
    initResizeObserver();
  
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
      audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
  
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
  
      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
  
      source.connect(analyser);
  
      draw();
  
      let options;
      // 优先使用 webm
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } 
      // 不支持 webm 的设备使用 wav
      else if (MediaRecorder.isTypeSupported('audio/wav')) {
        options = { mimeType: 'audio/wav' };
      }
      // 都不支持则抛出错误
      else {
        throw new Error('当前设备不支持录音');
      }

      mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        if (recordedChunks.length === 0) {
          console.log('无录音数据');
          return;
        }

        const audioBlob = new Blob(recordedChunks, { type: options.mimeType });

        try {
          const text = await uploadAudioAndGetTranscript(audioBlob);
          emit('transcript', text);
        } catch (err) {
          console.error('转写失败:', err);
          emit('transcript', '');
        }
      };
  
    } catch (e) {
      console.error('获取麦克风失败:', e);
      emit('transcript', '');
    }
  };
  
  const stop = () => {
    if (animationId) cancelAnimationFrame(animationId);
    animationId = null;
  
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
    analyser = null;
    dataArray = null;
  
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  
    const canvas = canvasRef.value;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
  
  defineExpose({
    start,
    stop,
    setAutoSend: (val) => {
      autoSendEnabled.value = val;
      console.log('自动发送状态：', val);
    }
  });
  
  onBeforeUnmount(() => {
    stop();
  });
  </script>
  
  <style scoped>
  .voice-visualizer {
    width: 100%;
    height: 48px;
    background: transparent;
  }
  
  canvas {
    width: 100%;
    height: 100%;
    background: transparent;
    display: block;
  }
  </style>
  