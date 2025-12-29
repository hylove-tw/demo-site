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
  private player: any = null;
  private masterGain: GainNode | null = null;
  private pattern: DrumHit[] = [];
  private bpm = 120;
  private beatsPerMeasure = 4;
  private isPlaying = false;
  private loopIntervalId: number | null = null;
  private loadedDrums: Map<number, any> = new Map();

  async init(volume: number = 80): Promise<void> {
    // 初始化 AudioContext
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
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

  private async loadDrumSound(midi: number): Promise<void> {
    if (this.loadedDrums.has(midi)) return;

    const preset = DRUM_PRESETS[midi];
    if (!preset) return;

    return new Promise((resolve) => {
      if ((window as any)[preset.variable]) {
        const data = (window as any)[preset.variable];
        this.player?.adjustPreset(this.audioContext, data);
        this.loadedDrums.set(midi, data);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://surikov.github.io/webaudiofontdata/sound/${preset.file}.js`;
      script.onload = () => {
        const data = (window as any)[preset.variable];
        if (data) {
          this.player?.adjustPreset(this.audioContext, data);
          this.loadedDrums.set(midi, data);
        }
        resolve();
      };
      script.onerror = () => resolve();
      document.head.appendChild(script);
    });
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

  play(): void {
    if (this.isPlaying || !this.audioContext || !this.player || this.pattern.length === 0) {
      return;
    }

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.isPlaying = true;
    this.loopStartTime = this.audioContext.currentTime;
    this.lastScheduledLoop = -1;

    // 使用高頻率的 interval 來精確觸發音符
    this.loopIntervalId = window.setInterval(() => {
      this.scheduleNotes();
    }, 20); // 每 20ms 檢查一次

    // 立即排程第一批
    this.scheduleNotes();
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
    this.isPlaying = false;
    if (this.loopIntervalId) {
      clearInterval(this.loopIntervalId);
      this.loopIntervalId = null;
    }
  }

  stop(): void {
    this.pause();
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
    if (this.audioContext && this.audioContext.state !== 'closed') {
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
