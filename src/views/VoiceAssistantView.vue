<template>
    <div class="container">
      <div 
        v-if="!isRecording" 
        class="chat-button" 
        @click="toggleRecording">
        <span style="font-weight: 500;font-size: 16px;letter-spacing: 1px;">开始聊天</span>
      </div>
      <div v-if="isRecording"  
        class="ai-face" 
        :class="state" 
        @click="toggleRecording"
      >
        <div class="face-inner">
          <div class="eyes">
            <div class="eye left">
              <div class="eye-white">
                <div class="pupil"></div>
                <div class="shine"></div>
              </div>
              <div class="eyelid"></div>
            </div>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
            <div class="eye right">
              <div class="eye-white">
                <div class="pupil"></div>
                <div class="shine"></div>
              </div>
              <div class="eyelid"></div>
            </div>
          </div>
          
          <div class="expression">
            <div class="cheeks">
              <div class="cheek left"></div>
              <div class="cheek right"></div>
            </div>
            <div class="mouth">
              <div class="mouth-inner"></div>
            </div>
          </div>
        </div>
        <div class="status-text">
          <div class="dots-container">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          <!-- speaking（录音完）、thinking （我说完在思考）、listening（我在说话）-->
           <span style="font-size: 16px;color: #5E6C83;">
                {{ state === 'listening' ? '正在听...' : state === 'thinking' ? '在思考...' : state === 'speaking' ? '正在说话...' : '你可以开始说话' }}
           </span>
        </div>
      </div>
      <!-- 底部按钮组 -->
      <div class="bottom-buttons" v-if="isRecording" @click="toggleRecording">
        <div class="action-button close">
          <i class="icon-close"></i>
        </div>
      </div>
    </div>
</template>
  
<script setup lang="ts">
import { ref } from "vue";
import { AudioRecorder } from "@/utils/audioRecord";

const isRecording = ref(false); // 是否正在聊天录音
const state = ref(""); // 聊天状态
const r = ref<AudioRecorder | null>(null);
const selectedSpeaker = ref(""); // 当前选择的语音包

// 开始录制聊天
const toggleRecording = async () => {
  if (isRecording.value) {
    r.value?.stopAll();
    r.value = null;
  } else {
    console.log("开始录制");
    r.value = new AudioRecorder("ws://192.168.0.160:8080/api/conversations/call?speaker=" + selectedSpeaker.value + "&lang=zh-CN");
    r.value.onStateChangeCallback = (newState) => {
        console.log("newState", newState);
      state.value = newState;
    };
    await r.value.startRecording();
  }
  isRecording.value = !isRecording.value;
};
</script>

<style scoped>
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    color: white;
    font-size: 24px;
    z-index: 1000;
  }
  
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    background-image: linear-gradient(-20deg, #e9defa 20%, #fbfcdb 100%);
    font-family: Arial, sans-serif;
  }
  
  .header {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  select {
    padding: 5px 10px;
    font-size: 14px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }
  
  button {
    padding: 5px 10px;
    font-size: 14px;
    border-radius: 5px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  .chat-button, .floating-ball {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 120px;
    height: 120px;
    color: white;
    font-size: 18px;
    text-align: center;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s, background-color 0.3s;
  }
  
  .chat-button:hover, .floating-ball:hover {
    background-color: #0056b3;
    transform: scale(1.1);
  }
  
  /* listening: 黑色波动 */
  @keyframes black-wave {
    0% {
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    }
    100% {
      box-shadow: 0 0 20px rgba(0, 0, 0, 1);
    }
  }
  .floating-ball.listening {
    animation: black-wave 2s infinite;
    background-color: black;
  }
  
  /* speaking: 黑色音频播放形式 */
  @keyframes black-audio {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 -20px 0 black inset, 10px -10px 0 black inset, -10px -10px 0 black inset;
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 -10px 0 black inset, 10px -5px 0 black inset, -10px -5px 0 black inset;
    }
  }
  .floating-ball.speaking {
    animation: black-audio 1.5s infinite ease-in-out;
    background-color: #333; /* 灰黑备用颜色 */
  }
  
  /* thinking: 黑色云彩形式 */
  @keyframes black-cloud {
    0% {
      background: radial-gradient(circle, black 10%, transparent 40%);
      transform: scale(1);
    }
    50% {
      background: radial-gradient(circle, black 20%, transparent 50%);
      transform: scale(1.1);
    }
    100% {
      background: radial-gradient(circle, black 10%, transparent 40%);
      transform: scale(1);
    }
  }
  .floating-ball.thinking {
    animation: black-cloud 3s infinite;
    background-color: black;
  }
  
  @media (max-width: 768px) {
    .chat-button, .floating-ball {
      width: 130px;
      height: 130px;
      font-size: 16px;
      background-image: linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%);
      background-image: linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%);
      background-image: linear-gradient(to top, #bdc2e8 0%, #bdc2e8 1%, #e6dee9 100%);
      background-image: linear-gradient(to top, #df89b5 0%, #bfd9fe 100%);
      background-image: linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%);
      /* background-image: linear-gradient(to top, #9795f0 0%, #fbc8d4 100%); */
    }
  }
  
  
  
  
  /*
    下面代码为AI的表情
  */
  .ai-face {
    position: relative;
    width: 120px;
    height: 120px;
    margin-bottom: 20px;
    border-radius: 50%;
    background: linear-gradient(145deg, #fff, #f0f2f5);
    box-shadow: 
      0 8px 20px rgba(0, 0, 0, 0.1),
      inset 0 -4px 10px rgba(0, 0, 0, 0.05);
    padding: 4px;
    transition: all 0.3s ease;
  }
  
  .ai-face .face-inner {
    width: 100%;
    height: 100%;
    background: #fff;
    border-radius: 50%;
    position: relative;
    overflow: hidden;
  }
  
  .ai-face .eyes {
    display: flex;
    justify-content: space-between;
    padding: 0 15px;
    margin-top: 35px;
  }
  
  .ai-face .eye {
    width: 28px;
    height: 28px;
    position: relative;
    border-radius: 50%;
    background: #fff;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    animation: lookAround 8s infinite;
  }
  
  .ai-face .eye.left {
    animation-delay: 0.1s;
  }
  
  .ai-face .eye .eye-white {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .ai-face .eye .pupil {
    width: 12px;
    height: 12px;
    background: #333;
    border-radius: 50%;
    position: relative;
    animation: float 3s ease-in-out infinite;
  }
  
  .ai-face .eye .pupil::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 4px;
    height: 4px;
    background: #fff;
    border-radius: 50%;
    opacity: 0.8;
  }
  
  .ai-face .eye .shine {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 6px;
    height: 6px;
    background: #fff;
    border-radius: 50%;
    opacity: 0.8;
    animation: twinkle 4s infinite;
  }
  
  .ai-face .eye .eyelid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 0;
    background: #fff;
    animation: blink 4s infinite;
  }
  
  .ai-face .expression {
    margin-top: 15px;
    position: relative;
    animation: bounce 2s ease-in-out infinite;
  }
  
  .ai-face .expression .cheeks {
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
  }
  
  .ai-face .expression .cheek {
    width: 12px;
    height: 6px;
    background: #ffb3b3;
    border-radius: 50%;
    opacity: 0.6;
    animation: blush 3s infinite;
  }
  
  .ai-face .expression .mouth {
    width: 24px;
    height: 12px;
    margin: 8px auto 0;
    position: relative;
    overflow: hidden;
  }
  
  .ai-face .expression .mouth .mouth-inner {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: #ff6b6b;
    border-radius: 0 0 12px 12px;
    transition: all 0.3s ease;
    animation: smile 4s infinite;
  }
  
  .ai-face.thinking {
    position: relative;
  }
  
  .ai-face.thinking::before,
  .ai-face.thinking::after {
    content: '';
    position: absolute;
    background: #d0eaff; /* 浅蓝色 */
    animation: floatingCloud 3s infinite ease-in-out;
    border-radius: 50%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .ai-face.thinking::before {
    width: 40px;
    height: 30px;
    top: -30px;
    left: 40%;
    clip-path: polygon(60% 10%, 90% 40%, 80% 90%, 30% 80%, 10% 50%);
  }
  
  .ai-face.thinking::after {
    width: 30px;
    height: 20px;
    top: -50px;
    left: 60%;
    clip-path: polygon(50% 0%, 80% 30%, 60% 80%, 20% 70%, 0% 30%);
  }
  
  .ai-face.speaking .mouth .mouth-inner {
    animation: speak 0.5s infinite alternate;
  }
  
  .ai-face.listening {
    background: linear-gradient(145deg, #fff4f4, #ffe4e4);
    animation: excited 1s infinite;
  }
  
  .ai-face.listening .mouth-inner {
    background: #ff4d4d;
  }
  
  .ai-face.listening .cheek {
    opacity: 0.8;
    animation: blush 1s infinite;
  }
  
  @keyframes lookAround {
    0%, 100% { transform: translate(0, 0); }
    25% { transform: translate(2px, -2px); }
    50% { transform: translate(-2px, 2px); }
    75% { transform: translate(2px, 2px); }
  }
  
  @keyframes float {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(0.9); }
  }
  
  @keyframes twinkle {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 0.4; }
  }
  
  @keyframes blink {
    0%, 95%, 98% { height: 0; }
    96%, 97% { height: 100%; }
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
  }
  
  @keyframes blush {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.1); }
  }
  
  @keyframes smile {
    0%, 100% { height: 100%; border-radius: 0 0 12px 12px; }
    50% { height: 80%; border-radius: 0 0 8px 8px; }
  }
  
  @keyframes floatingCloud {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  
  @keyframes speak {
    0% { height: 60%; border-radius: 6px 6px 12px 12px; }
    100% { height: 100%; border-radius: 0 0 12px 12px; }
  }

.status-text {
  text-align: center;
  font-size: 15px;
  color: #5E6C83;
  margin-top: 40px;
}

.dots-container {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 10px;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: #5E6C83;
  border-radius: 50%;
  opacity: 0.3;
  animation: pulse 1.4s ease-in-out infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}
  
.bottom-buttons {
  position: fixed;
  bottom: 40px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 0 20px;
}

.action-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:active {
  transform: scale(0.95);
}

.action-button.close {
  background-color: rgba(255, 255, 255, 0.9);
}

.action-button.close i {
  color: #FF4D4F;
  font-style: normal;
  font-family: Arial, sans-serif;
  line-height: 1;
}

.icon-close::before {
  content: '✕';
  font-size: 24px;
  color: #FF4D4F;
  display: block;
  font-style: normal;
}

  
  </style>