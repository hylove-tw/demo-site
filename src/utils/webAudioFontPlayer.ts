// src/utils/webAudioFontPlayer.ts
// 使用 WebAudioFont 播放 MusicXML（支援所有樂器和打擊樂）

// WebAudioFont 的類型定義
declare global {
  interface Window {
    WebAudioFontPlayer: any;
  }
}

// 音符事件介面
interface NoteEvent {
  time: number;      // 開始時間（秒）
  duration: number;  // 持續時間（秒）
  midi: number;      // MIDI 音高
  velocity: number;  // 力度 0-1
  channel: number;   // MIDI 通道 (0-15, 9=打擊樂)
  program: number;   // MIDI 程式號
}

// GM 樂器對應的 WebAudioFont 預設 URL
const GM_INSTRUMENT_URLS: { [key: number]: string } = {
  0: '0000_JCLive_sf2_file', // Acoustic Grand Piano
  1: '0010_JCLive_sf2_file', // Bright Acoustic Piano
  2: '0020_JCLive_sf2_file', // Electric Grand Piano
  4: '0040_JCLive_sf2_file', // Electric Piano 1
  24: '0240_JCLive_sf2_file', // Acoustic Guitar (nylon)
  25: '0250_JCLive_sf2_file', // Acoustic Guitar (steel)
  26: '0260_JCLive_sf2_file', // Electric Guitar (jazz)
  32: '0320_JCLive_sf2_file', // Acoustic Bass
  33: '0330_JCLive_sf2_file', // Electric Bass (finger)
  40: '0400_JCLive_sf2_file', // Violin
  41: '0410_JCLive_sf2_file', // Viola
  42: '0420_JCLive_sf2_file', // Cello
  43: '0430_JCLive_sf2_file', // Contrabass
  46: '0461_GeneralUserGS_sf2_file', // Orchestral Harp
  48: '0480_JCLive_sf2_file', // String Ensemble 1
  56: '0560_JCLive_sf2_file', // Trumpet
  57: '0570_JCLive_sf2_file', // Trombone
  60: '0600_JCLive_sf2_file', // French Horn
  65: '0650_JCLive_sf2_file', // Alto Sax
  66: '0660_JCLive_sf2_file', // Tenor Sax
  68: '0680_JCLive_sf2_file', // Oboe
  71: '0710_JCLive_sf2_file', // Clarinet
  73: '0730_JCLive_sf2_file', // Flute
  74: '0740_JCLive_sf2_file', // Recorder
  75: '0750_JCLive_sf2_file', // Pan Flute
};

// 打擊樂預設
const DRUM_KIT_URL = '12835_0_JCLive_sf2_file';

// 解析 MusicXML 並提取所有音符事件
function parseMusicXML(musicXML: string): {
  events: NoteEvent[];
  bpm: number;
  duration: number;
  usedPrograms: Set<number>;
  hasDrums: boolean;
} {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(musicXML, 'text/xml');

  // 取得 BPM
  let bpm = 120;
  const perMinuteElem = xmlDoc.getElementsByTagName('per-minute')[0];
  if (perMinuteElem) {
    bpm = parseFloat(perMinuteElem.textContent || '120');
  }
  const soundElem = xmlDoc.getElementsByTagName('sound')[0];
  if (soundElem && soundElem.getAttribute('tempo')) {
    bpm = parseFloat(soundElem.getAttribute('tempo') || '120');
  }

  const events: NoteEvent[] = [];
  const usedPrograms = new Set<number>();
  let hasDrums = false;
  const parts = xmlDoc.getElementsByTagName('part');
  let maxTime = 0;

  // 建立 part-id 到樂器資訊的映射
  const partInstruments: Map<string, { program: number; channel: number; isDrum: boolean }> = new Map();
  const scoreParts = xmlDoc.getElementsByTagName('score-part');

  for (let i = 0; i < scoreParts.length; i++) {
    const scorePart = scoreParts[i];
    const partId = scorePart.getAttribute('id') || '';

    // 檢查 MIDI 通道和程式號
    const midiChannel = scorePart.getElementsByTagName('midi-channel')[0];
    const midiProgram = scorePart.getElementsByTagName('midi-program')[0];
    const partName = scorePart.getElementsByTagName('part-name')[0];

    let channel = midiChannel ? parseInt(midiChannel.textContent || '1') - 1 : 0;
    let program = midiProgram ? parseInt(midiProgram.textContent || '1') - 1 : 0;

    // 檢查是否為打擊樂（Channel 10 = index 9 或名稱包含 drum）
    const isDrum = channel === 9 ||
                   partId.toLowerCase().includes('drum') ||
                   (partName?.textContent?.toLowerCase().includes('drum') ?? false);

    if (isDrum) {
      channel = 9;
      hasDrums = true;
    } else {
      usedPrograms.add(program);
    }

    partInstruments.set(partId, { program, channel, isDrum });
  }

  // 處理每個聲部
  for (let partIndex = 0; partIndex < parts.length; partIndex++) {
    const part = parts[partIndex];
    const partId = part.getAttribute('id') || '';
    const instrument = partInstruments.get(partId) || { program: 0, channel: 0, isDrum: false };

    const measures = part.getElementsByTagName('measure');
    let currentTime = 0; // 以拍為單位
    let divisions = 1;

    for (let m = 0; m < measures.length; m++) {
      const measure = measures[m];

      // 更新 divisions
      const divisionsElem = measure.getElementsByTagName('divisions')[0];
      if (divisionsElem) {
        divisions = parseInt(divisionsElem.textContent || '1');
      }

      const children = measure.children;
      for (let c = 0; c < children.length; c++) {
        const child = children[c];

        if (child.tagName === 'note') {
          const isChord = child.getElementsByTagName('chord').length > 0;
          const isRest = child.getElementsByTagName('rest').length > 0;

          // 取得時值
          const durationElem = child.getElementsByTagName('duration')[0];
          const noteDuration = durationElem ? parseInt(durationElem.textContent || '1') : divisions;
          const durationInBeats = noteDuration / divisions;
          const durationInSeconds = (durationInBeats / bpm) * 60;
          const currentTimeInSeconds = (currentTime / bpm) * 60;

          if (!isRest) {
            let midiPitch = 60; // 預設中央 C

            if (instrument.isDrum) {
              // 打擊樂 - 使用 unpitched 元素
              const unpitchedElem = child.getElementsByTagName('unpitched')[0];
              if (unpitchedElem) {
                const displayStep = unpitchedElem.getElementsByTagName('display-step')[0]?.textContent || 'C';
                const displayOctave = parseInt(unpitchedElem.getElementsByTagName('display-octave')[0]?.textContent || '4');

                // 映射到 GM 打擊樂
                if (displayStep === 'F' && displayOctave === 4) midiPitch = 36; // Bass Drum
                else if (displayStep === 'C' && displayOctave === 5) midiPitch = 38; // Snare
                else if (displayStep === 'G' && displayOctave === 5) midiPitch = 42; // Hi-hat Closed
                else if (displayStep === 'A' && displayOctave === 5) midiPitch = 46; // Hi-hat Open
                else if (displayStep === 'F' && displayOctave === 5) midiPitch = 51; // Ride
                else if (displayStep === 'E' && displayOctave === 5) midiPitch = 49; // Crash
                else if (displayStep === 'B' && displayOctave === 4) midiPitch = 47; // Mid Tom
                else if (displayStep === 'D' && displayOctave === 5) midiPitch = 45; // Low Tom
                else midiPitch = 38; // 預設小鼓
              }
            } else {
              // 旋律樂器 - 使用 pitch 元素
              const pitchElem = child.getElementsByTagName('pitch')[0];
              if (pitchElem) {
                const step = pitchElem.getElementsByTagName('step')[0]?.textContent || 'C';
                const octave = parseInt(pitchElem.getElementsByTagName('octave')[0]?.textContent || '4');
                const alterElem = pitchElem.getElementsByTagName('alter')[0];
                const alter = alterElem ? parseInt(alterElem.textContent || '0') : 0;

                // 計算 MIDI 音高
                const stepToSemitone: { [key: string]: number } = {
                  'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
                };
                midiPitch = 12 * (octave + 1) + stepToSemitone[step] + alter;
              }
            }

            // 取得力度
            const dynamicsElem = child.getElementsByTagName('dynamics')[0];
            let velocity = 0.8;
            if (dynamicsElem) {
              if (dynamicsElem.getElementsByTagName('ff').length > 0) velocity = 1.0;
              else if (dynamicsElem.getElementsByTagName('f').length > 0) velocity = 0.9;
              else if (dynamicsElem.getElementsByTagName('mf').length > 0) velocity = 0.75;
              else if (dynamicsElem.getElementsByTagName('mp').length > 0) velocity = 0.6;
              else if (dynamicsElem.getElementsByTagName('p').length > 0) velocity = 0.5;
              else if (dynamicsElem.getElementsByTagName('pp').length > 0) velocity = 0.35;
            }

            events.push({
              time: currentTimeInSeconds,
              duration: durationInSeconds,
              midi: midiPitch,
              velocity,
              channel: instrument.channel,
              program: instrument.program,
            });
          }

          // 更新時間
          if (!isChord) {
            currentTime += durationInBeats;
          }

          // 更新最大時間
          if (currentTimeInSeconds + durationInSeconds > maxTime) {
            maxTime = currentTimeInSeconds + durationInSeconds;
          }
        } else if (child.tagName === 'forward') {
          const durationElem = child.getElementsByTagName('duration')[0];
          if (durationElem) {
            const dur = parseInt(durationElem.textContent || '0');
            currentTime += dur / divisions;
          }
        } else if (child.tagName === 'backup') {
          const durationElem = child.getElementsByTagName('duration')[0];
          if (durationElem) {
            const dur = parseInt(durationElem.textContent || '0');
            currentTime -= dur / divisions;
            if (currentTime < 0) currentTime = 0;
          }
        }
      }
    }
  }

  // 排序事件
  events.sort((a, b) => a.time - b.time);

  return { events, bpm, duration: maxTime, usedPrograms, hasDrums };
}

// WebAudioFont 播放器類別
export class WebAudioFontPlayer {
  private audioContext: AudioContext | null = null;
  private player: any = null;
  private events: NoteEvent[] = [];
  private duration = 0;
  private isPlaying = false;
  private isPaused = false;
  private startTime = 0;
  private pauseTime = 0;
  private scheduledNotes: any[] = [];
  private loadedInstruments: Map<string, any> = new Map();
  private masterGain: GainNode | null = null;
  private animationFrameId: number | null = null;

  async loadScore(musicXML: string, volume: number = 80): Promise<void> {
    // 解析 MusicXML
    const parsed = parseMusicXML(musicXML);
    this.events = parsed.events;
    this.duration = parsed.duration;

    if (this.events.length === 0) {
      return;
    }

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

    // 載入 WebAudioFont player 腳本
    await this.loadWebAudioFontScript();

    // 初始化 player
    if (!this.player) {
      this.player = new (window as any).WebAudioFontPlayer();
    }

    // 載入需要的樂器音色
    const instrumentsToLoad: Promise<void>[] = [];

    // 載入旋律樂器
    for (const program of Array.from(parsed.usedPrograms)) {
      const url = GM_INSTRUMENT_URLS[program] || GM_INSTRUMENT_URLS[0];
      instrumentsToLoad.push(this.loadInstrument(program, url));
    }

    // 載入打擊樂
    if (parsed.hasDrums) {
      instrumentsToLoad.push(this.loadDrumKit());
    }

    await Promise.all(instrumentsToLoad);
  }

  private async loadWebAudioFontScript(): Promise<void> {
    if ((window as any).WebAudioFontPlayer) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load WebAudioFont'));
      document.head.appendChild(script);
    });
  }

  private async loadInstrument(program: number, preset: string): Promise<void> {
    const key = `instrument_${program}`;
    if (this.loadedInstruments.has(key)) {
      return;
    }

    return new Promise((resolve, reject) => {
      const varName = `_tone_${preset}`;

      // 檢查是否已載入
      if ((window as any)[varName]) {
        this.loadedInstruments.set(key, (window as any)[varName]);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://surikov.github.io/webaudiofontdata/sound/${preset}.js`;
      script.onload = () => {
        const preset_data = (window as any)[varName];
        if (preset_data) {
          this.player.adjustPreset(this.audioContext, preset_data);
          this.loadedInstruments.set(key, preset_data);
        }
        resolve();
      };
      script.onerror = () => {
        console.warn(`Failed to load instrument ${program}`);
        resolve(); // 不拋出錯誤，使用預設音色
      };
      document.head.appendChild(script);
    });
  }

  private async loadDrumKit(): Promise<void> {
    const key = 'drums';
    if (this.loadedInstruments.has(key)) {
      return;
    }

    return new Promise((resolve) => {
      const varName = `_drum_${DRUM_KIT_URL}`;

      if ((window as any)[varName]) {
        this.loadedInstruments.set(key, (window as any)[varName]);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://surikov.github.io/webaudiofontdata/sound/${DRUM_KIT_URL}.js`;
      script.onload = () => {
        const drumPreset = (window as any)[varName];
        if (drumPreset) {
          this.player.adjustPreset(this.audioContext, drumPreset);
          this.loadedInstruments.set(key, drumPreset);
        }
        resolve();
      };
      script.onerror = () => {
        console.warn('Failed to load drum kit');
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  private getPresetForEvent(event: NoteEvent): any {
    if (event.channel === 9) {
      return this.loadedInstruments.get('drums');
    }
    return this.loadedInstruments.get(`instrument_${event.program}`) ||
           this.loadedInstruments.get('instrument_0');
  }

  play(): void {
    if (this.isPlaying || !this.audioContext || !this.player || this.events.length === 0) {
      return;
    }

    // 恢復 AudioContext（如果被暫停）
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.isPlaying = true;
    this.isPaused = false;

    const now = this.audioContext.currentTime;
    const offset = this.pauseTime;
    this.startTime = now - offset;

    // 調度所有音符
    for (const event of this.events) {
      if (event.time < offset) continue;

      const startTime = now + (event.time - offset);
      const preset = this.getPresetForEvent(event);

      if (preset) {
        const note = this.player.queueWaveTable(
          this.audioContext,
          this.masterGain,
          preset,
          startTime,
          event.midi,
          event.duration,
          event.velocity
        );
        this.scheduledNotes.push(note);
      }
    }

    // 監控播放結束
    this.checkPlaybackEnd();
  }

  private checkPlaybackEnd(): void {
    if (!this.isPlaying || !this.audioContext) return;

    const currentTime = this.getCurrentTime();
    if (currentTime >= this.duration) {
      this.stop();
      return;
    }

    this.animationFrameId = requestAnimationFrame(() => this.checkPlaybackEnd());
  }

  pause(): void {
    if (!this.isPlaying || !this.audioContext) return;

    this.pauseTime = this.getCurrentTime();
    this.isPlaying = false;
    this.isPaused = true;

    // 取消所有調度的音符
    this.cancelAllNotes();

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  stop(): void {
    if (!this.audioContext) return;

    this.isPlaying = false;
    this.isPaused = false;
    this.pauseTime = 0;

    this.cancelAllNotes();

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private cancelAllNotes(): void {
    for (const note of this.scheduledNotes) {
      if (note && note.cancel) {
        note.cancel();
      }
    }
    this.scheduledNotes = [];
  }

  getCurrentTime(): number {
    if (!this.audioContext) return 0;
    if (!this.isPlaying) return this.pauseTime;
    return this.audioContext.currentTime - this.startTime;
  }

  getDuration(): number {
    return this.duration;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = volume / 100;
    }
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  getMasterGain(): GainNode | null {
    return this.masterGain;
  }

  dispose(): void {
    this.stop();

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    this.audioContext = null;
    this.player = null;
    this.masterGain = null;
    this.loadedInstruments.clear();
  }
}
