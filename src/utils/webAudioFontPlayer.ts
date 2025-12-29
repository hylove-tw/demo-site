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

// 打擊樂音符對應的預設（每個音符需要獨立載入）
const DRUM_PRESETS: { [key: number]: { file: string; variable: string } } = {
  35: { file: '12835_0_JCLive_sf2_file', variable: '_drum_35_0_JCLive_sf2_file' }, // Acoustic Bass Drum
  36: { file: '12836_0_JCLive_sf2_file', variable: '_drum_36_0_JCLive_sf2_file' }, // Bass Drum 1
  38: { file: '12838_0_JCLive_sf2_file', variable: '_drum_38_0_JCLive_sf2_file' }, // Acoustic Snare
  40: { file: '12840_0_JCLive_sf2_file', variable: '_drum_40_0_JCLive_sf2_file' }, // Electric Snare
  42: { file: '12842_0_JCLive_sf2_file', variable: '_drum_42_0_JCLive_sf2_file' }, // Closed Hi-hat
  44: { file: '12844_0_JCLive_sf2_file', variable: '_drum_44_0_JCLive_sf2_file' }, // Pedal Hi-hat
  46: { file: '12846_0_JCLive_sf2_file', variable: '_drum_46_0_JCLive_sf2_file' }, // Open Hi-hat
  49: { file: '12849_0_JCLive_sf2_file', variable: '_drum_49_0_JCLive_sf2_file' }, // Crash Cymbal 1
  51: { file: '12851_0_JCLive_sf2_file', variable: '_drum_51_0_JCLive_sf2_file' }, // Ride Cymbal 1
  45: { file: '12845_0_JCLive_sf2_file', variable: '_drum_45_0_JCLive_sf2_file' }, // Low Tom
  47: { file: '12847_0_JCLive_sf2_file', variable: '_drum_47_0_JCLive_sf2_file' }, // Low-Mid Tom
  48: { file: '12848_0_JCLive_sf2_file', variable: '_drum_48_0_JCLive_sf2_file' }, // Hi-Mid Tom
  50: { file: '12850_0_JCLive_sf2_file', variable: '_drum_50_0_JCLive_sf2_file' }, // High Tom
  39: { file: '12839_0_JCLive_sf2_file', variable: '_drum_39_0_JCLive_sf2_file' }, // Hand Clap
  37: { file: '12837_0_JCLive_sf2_file', variable: '_drum_37_0_JCLive_sf2_file' }, // Side Stick
};

// 解析 MusicXML 並提取所有音符事件
function parseMusicXML(musicXML: string): {
  events: NoteEvent[];
  bpm: number;
  duration: number;
  usedPrograms: Set<number>;
  usedDrumNotes: Set<number>;
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
  const usedDrumNotes = new Set<number>();
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

                // 記錄使用的打擊樂音符
                usedDrumNotes.add(midiPitch);
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

  return { events, bpm, duration: maxTime, usedPrograms, usedDrumNotes, hasDrums };
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
  private nextEventIndex = 0;  // 下一個要排程的事件索引
  private readonly SCHEDULE_AHEAD_TIME = 5;  // 提前排程時間（秒）
  private scheduleIntervalId: number | null = null;

  async loadScore(musicXML: string, volume: number = 80, skipDrums: boolean = false): Promise<void> {
    // 解析 MusicXML
    const parsed = parseMusicXML(musicXML);

    // 如果跳過打擊樂，過濾掉打擊樂事件
    if (skipDrums) {
      this.events = parsed.events.filter(e => e.channel !== 9);
    } else {
      this.events = parsed.events;
    }
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

    // 載入打擊樂（每個音符獨立載入）- 除非跳過
    if (parsed.hasDrums && !skipDrums) {
      for (const drumNote of Array.from(parsed.usedDrumNotes)) {
        instrumentsToLoad.push(this.loadDrumNote(drumNote));
      }
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

  private async loadDrumNote(midiNote: number): Promise<void> {
    const key = `drum_${midiNote}`;
    if (this.loadedInstruments.has(key)) {
      return;
    }

    // 取得對應的預設資訊
    const preset = DRUM_PRESETS[midiNote];
    if (!preset) {
      // 使用預設小鼓 (38) 作為後備
      const fallbackPreset = DRUM_PRESETS[38];
      if (fallbackPreset && this.loadedInstruments.has('drum_38')) {
        this.loadedInstruments.set(key, this.loadedInstruments.get('drum_38'));
      }
      return;
    }

    return new Promise((resolve) => {
      const varName = preset.variable;

      if ((window as any)[varName]) {
        const drumData = (window as any)[varName];
        this.player.adjustPreset(this.audioContext, drumData);
        this.loadedInstruments.set(key, drumData);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://surikov.github.io/webaudiofontdata/sound/${preset.file}.js`;
      script.onload = () => {
        const drumData = (window as any)[varName];
        if (drumData) {
          this.player.adjustPreset(this.audioContext, drumData);
          this.loadedInstruments.set(key, drumData);
        }
        resolve();
      };
      script.onerror = () => {
        console.warn(`Failed to load drum note ${midiNote}`);
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  private getPresetForEvent(event: NoteEvent): any {
    if (event.channel === 9) {
      // 打擊樂 - 取得對應音符的預設
      return this.loadedInstruments.get(`drum_${event.midi}`) ||
             this.loadedInstruments.get('drum_38'); // 後備小鼓
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

    // 找到要開始排程的事件索引
    this.nextEventIndex = 0;
    for (let i = 0; i < this.events.length; i++) {
      if (this.events[i].time >= offset) {
        this.nextEventIndex = i;
        break;
      }
    }

    // 立即排程第一批
    this.scheduleNextBatch();

    // 使用 setInterval 持續排程
    this.scheduleIntervalId = window.setInterval(() => {
      this.scheduleNextBatch();
    }, 300);
  }

  // 分批排程音符（只排程接下來幾秒的音符）
  private scheduleNextBatch(): void {
    if (!this.isPlaying || !this.audioContext || !this.player) {
      this.stopScheduling();
      return;
    }

    const currentPlayTime = this.getCurrentTime();
    const scheduleUntil = currentPlayTime + this.SCHEDULE_AHEAD_TIME;

    // 檢查是否播放結束
    if (currentPlayTime >= this.duration) {
      this.stop();
      return;
    }

    // 排程接下來的音符
    while (this.nextEventIndex < this.events.length) {
      const event = this.events[this.nextEventIndex];

      // 如果音符超出排程範圍，等待下次排程
      if (event.time > scheduleUntil) {
        break;
      }

      // 計算音符開始時間
      const noteStartTime = this.audioContext.currentTime + (event.time - currentPlayTime);

      // 跳過已經過去的音符
      if (noteStartTime < this.audioContext.currentTime - 0.05) {
        this.nextEventIndex++;
        continue;
      }

      const preset = this.getPresetForEvent(event);

      if (preset) {
        const actualStartTime = Math.max(noteStartTime, this.audioContext.currentTime);
        const note = this.player.queueWaveTable(
          this.audioContext,
          this.masterGain,
          preset,
          actualStartTime,
          event.midi,
          event.duration,
          event.velocity
        );
        if (note) {
          this.scheduledNotes.push(note);
        }
      }
      this.nextEventIndex++;
    }

    // 定期清理（每 10 次排程清理一次）
    if (this.nextEventIndex % 50 === 0) {
      this.cleanupOldNotes();
    }
  }

  private stopScheduling(): void {
    if (this.scheduleIntervalId) {
      clearInterval(this.scheduleIntervalId);
      this.scheduleIntervalId = null;
    }
  }

  // 清理舊音符
  private cleanupOldNotes(): void {
    // 只保留最近的 100 個音符記錄
    if (this.scheduledNotes.length > 100) {
      const toRemove = this.scheduledNotes.splice(0, this.scheduledNotes.length - 100);
      for (const note of toRemove) {
        if (note && note.cancel) {
          try { note.cancel(); } catch (e) { /* ignore */ }
        }
      }
    }
  }

  pause(): void {
    if (!this.isPlaying || !this.audioContext) return;

    this.pauseTime = this.getCurrentTime();
    this.isPlaying = false;
    this.isPaused = true;

    // 停止排程
    this.stopScheduling();

    // 取消所有調度的音符
    this.cancelAllNotes();
  }

  stop(): void {
    if (!this.audioContext) return;

    this.isPlaying = false;
    this.isPaused = false;
    this.pauseTime = 0;
    this.nextEventIndex = 0;

    // 停止排程
    this.stopScheduling();

    this.cancelAllNotes();
  }

  private cancelAllNotes(): void {
    for (const item of this.scheduledNotes) {
      const note = item.note || item;
      if (note && note.cancel) {
        try { note.cancel(); } catch (e) { /* ignore */ }
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
