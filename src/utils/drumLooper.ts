// src/utils/drumLooper.ts
// 循環式節奏播放器 - 用最少記憶體播放節奏

// 節奏事件
interface DrumHit {
  beat: number;   // 在小節中的拍子位置 (0-3 for 4/4)
  midi: number;   // MIDI 音符
  velocity: number;
}

// 預設的打擊樂音色（使用 WebAudioFont）
const DRUM_PRESETS: { [key: number]: { file: string; variable: string } } = {
  36: { file: '12836_0_JCLive_sf2_file', variable: '_drum_36_0_JCLive_sf2_file' },
  38: { file: '12838_0_JCLive_sf2_file', variable: '_drum_38_0_JCLive_sf2_file' },
  42: { file: '12842_0_JCLive_sf2_file', variable: '_drum_42_0_JCLive_sf2_file' },
  46: { file: '12846_0_JCLive_sf2_file', variable: '_drum_46_0_JCLive_sf2_file' },
  49: { file: '12849_0_JCLive_sf2_file', variable: '_drum_49_0_JCLive_sf2_file' },
  51: { file: '12851_0_JCLive_sf2_file', variable: '_drum_51_0_JCLive_sf2_file' },
};

export class DrumLooper {
  private audioContext: AudioContext | null = null;
  private ownsAudioContext = false;
  private player: any = null;
  private masterGain: GainNode | null = null;
  private pattern: DrumHit[] = [];
  private bpm = 120;
  private beatsPerMeasure = 4;
  private isPlaying = false;
  private isPaused = false;
  private pauseTime = 0;
  private startTime = 0;
  private loopIntervalId: number | null = null;
  private loadedDrums: Map<number, any> = new Map();
  private renderedBuffer: AudioBuffer | null = null;
  private bufferSource: AudioBufferSourceNode | null = null;

  async init(volume: number = 80, externalAudioContext?: AudioContext): Promise<void> {
    // 初始化 AudioContext
    if (externalAudioContext) {
      this.audioContext = externalAudioContext;
      this.ownsAudioContext = false;
    } else if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.ownsAudioContext = true;
    }

    // 建立主音量控制
    if (!this.masterGain) {
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
    }
    this.masterGain.gain.value = volume / 100;

    // 載入 WebAudioFont
    await this.loadWebAudioFont();
  }

  private async loadWebAudioFont(): Promise<void> {
    if ((window as any).WebAudioFontPlayer) {
      this.player = new (window as any).WebAudioFontPlayer();
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js';
      script.onload = () => {
        this.player = new (window as any).WebAudioFontPlayer();
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load WebAudioFont'));
      document.head.appendChild(script);
    });
  }

  // Wait for all zone.file entries in a preset to finish decoding to AudioBuffer.
  private async awaitZoneBuffers(preset: any): Promise<void> {
    if (!this.audioContext || !preset?.zones) return;
    const promises: Promise<void>[] = [];
    for (const zone of preset.zones) {
      if (!zone.buffer && zone.file) {
        const decoded = atob(zone.file);
        const arraybuffer = new ArrayBuffer(decoded.length);
        const view = new Uint8Array(arraybuffer);
        for (let i = 0; i < decoded.length; i++) {
          view[i] = decoded.charCodeAt(i);
        }
        promises.push(
          this.audioContext.decodeAudioData(arraybuffer).then(audioBuffer => {
            zone.buffer = audioBuffer;
          })
        );
      }
    }
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  private async loadDrumSound(midi: number): Promise<void> {
    if (this.loadedDrums.has(midi)) return;

    const preset = DRUM_PRESETS[midi];
    if (!preset) return;

    // Load the script if the preset variable isn't on window yet
    if (!(window as any)[preset.variable]) {
      await new Promise<void>((resolve) => {
        const script = document.createElement('script');
        script.src = `https://surikov.github.io/webaudiofontdata/sound/${preset.file}.js`;
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
      });
    }

    const data = (window as any)[preset.variable];
    if (data) {
      // Save zone.file references before adjustPreset clears them.
      // adjustPreset → adjustZone normalizes zone properties (delay, originalPitch,
      // coarseTune, etc.) but also sets zone.file = null after starting a
      // fire-and-forget async decode.  We need the file data so awaitZoneBuffers
      // can do a proper Promise-based decode we can actually await.
      const savedFiles = data.zones.map((z: any) => z.file);
      this.player?.adjustPreset(this.audioContext, data);

      // Restore zone.file for zones where the async decode hasn't finished yet
      for (let i = 0; i < data.zones.length; i++) {
        if (!data.zones[i].buffer && !data.zones[i].file && savedFiles[i]) {
          data.zones[i].file = savedFiles[i];
        }
      }
      await this.awaitZoneBuffers(data);
      this.loadedDrums.set(midi, data);
    }
  }

  // 設定節奏模式
  async setPattern(pattern: DrumHit[], bpm: number, beatsPerMeasure: number = 4): Promise<void> {
    this.pattern = pattern.sort((a, b) => a.beat - b.beat);
    this.bpm = bpm;
    this.beatsPerMeasure = beatsPerMeasure;

    // 載入需要的鼓聲
    const midiNotes = new Set(pattern.map(h => h.midi));
    await Promise.all(Array.from(midiNotes).map(midi => this.loadDrumSound(midi)));
  }

  // 從簡單字串解析節奏 (e.g., "kick,hh,snare,hh" for 4 beats)
  parseSimplePattern(patternStr: string, bpm: number): void {
    const instruments: { [key: string]: number } = {
      'kick': 36, 'bass': 36,
      'snare': 38, 'sd': 38,
      'hh': 42, 'hihat': 42, 'hi-hat': 42,
      'oh': 46, 'open': 46,
      'crash': 49,
      'ride': 51,
    };

    const beats = patternStr.toLowerCase().split(',').map(s => s.trim());
    const pattern: DrumHit[] = [];

    beats.forEach((beat, index) => {
      if (beat && beat !== '-' && beat !== 'x') {
        const parts = beat.split('+'); // 支援同時多個樂器 "kick+hh"
        parts.forEach(part => {
          const midi = instruments[part.trim()];
          if (midi) {
            pattern.push({
              beat: index * 0.5, // 假設每個元素是半拍
              midi,
              velocity: 0.8,
            });
          }
        });
      }
    });

    this.setPattern(pattern, bpm);
  }

  async renderToBuffer(totalDuration: number): Promise<AudioBuffer> {
    if (!this.audioContext || !this.player || this.pattern.length === 0) {
      throw new Error('Must call init() and setPattern() before renderToBuffer()');
    }

    // All zone.file presets are guaranteed decoded by loadDrumSound.

    const sampleRate = this.audioContext.sampleRate;
    const length = Math.ceil(totalDuration * sampleRate) + sampleRate * 2; // +2s padding for release tails
    const offlineCtx = new OfflineAudioContext(2, length, sampleRate);

    const gainNode = offlineCtx.createGain();
    // Use gain=1.0 here — volume is applied by masterGain during real-time playback
    gainNode.gain.value = 1.0;
    gainNode.connect(offlineCtx.destination);

    // Temporarily disable WebAudioFont's resumeContext during offline rendering.
    const originalResumeContext = this.player.resumeContext;
    this.player.resumeContext = () => {};

    const beatDuration = 60 / this.bpm;
    const measureDuration = beatDuration * this.beatsPerMeasure;
    const numLoops = Math.ceil(totalDuration / measureDuration);

    for (let loop = 0; loop < numLoops; loop++) {
      const loopStart = loop * measureDuration;
      for (const hit of this.pattern) {
        const hitTime = loopStart + hit.beat * beatDuration;
        if (hitTime >= totalDuration) continue;
        const preset = this.loadedDrums.get(hit.midi);
        if (preset) {
          this.player.queueWaveTable(
            offlineCtx,
            gainNode,
            preset,
            hitTime,
            hit.midi,
            0.25,
            hit.velocity
          );
        }
      }
    }

    // Restore resumeContext for real-time playback
    this.player.resumeContext = originalResumeContext;

    this.renderedBuffer = await offlineCtx.startRendering();
    return this.renderedBuffer;
  }

  clearRenderedBuffer(): void {
    this.renderedBuffer = null;
    if (this.bufferSource) {
      try { this.bufferSource.stop(); } catch (e) { /* ignore */ }
      this.bufferSource = null;
    }
  }

  getMasterGain(): GainNode | null {
    return this.masterGain;
  }

  play(): void {
    if (this.isPlaying || !this.audioContext || !this.player || this.pattern.length === 0) {
      return;
    }

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Buffer mode: play pre-rendered buffer
    if (this.renderedBuffer) {
      this.playBuffer();
      return;
    }

    // Fallback: real-time scheduling
    this.isPlaying = true;
    this.isPaused = false;
    this.loopStartTime = this.audioContext.currentTime;
    this.lastScheduledLoop = -1;

    // 使用高頻率的 interval 來精確觸發音符
    this.loopIntervalId = window.setInterval(() => {
      this.scheduleNotes();
    }, 20); // 每 20ms 檢查一次

    // 立即排程第一批
    this.scheduleNotes();
  }

  private playBuffer(): void {
    if (!this.audioContext || !this.renderedBuffer || !this.masterGain) return;

    this.bufferSource = this.audioContext.createBufferSource();
    this.bufferSource.buffer = this.renderedBuffer;
    this.bufferSource.connect(this.masterGain);

    const offset = this.pauseTime;
    this.startTime = this.audioContext.currentTime - offset;

    this.bufferSource.onended = () => {
      if (this.isPlaying) {
        this.isPlaying = false;
        this.isPaused = false;
        this.pauseTime = 0;
        this.bufferSource = null;
      }
    };

    this.isPlaying = true;
    this.isPaused = false;
    this.bufferSource.start(0, offset);
  }

  private loopStartTime = 0;
  private lastScheduledLoop = -1;

  private scheduleNotes(): void {
    if (!this.isPlaying || !this.audioContext || !this.player) return;

    const now = this.audioContext.currentTime;
    const scheduleAhead = 0.3; // 提前 300ms 排程（確保無縫銜接）
    const beatDuration = 60 / this.bpm;
    const measureDuration = beatDuration * this.beatsPerMeasure;

    // 計算需要排程到的時間點
    const scheduleUntil = now + scheduleAhead;

    // 計算當前和未來需要排程的循環
    const currentLoop = Math.floor((now - this.loopStartTime) / measureDuration);
    const futureLoop = Math.floor((scheduleUntil - this.loopStartTime) / measureDuration);

    // 排程所有需要的循環
    for (let loop = Math.max(0, this.lastScheduledLoop + 1); loop <= futureLoop; loop++) {
      const loopStartTime = this.loopStartTime + loop * measureDuration;

      // 排程這個循環中的所有音符
      for (const hit of this.pattern) {
        const hitTime = loopStartTime + hit.beat * beatDuration;

        // 只排程在時間範圍內的音符
        if (hitTime >= now - 0.05 && hitTime <= scheduleUntil) {
          const preset = this.loadedDrums.get(hit.midi);
          if (preset) {
            const actualTime = Math.max(hitTime, now);
            this.player.queueWaveTable(
              this.audioContext,
              this.masterGain,
              preset,
              actualTime,
              hit.midi,
              0.25,
              hit.velocity
            );
          }
        }
      }

      this.lastScheduledLoop = loop;
    }
  }

  pause(): void {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    this.isPaused = true;

    // Buffer mode
    if (this.bufferSource) {
      this.pauseTime = this.audioContext
        ? this.audioContext.currentTime - this.startTime
        : 0;
      try { this.bufferSource.stop(); } catch (e) { /* ignore */ }
      this.bufferSource = null;
      return;
    }

    // Fallback: real-time scheduling
    if (this.loopIntervalId) {
      clearInterval(this.loopIntervalId);
      this.loopIntervalId = null;
    }
  }

  stop(): void {
    this.isPlaying = false;
    this.isPaused = false;
    this.pauseTime = 0;

    // Buffer mode
    if (this.bufferSource) {
      try { this.bufferSource.stop(); } catch (e) { /* ignore */ }
      this.bufferSource = null;
      // Don't clear renderedBuffer — keep it for next play
    }

    // Fallback: real-time scheduling
    if (this.loopIntervalId) {
      clearInterval(this.loopIntervalId);
      this.loopIntervalId = null;
    }
    this.lastScheduledLoop = -1;
  }

  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = volume / 100;
    }
  }

  setBpm(bpm: number): void {
    this.bpm = bpm;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  dispose(): void {
    this.stop();
    this.renderedBuffer = null;
    this.bufferSource = null;

    if (this.ownsAudioContext && this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.player = null;
    this.masterGain = null;
    this.loadedDrums.clear();
  }
}

// 預設節奏模式
export const PRESET_PATTERNS = {
  rock: [
    { beat: 0, midi: 36, velocity: 0.9 },    // kick
    { beat: 0, midi: 42, velocity: 0.7 },    // hh
    { beat: 0.5, midi: 42, velocity: 0.6 },  // hh
    { beat: 1, midi: 38, velocity: 0.9 },    // snare
    { beat: 1, midi: 42, velocity: 0.7 },    // hh
    { beat: 1.5, midi: 42, velocity: 0.6 },  // hh
    { beat: 2, midi: 36, velocity: 0.9 },    // kick
    { beat: 2, midi: 42, velocity: 0.7 },    // hh
    { beat: 2.5, midi: 42, velocity: 0.6 },  // hh
    { beat: 3, midi: 38, velocity: 0.9 },    // snare
    { beat: 3, midi: 42, velocity: 0.7 },    // hh
    { beat: 3.5, midi: 42, velocity: 0.6 },  // hh
  ],
  pop: [
    { beat: 0, midi: 36, velocity: 0.9 },
    { beat: 0.5, midi: 42, velocity: 0.5 },
    { beat: 1, midi: 38, velocity: 0.8 },
    { beat: 1.5, midi: 42, velocity: 0.5 },
    { beat: 2, midi: 36, velocity: 0.7 },
    { beat: 2.5, midi: 36, velocity: 0.6 },
    { beat: 3, midi: 38, velocity: 0.8 },
    { beat: 3.5, midi: 42, velocity: 0.5 },
  ],
  simple: [
    { beat: 0, midi: 36, velocity: 0.9 },
    { beat: 1, midi: 38, velocity: 0.8 },
    { beat: 2, midi: 36, velocity: 0.9 },
    { beat: 3, midi: 38, velocity: 0.8 },
  ],
};
