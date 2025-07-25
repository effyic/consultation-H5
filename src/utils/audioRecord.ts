export class AudioRecorder{
    private audioContext: AudioContext | null = null; // 用于录音的 AudioContext
    private mediaStream: MediaStream | null = null; // 麦克风的 MediaStream
    private mediaStreamSource: MediaStreamAudioSourceNode | null = null; // 音频流节点
    private scriptProcessor: ScriptProcessorNode | null = null; // ScriptProcessorNode 用于处理音频数据
    private ws: WebSocket | null = null; // WebSocket 实例
    private playAudioContext: AudioContext | null = null; // 播放音频的 AudioContext
    private audioQueue: Array<AudioBuffer> = []; // 音频队列
    private isPlaying = false; // 当前是否正在播放音频
    private gainNode: GainNode | null = null; // 音量控制节点
    private state: string = 'thinking'; // 当前状态
    public onStateChangeCallback: ((newState: string) => void) | null = null;

    private wsArr: WebSocket[] = [];

    getState(): string {
        return this.state;
    }

    setState(newState: string): void {
        this.state = newState;
        this.onStateChangeCallback?.(newState);
      }

    // 回调函数
    onRecordingStart?: () => void;
    onRecordingStop?: () => void;

    constructor(private wsUrl: string) {
        
        this.ws = new WebSocket(this.wsUrl);
        this.ws.onopen = () => {
            console.log("WebSocket 已连接");
            this.ws?.send(JSON.stringify({ type: "state", state: "listening" })); // 发送录音状态
            this.startRecording(); // 开始录音
        };

        this.ws.onmessage = async (e) => {
            const jsonData = JSON.parse(e.data);

            if (jsonData.type === 'state') {
                this.setState(jsonData.state)
            }

            // tts start 停止录音，发送speaking状态
            if (jsonData.type === 'tts') {
                if (jsonData.state === 'start') {
                    this.stopRecording();
                    this.ws?.send(JSON.stringify({ type: "state", state: "speaking" })); // 停止录音，准备播放音频
                    console.log('停止录音，准备播放音频');
                }

                if (jsonData.state === 'stop') {
                    // if (!this.isPlaying && this.audioQueue.length === 0) {
                    //     this.ws?.send(JSON.stringify({ type: "state", state: "listening" }));
                    //     this.startRecording();
                    // }
                    
                    // 使用 setTimeout 确保所有音频播放完成
                    const checkAudioComplete = () => {
                        if (!this.isPlaying && this.audioQueue.length === 0) {
                            this.ws?.send(JSON.stringify({ type: "state", state: "listening" }));
                            this.startRecording();
                        } else {
                            setTimeout(checkAudioComplete, 100); // 每100ms检查一次
                        }
                    };
                    
                    setTimeout(checkAudioComplete, 500); // 延迟500ms开始检查
                }
                // 结束
            }

            // 播放音频数据
            if (jsonData.type === 'audio') {
                const audioBuffer = await this.decodeAudio(jsonData.audio);
                if (audioBuffer) {
                    this.audioQueue.push(audioBuffer);
                    await this.playAudio();
                }
            }
        };

        this.ws.onerror = (e) => {
            console.error("WebSocket 发生错误:", e);
        };

        this.ws.onclose = () => {
            console.log("WebSocket 已关闭");
            this.stopRecording();
        };

        this.playAudioContext = new AudioContext({ sampleRate: 24000 });
        this.gainNode = this.playAudioContext.createGain(); // 初始化音量控制
        this.gainNode.connect(this.playAudioContext.destination);
    }






    async startRecording(): Promise<void> {
        if (this.audioContext) return;
        await this.initRecording();
        this.onRecordingStart?.();
    }

    private async initRecording() {
        try {
            this.audioContext = new AudioContext({ sampleRate: 16000 });
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
            this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.mediaStream);

            this.scriptProcessor = this.audioContext.createScriptProcessor(1024, 1, 1); // 更大的缓冲区
            this.scriptProcessor.onaudioprocess = (event: AudioProcessingEvent) => {
                if (this.ws?.readyState === WebSocket.OPEN) {
                    const audioData = event.inputBuffer.getChannelData(0);
                    const pcmData = this.convertFloat32ToInt16(audioData);
                    const frameSize = 320;
                    const frames = Math.floor(pcmData.length / frameSize);

                    for (let i = 0; i < frames; i++) {
                        const frame = pcmData.slice(i * frameSize, (i + 1) * frameSize);
                        this.ws?.send(frame);
                    }
                }
            };

            this.mediaStreamSource.connect(this.scriptProcessor);
            this.scriptProcessor.connect(this.audioContext.destination);
        } catch (error) {
            console.error("启动录音失败:", error);
        }
    }

    stopRecording(): void {
        if (!this.audioContext) return;

        this.scriptProcessor?.disconnect();
        this.mediaStreamSource?.disconnect();
        this.mediaStream?.getTracks().forEach((track) => track.stop());

        this.audioContext.close();
        this.audioContext = null;
        this.onRecordingStop?.();
    }

    private async decodeAudio(base64Audio: string): Promise<AudioBuffer | null> {
        try {
            const audioBuffer = this.base64ToArrayBuffer(base64Audio);
            const pcmData = new Int16Array(audioBuffer);
            const float32Data = this.convertInt16ToFloat32(pcmData);

            const buffer = this.playAudioContext?.createBuffer(1, float32Data.length, 24000);
            if (buffer) {
                buffer.getChannelData(0).set(float32Data);
            }

            return buffer || null;
        } catch (error) {
            console.error("解码音频数据失败:", error);
            return null;
        }
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    private convertFloat32ToInt16(float32Array: Float32Array): Int16Array {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            int16Array[i] = Math.min(1, float32Array[i]) * 0x7fff;
        }
        return int16Array;
    }

    private convertInt16ToFloat32(int16Array: Int16Array): Float32Array {
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 0x7fff;
        }
        return float32Array;
    }


    private async playAudio(): Promise<void> {
        if (this.isPlaying) return; // 防止并发调用
    
        if (this.audioQueue.length === 0) return; // 如果队列为空直接返回
    
        this.isPlaying = true;
    
        if (!this.playAudioContext) {
            this.playAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    
        let startTime = this.playAudioContext.currentTime;
    
        while (this.audioQueue.length > 0) {
            const buffer = this.audioQueue.shift();
            if (!buffer || !this.playAudioContext) {
                this.isPlaying = false;
                return;
            }
    
            const source = this.playAudioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.gainNode!);
    
            // 设置稳定音量
            this.gainNode!.gain.setValueAtTime(0.8, startTime);
    
            // 精确安排播放时间
            source.start(startTime);
    
            // 更新下一个音频的播放时间
            startTime += buffer.duration;
        }
    
        // 播放完成，重置状态
        setTimeout(() => {
            this.isPlaying = false;
    
            if (this.audioQueue.length === 0) {
                this.ws?.send(JSON.stringify({ type: "state", state: "listening" }));
                this.startRecording();
            } else {
                this.playAudio(); // 如果还有音频，继续播放
            }
        }, (startTime - this.playAudioContext.currentTime) * 1000);
    }

    closeWebSocket(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    stopAll(): void {
        // this.wsArr.forEach((ws) => {
        //     ws.close();
        // });

        this.stopRecording();
        this.closeWebSocket();
        if (this.playAudioContext) {
            this.audioQueue = [];
            this.isPlaying = false;
            this.playAudioContext.close();
            this.playAudioContext = null;
        }
    }

}