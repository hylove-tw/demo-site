// src/utils/musicAudioGenerator.ts
// 使用 Tone.js 播放鼓聲（與 osmd-audio-player 配合使用）

import * as Tone from 'tone';

// 鼓聲事件介面
interface DrumEvent {
  time: number;      // 開始時間（秒）
  duration: number;  // 持續時間（秒）
  midi: number;      // MIDI 打擊樂音符
  velocity: number;  // 力度 0-1
}

// 解析 MusicXML 並提取鼓聲事件
function parseDrumEvents(musicXML: string): {
  events: DrumEvent[];
  bpm: number;
  duration: number;
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

  const events: DrumEvent[] = [];
  const parts = xmlDoc.getElementsByTagName('part');
  let maxTime = 0;

  for (let partIndex = 0; partIndex < parts.length; partIndex++) {
    const part = parts[partIndex];
    const partId = part.getAttribute('id') || '';

    // 檢查是否為打擊樂聲部
    let isDrumPart = partId.toLowerCase().includes('drum');

    // 通過 score-part 的 midi-channel 檢查
    const scoreParts = xmlDoc.getElementsByTagName('score-part');
    for (let i = 0; i < scoreParts.length; i++) {
      if (scoreParts[i].getAttribute('id') === partId) {
        const midiChannel = scoreParts[i].getElementsByTagName('midi-channel')[0];
        if (midiChannel && midiChannel.textContent === '10') {
          isDrumPart = true;
        }
        // 檢查 part-name 是否包含 Drums
        const partName = scoreParts[i].getElementsByTagName('part-name')[0];
        if (partName && partName.textContent?.toLowerCase().includes('drum')) {
          isDrumPart = true;
        }
        break;
      }
    }

    // 只處理打擊樂聲部
    if (!isDrumPart) continue;

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
          // 檢查是否為和弦音
          const isChord = child.getElementsByTagName('chord').length > 0;

          // 取得時值
          const durationElem = child.getElementsByTagName('duration')[0];
          const noteDuration = durationElem ? parseInt(durationElem.textContent || '1') : divisions;
          const durationInBeats = noteDuration / divisions;
          const durationInSeconds = (durationInBeats / bpm) * 60;

          const currentTimeInSeconds = (currentTime / bpm) * 60;

          // 處理打擊樂音符
          const unpitchedElem = child.getElementsByTagName('unpitched')[0];
          if (unpitchedElem) {
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
              duration: Math.min(durationInSeconds, 0.5),
              midi: drumMidi,
              velocity: 0.8,
            });
          }

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
  };
}

// 鼓聲播放器類別（只播放打擊樂）
export class DrumPlayer {
  private drumSynths: Map<number, Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth> = new Map();
  private scheduledEvents: number[] = [];
  private isPlaying = false;
  private startTime = 0;
  private pauseTime = 0;
  private events: DrumEvent[] = [];
  private duration = 0;

  async loadScore(musicXML: string, volume: number = 80): Promise<void> {
    const parsed = parseDrumEvents(musicXML);
    this.events = parsed.events;
    this.duration = parsed.duration;

    // 清理舊的合成器
    this.dispose();

    // 如果沒有鼓聲事件，直接返回
    if (this.events.length === 0) {
      return;
    }

    await Tone.start();
  }

  private getDrumSynth(midi: number, volume: number = 80): Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth {
    if (this.drumSynths.has(midi)) {
      return this.drumSynths.get(midi)!;
    }

    const volumeDb = Tone.gainToDb(volume / 100);
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
        synth.volume.value = volumeDb - 6;
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
        synth.volume.value = volumeDb - 10;
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
        synth.volume.value = volumeDb - 15;
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
        synth.volume.value = volumeDb - 12;
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
        synth.volume.value = volumeDb - 8;
        break;
      default:
        // 預設使用 MembraneSynth
        synth = new Tone.MembraneSynth().toDestination();
        synth.volume.value = volumeDb - 10;
    }

    this.drumSynths.set(midi, synth);
    return synth;
  }

  play(): void {
    if (this.isPlaying || this.events.length === 0) return;

    Tone.start();
    this.isPlaying = true;

    const now = Tone.now();
    const offset = this.pauseTime;
    this.startTime = now - offset;

    // 調度所有鼓聲事件
    for (const event of this.events) {
      if (event.time < offset) continue;

      const startTime = now + (event.time - offset);
      const drumSynth = this.getDrumSynth(event.midi);

      const id = Tone.Transport.schedule(() => {
        drumSynth.triggerAttackRelease(event.duration, Tone.now(), event.velocity);
      }, startTime);
      this.scheduledEvents.push(id);
    }

    Tone.Transport.start();
  }

  pause(): void {
    if (!this.isPlaying) return;

    this.pauseTime = Tone.now() - this.startTime;
    this.isPlaying = false;

    // 清除調度的事件
    for (const id of this.scheduledEvents) {
      Tone.Transport.clear(id);
    }
    this.scheduledEvents = [];

    Tone.Transport.stop();
  }

  stop(): void {
    this.pause();
    this.pauseTime = 0;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  dispose(): void {
    this.stop();

    Array.from(this.drumSynths.values()).forEach(synth => {
      synth.dispose();
    });
    this.drumSynths.clear();
  }
}
