// src/utils/musicAudioGenerator.ts
// 使用 Tone.js 從 MusicXML 生成音訊

import * as Tone from 'tone';

// MIDI 音符轉換為頻率名稱
const MIDI_TO_NOTE: Record<number, string> = {};
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
for (let midi = 21; midi <= 108; midi++) {
  const octave = Math.floor((midi - 12) / 12);
  const noteIndex = midi % 12;
  MIDI_TO_NOTE[midi] = `${NOTE_NAMES[noteIndex]}${octave}`;
}

// MusicXML 音符名稱轉 MIDI
function stepToMidi(step: string, octave: number, alter: number = 0): number {
  const stepMap: Record<string, number> = {
    'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
  };
  return (octave + 1) * 12 + (stepMap[step] || 0) + alter;
}

// 音符事件介面
interface NoteEvent {
  time: number;      // 開始時間（秒）
  duration: number;  // 持續時間（秒）
  midi: number;      // MIDI 音高
  velocity: number;  // 力度 0-1
  partIndex: number; // 聲部索引
  isDrum: boolean;   // 是否為打擊樂
}

// 解析 MusicXML 並提取音符事件
export function parseMusicXMLToEvents(musicXML: string): {
  events: NoteEvent[];
  bpm: number;
  duration: number;
  partCount: number;
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
  const parts = xmlDoc.getElementsByTagName('part');
  let maxTime = 0;

  for (let partIndex = 0; partIndex < parts.length; partIndex++) {
    const part = parts[partIndex];
    const partId = part.getAttribute('id') || '';
    const isDrum = partId.includes('Drum') || partId.includes('drum');

    // 檢查是否為打擊樂（通過 score-part 的 midi-channel）
    let isDrumPart = isDrum;
    const scoreParts = xmlDoc.getElementsByTagName('score-part');
    for (let i = 0; i < scoreParts.length; i++) {
      if (scoreParts[i].getAttribute('id') === partId) {
        const midiChannel = scoreParts[i].getElementsByTagName('midi-channel')[0];
        if (midiChannel && midiChannel.textContent === '10') {
          isDrumPart = true;
        }
        break;
      }
    }

    const measures = part.getElementsByTagName('measure');
    let currentTime = 0; // 當前時間（以拍為單位）
    let divisions = 1;   // 每拍的分割數

    for (let m = 0; m < measures.length; m++) {
      const measure = measures[m];

      // 更新 divisions
      const divisionsElem = measure.getElementsByTagName('divisions')[0];
      if (divisionsElem) {
        divisions = parseInt(divisionsElem.textContent || '1');
      }

      // 處理小節內的元素
      const children = measure.children;
      for (let c = 0; c < children.length; c++) {
        const child = children[c];

        if (child.tagName === 'note') {
          // 檢查是否為和弦音（與前一個音同時）
          const isChord = child.getElementsByTagName('chord').length > 0;
          if (isChord) {
            // 和弦音不增加時間
          }

          // 取得音高
          const pitchElem = child.getElementsByTagName('pitch')[0];
          const unpitchedElem = child.getElementsByTagName('unpitched')[0];
          const restElem = child.getElementsByTagName('rest')[0];

          // 取得時值
          const durationElem = child.getElementsByTagName('duration')[0];
          const noteDuration = durationElem ? parseInt(durationElem.textContent || '1') : divisions;
          const durationInBeats = noteDuration / divisions;
          const durationInSeconds = (durationInBeats / bpm) * 60;

          // 取得力度
          const dynamicsElem = child.getElementsByTagName('dynamics')[0];
          let velocity = 0.8;
          if (dynamicsElem) {
            if (dynamicsElem.getElementsByTagName('ff').length > 0) velocity = 1.0;
            else if (dynamicsElem.getElementsByTagName('f').length > 0) velocity = 0.9;
            else if (dynamicsElem.getElementsByTagName('mf').length > 0) velocity = 0.75;
            else if (dynamicsElem.getElementsByTagName('mp').length > 0) velocity = 0.6;
            else if (dynamicsElem.getElementsByTagName('p').length > 0) velocity = 0.5;
            else if (dynamicsElem.getElementsByTagName('pp').length > 0) velocity = 0.4;
          }

          const currentTimeInSeconds = (currentTime / bpm) * 60;

          if (pitchElem) {
            // 有音高的音符
            const step = pitchElem.getElementsByTagName('step')[0]?.textContent || 'C';
            const octave = parseInt(pitchElem.getElementsByTagName('octave')[0]?.textContent || '4');
            const alter = parseInt(pitchElem.getElementsByTagName('alter')[0]?.textContent || '0');
            const midi = stepToMidi(step, octave, alter);

            events.push({
              time: currentTimeInSeconds,
              duration: durationInSeconds,
              midi,
              velocity,
              partIndex,
              isDrum: false,
            });
          } else if (unpitchedElem) {
            // 打擊樂音符
            const displayStep = unpitchedElem.getElementsByTagName('display-step')[0]?.textContent || 'C';
            const displayOctave = parseInt(unpitchedElem.getElementsByTagName('display-octave')[0]?.textContent || '4');

            // 根據顯示位置映射到打擊樂 MIDI 音符
            let drumMidi = 38; // 預設小鼓
            if (displayStep === 'F' && displayOctave === 4) drumMidi = 36; // 大鼓
            else if (displayStep === 'C' && displayOctave === 5) drumMidi = 38; // 小鼓
            else if (displayStep === 'G' && displayOctave === 5) drumMidi = 42; // Hi-hat
            else if (displayStep === 'F' && displayOctave === 5) drumMidi = 51; // Ride
            else if (displayStep === 'E' && displayOctave === 5) drumMidi = 39; // Clap
            else if (displayStep === 'A' && displayOctave === 4) drumMidi = 63; // Conga

            events.push({
              time: currentTimeInSeconds,
              duration: Math.min(durationInSeconds, 0.5), // 打擊樂音符較短
              midi: drumMidi,
              velocity,
              partIndex,
              isDrum: true,
            });
          }
          // 休止符不產生事件

          // 更新時間（非和弦音才增加）
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

  return {
    events,
    bpm,
    duration: maxTime,
    partCount: parts.length,
  };
}

// 音訊播放器類別
export class MusicAudioPlayer {
  private synths: Map<number, Tone.PolySynth> = new Map();
  private drumSampler: Tone.Sampler | null = null;
  private scheduledEvents: number[] = [];
  private isPlaying = false;
  private startTime = 0;
  private pauseTime = 0;
  private events: NoteEvent[] = [];
  private duration = 0;
  private onEndCallback: (() => void) | null = null;
  private endCheckInterval: number | null = null;

  constructor() {
    // 初始化合成器將在 loadScore 時進行
  }

  async loadScore(musicXML: string, volumes: number[] = []): Promise<void> {
    const parsed = parseMusicXMLToEvents(musicXML);
    this.events = parsed.events;
    this.duration = parsed.duration;

    // 清理舊的合成器
    this.dispose();

    // 為每個聲部創建合成器
    const partIndices = Array.from(new Set(this.events.filter(e => !e.isDrum).map(e => e.partIndex)));
    for (const partIndex of partIndices) {
      const volume = volumes[partIndex] !== undefined ? volumes[partIndex] : 80;
      const dbVolume = Tone.gainToDb(volume / 100);

      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.3,
          release: 0.8,
        },
      }).toDestination();
      synth.volume.value = dbVolume;
      this.synths.set(partIndex, synth);
    }

    // 創建打擊樂合成器（使用 MembraneSynth 和 NoiseSynth）
    const hasDrums = this.events.some(e => e.isDrum);
    if (hasDrums) {
      // 使用簡單的合成鼓聲
      // 這裡我們用 Tone.MembraneSynth 模擬鼓聲
    }

    await Tone.start();
  }

  play(): void {
    if (this.isPlaying) return;

    Tone.start();
    this.isPlaying = true;

    const now = Tone.now();
    const offset = this.pauseTime;
    this.startTime = now - offset;

    // 調度所有事件
    for (const event of this.events) {
      if (event.time < offset) continue; // 跳過已播放的部分

      const startTime = now + (event.time - offset);
      const note = MIDI_TO_NOTE[event.midi];

      if (event.isDrum) {
        // 打擊樂使用噪音合成器
        const drumSynth = this.getDrumSynth(event.midi);
        if (drumSynth) {
          const id = Tone.Transport.schedule(() => {
            drumSynth.triggerAttackRelease(event.duration, Tone.now(), event.velocity);
          }, startTime);
          this.scheduledEvents.push(id);
        }
      } else if (note) {
        const synth = this.synths.get(event.partIndex);
        if (synth) {
          const id = Tone.Transport.schedule(() => {
            synth.triggerAttackRelease(note, event.duration, Tone.now(), event.velocity);
          }, startTime);
          this.scheduledEvents.push(id);
        }
      }
    }

    Tone.Transport.start();

    // 檢查播放結束
    this.endCheckInterval = window.setInterval(() => {
      if (this.getCurrentTime() >= this.duration) {
        this.stop();
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      }
    }, 100);
  }

  private drumSynths: Map<number, Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth> = new Map();

  private getDrumSynth(midi: number): Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth | null {
    if (this.drumSynths.has(midi)) {
      return this.drumSynths.get(midi)!;
    }

    let synth: Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth;

    switch (midi) {
      case 36: // Bass Drum
        synth = new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 4,
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.001,
            decay: 0.4,
            sustain: 0.01,
            release: 0.4,
          },
        }).toDestination();
        synth.volume.value = -6;
        break;
      case 38: // Snare
      case 39: // Clap
        synth = new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: {
            attack: 0.001,
            decay: 0.2,
            sustain: 0,
            release: 0.2,
          },
        }).toDestination();
        synth.volume.value = -10;
        break;
      case 42: // Closed Hi-hat
      case 46: // Open Hi-hat
        synth = new Tone.MetalSynth({
          envelope: {
            attack: 0.001,
            decay: 0.1,
            release: 0.1,
          },
          harmonicity: 5.1,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 1.5,
        }).toDestination();
        synth.volume.value = -15;
        break;
      case 51: // Ride
        synth = new Tone.MetalSynth({
          envelope: {
            attack: 0.001,
            decay: 0.3,
            release: 0.3,
          },
          harmonicity: 3.1,
          modulationIndex: 16,
          resonance: 3000,
          octaves: 1,
        }).toDestination();
        synth.volume.value = -12;
        break;
      case 63: // Conga
        synth = new Tone.MembraneSynth({
          pitchDecay: 0.02,
          octaves: 2,
          oscillator: { type: 'sine' },
          envelope: {
            attack: 0.001,
            decay: 0.3,
            sustain: 0,
            release: 0.3,
          },
        }).toDestination();
        synth.volume.value = -8;
        break;
      default:
        // 預設使用 MembraneSynth
        synth = new Tone.MembraneSynth().toDestination();
        synth.volume.value = -10;
    }

    this.drumSynths.set(midi, synth);
    return synth;
  }

  pause(): void {
    if (!this.isPlaying) return;

    this.pauseTime = this.getCurrentTime();
    this.isPlaying = false;

    // 清除調度的事件
    for (const id of this.scheduledEvents) {
      Tone.Transport.clear(id);
    }
    this.scheduledEvents = [];

    Tone.Transport.stop();

    if (this.endCheckInterval) {
      clearInterval(this.endCheckInterval);
      this.endCheckInterval = null;
    }
  }

  stop(): void {
    this.pause();
    this.pauseTime = 0;
  }

  getCurrentTime(): number {
    if (!this.isPlaying) return this.pauseTime;
    return Tone.now() - this.startTime;
  }

  getDuration(): number {
    return this.duration;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  dispose(): void {
    this.stop();

    Array.from(this.synths.values()).forEach(synth => {
      synth.dispose();
    });
    this.synths.clear();

    Array.from(this.drumSynths.values()).forEach(synth => {
      synth.dispose();
    });
    this.drumSynths.clear();

    if (this.drumSampler) {
      this.drumSampler.dispose();
      this.drumSampler = null;
    }
  }
}
