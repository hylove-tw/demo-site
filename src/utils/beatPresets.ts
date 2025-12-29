// src/utils/beatPresets.ts
// 經典節奏預設 - 用於在 MusicXML 中嵌入打擊樂聲部

export interface BeatPreset {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  timeSignature: string; // 支援的拍號
  // 節奏模式：每個數字代表該拍的打擊強度 (0=無, 1=弱, 2=中, 3=強)
  // 使用 MIDI 打擊樂器音符
  pattern: {
    kick: number[];      // 大鼓 (Bass Drum, MIDI 36)
    snare: number[];     // 小鼓 (Snare, MIDI 38)
    hihat: number[];     // 腳踏鈸 (Hi-Hat, MIDI 42/46)
    ride?: number[];     // 疊音鈸 (Ride, MIDI 51)
    clap?: number[];     // 拍手 (Clap, MIDI 39)
    conga?: number[];    // 康加鼓 (Conga, MIDI 63)
  };
  subdivisions: number;  // 每拍細分數 (4=十六分音符, 2=八分音符)
}

export const BEAT_PRESETS: BeatPreset[] = [
  {
    id: 'none',
    name: '無節奏',
    nameEn: 'None',
    description: '不添加節奏聲部',
    timeSignature: '4/4',
    pattern: {
      kick: [],
      snare: [],
      hihat: [],
    },
    subdivisions: 4,
  },
  {
    id: 'pop',
    name: '流行',
    nameEn: 'Pop',
    description: '經典流行音樂節奏',
    timeSignature: '4/4',
    pattern: {
      kick:  [3, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0],
      hihat: [2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
    },
    subdivisions: 4,
  },
  {
    id: 'rock',
    name: '搖滾',
    nameEn: 'Rock',
    description: '強勁的搖滾節奏',
    timeSignature: '4/4',
    pattern: {
      kick:  [3, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0],
      hihat: [3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0],
    },
    subdivisions: 4,
  },
  {
    id: 'rumba',
    name: '倫巴',
    nameEn: 'Rumba',
    description: '浪漫拉丁節奏',
    timeSignature: '4/4',
    pattern: {
      kick:  [3, 0, 0, 2, 0, 0, 3, 0, 0, 0, 2, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
      conga: [2, 0, 0, 2, 0, 2, 0, 0, 2, 0, 0, 2, 0, 2, 0, 0],
      hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    },
    subdivisions: 4,
  },
  {
    id: 'tango',
    name: '探戈',
    nameEn: 'Tango',
    description: '熱情阿根廷探戈',
    timeSignature: '4/4',
    pattern: {
      kick:  [3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 2, 0],
      snare: [0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 2],
      hihat: [2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
    },
    subdivisions: 4,
  },
  {
    id: 'bossanova',
    name: '乍古芭',
    nameEn: 'Bossa Nova',
    description: '輕柔巴西節奏',
    timeSignature: '4/4',
    pattern: {
      kick:  [3, 0, 0, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      hihat: [2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
      ride:  [0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2],
    },
    subdivisions: 4,
  },
  {
    id: 'waltz',
    name: '華爾滋',
    nameEn: 'Waltz',
    description: '優雅三拍子舞曲',
    timeSignature: '3/4',
    pattern: {
      kick:  [3, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 0, 0],
      hihat: [2, 0, 2, 0, 2, 0],
    },
    subdivisions: 2,
  },
  {
    id: 'country',
    name: '鄉村',
    nameEn: 'Country',
    description: '美國鄉村音樂風格',
    timeSignature: '4/4',
    pattern: {
      kick:  [3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0],
      hihat: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    },
    subdivisions: 4,
  },
  {
    id: 'jazz',
    name: '爵士',
    nameEn: 'Jazz Swing',
    description: '搖擺爵士節奏',
    timeSignature: '4/4',
    pattern: {
      kick:  [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
      ride:  [3, 0, 0, 2, 0, 0, 3, 0, 0, 2, 0, 0, 3, 0, 0, 2],
      hihat: [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
    },
    subdivisions: 4,
  },
  {
    id: 'reggae',
    name: '雷鬼',
    nameEn: 'Reggae',
    description: '牙買加雷鬼節奏',
    timeSignature: '4/4',
    pattern: {
      kick:  [3, 0, 0, 0, 0, 0, 2, 0, 3, 0, 0, 0, 0, 0, 2, 0],
      snare: [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
      hihat: [0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0],
    },
    subdivisions: 4,
  },
];

// MIDI 打擊樂器對應的 MusicXML unpitched 音符
const DRUM_MIDI_MAP: Record<string, { midi: number; step: string; octave: number; notehead?: string }> = {
  kick:  { midi: 36, step: 'F', octave: 4 },
  snare: { midi: 38, step: 'C', octave: 5 },
  hihat: { midi: 42, step: 'G', octave: 5, notehead: 'x' },
  ride:  { midi: 51, step: 'F', octave: 5, notehead: 'x' },
  clap:  { midi: 39, step: 'E', octave: 5 },
  conga: { midi: 63, step: 'A', octave: 4 },
};

/**
 * 生成打擊樂聲部的 MusicXML score-part 定義
 * @param partId 聲部 ID
 * @param volume 音量 0-100，預設 80
 */
export function generateDrumScorePart(partId: string = 'P-Drums', volume: number = 80): string {
  const midiVolume = Math.round((volume / 100) * 127);
  return `
    <score-part id="${partId}">
      <part-name>Drums</part-name>
      <part-abbreviation>Dr.</part-abbreviation>
      <score-instrument id="${partId}-I1">
        <instrument-name>Drumset</instrument-name>
      </score-instrument>
      <midi-instrument id="${partId}-I1">
        <midi-channel>10</midi-channel>
        <midi-program>1</midi-program>
        <volume>${midiVolume}</volume>
      </midi-instrument>
    </score-part>`;
}

/**
 * 根據節奏預設生成一個小節的打擊樂 MusicXML
 */
function generateDrumMeasure(
  preset: BeatPreset,
  measureNumber: number,
  divisions: number
): string {
  if (preset.id === 'none' || !preset.pattern.kick.length) {
    // 空小節（休止符）
    const [beats, beatType] = preset.timeSignature.split('/').map(Number);
    return `
      <measure number="${measureNumber}">
        <note>
          <rest/>
          <duration>${divisions * beats}</duration>
          <voice>1</voice>
          <type>whole</type>
        </note>
      </measure>`;
  }

  const [beats] = preset.timeSignature.split('/').map(Number);
  const totalSubdivisions = beats * preset.subdivisions;
  const durationPerSubdivision = divisions / preset.subdivisions;

  let notes = '';

  for (let i = 0; i < totalSubdivisions; i++) {
    const instruments: string[] = [];

    // 檢查每個打擊樂器在這個細分上是否有音
    Object.entries(preset.pattern).forEach(([instrument, pattern]) => {
      if (pattern && pattern[i] && pattern[i] > 0) {
        instruments.push(instrument);
      }
    });

    if (instruments.length === 0) {
      // 休止符
      notes += `
        <note>
          <rest/>
          <duration>${durationPerSubdivision}</duration>
          <voice>1</voice>
          <type>${preset.subdivisions === 4 ? '16th' : 'eighth'}</type>
        </note>`;
    } else {
      // 生成音符（可能是和弦）
      instruments.forEach((instrument, idx) => {
        const drumInfo = DRUM_MIDI_MAP[instrument];
        if (!drumInfo) return;

        notes += `
        <note${idx > 0 ? '><chord/' : ''}>
          <unpitched>
            <display-step>${drumInfo.step}</display-step>
            <display-octave>${drumInfo.octave}</display-octave>
          </unpitched>
          <duration>${durationPerSubdivision}</duration>
          <voice>1</voice>
          <type>${preset.subdivisions === 4 ? '16th' : 'eighth'}</type>
          ${drumInfo.notehead ? `<notehead>${drumInfo.notehead}</notehead>` : ''}
        </note>`;
      });
    }
  }

  return `
      <measure number="${measureNumber}">
        ${measureNumber === 1 ? `
        <attributes>
          <divisions>${divisions}</divisions>
          <clef>
            <sign>percussion</sign>
          </clef>
        </attributes>` : ''}
        ${notes}
      </measure>`;
}

/**
 * 生成完整的打擊樂聲部
 */
export function generateDrumPart(
  preset: BeatPreset,
  measureCount: number,
  divisions: number = 4,
  partId: string = 'P-Drums'
): string {
  let measures = '';

  for (let i = 1; i <= measureCount; i++) {
    measures += generateDrumMeasure(preset, i, divisions);
  }

  return `
    <part id="${partId}">
      ${measures}
    </part>`;
}

/**
 * 將打擊樂聲部注入到現有的 MusicXML 中
 * @param musicXML 原始 MusicXML
 * @param preset 節奏預設
 * @param volume 音量 0-100，預設 80
 */
export function injectDrumPartToMusicXML(
  musicXML: string,
  preset: BeatPreset,
  volume: number = 80
): string {
  if (preset.id === 'none') {
    return musicXML;
  }

  const parser = new DOMParser();
  const serializer = new XMLSerializer();
  const xmlDoc = parser.parseFromString(musicXML, 'text/xml');

  // 取得小節數量
  const parts = xmlDoc.getElementsByTagName('part');
  if (parts.length === 0) return musicXML;

  const firstPart = parts[0];
  const measures = firstPart.getElementsByTagName('measure');
  const measureCount = measures.length;

  if (measureCount === 0) return musicXML;

  // 取得 divisions（通常在第一個小節的 attributes 中）
  const firstMeasure = measures[0];
  const divisionsElem = firstMeasure.getElementsByTagName('divisions')[0];
  const divisions = divisionsElem ? parseInt(divisionsElem.textContent || '4') : 4;

  // 檢查是否已經有打擊樂聲部
  const scoreParts = xmlDoc.getElementsByTagName('score-part');
  for (let i = 0; i < scoreParts.length; i++) {
    const partName = scoreParts[i].getElementsByTagName('part-name')[0];
    if (partName && partName.textContent === 'Drums') {
      // 已經有打擊樂聲部，移除它
      const partId = scoreParts[i].getAttribute('id');
      scoreParts[i].parentNode?.removeChild(scoreParts[i]);

      // 移除對應的 part
      for (let j = 0; j < parts.length; j++) {
        if (parts[j].getAttribute('id') === partId) {
          parts[j].parentNode?.removeChild(parts[j]);
          break;
        }
      }
      break;
    }
  }

  // 生成打擊樂聲部 ID
  const drumPartId = 'P-Drums';

  // 在 part-list 中添加打擊樂聲部定義
  const partList = xmlDoc.getElementsByTagName('part-list')[0];
  if (partList) {
    const drumScorePartXML = generateDrumScorePart(drumPartId, volume);
    const tempDoc = parser.parseFromString(`<temp>${drumScorePartXML}</temp>`, 'text/xml');
    const drumScorePart = tempDoc.getElementsByTagName('score-part')[0];
    if (drumScorePart) {
      partList.appendChild(xmlDoc.importNode(drumScorePart, true));
    }
  }

  // 在文檔末尾添加打擊樂聲部
  const scorePartwise = xmlDoc.getElementsByTagName('score-partwise')[0];
  if (scorePartwise) {
    const drumPartXML = generateDrumPart(preset, measureCount, divisions, drumPartId);
    const tempDoc = parser.parseFromString(`<temp>${drumPartXML}</temp>`, 'text/xml');
    const drumPart = tempDoc.getElementsByTagName('part')[0];
    if (drumPart) {
      scorePartwise.appendChild(xmlDoc.importNode(drumPart, true));
    }
  }

  return serializer.serializeToString(xmlDoc);
}

/**
 * 根據拍號過濾適合的節奏預設
 */
export function getPresetsForTimeSignature(timeSignature: string): BeatPreset[] {
  return BEAT_PRESETS.filter(
    preset => preset.id === 'none' || preset.timeSignature === timeSignature
  );
}

/**
 * DrumLooper 用的節奏事件格式
 */
export interface DrumLooperHit {
  beat: number;      // 在小節中的拍子位置 (0-3 for 4/4)
  midi: number;      // MIDI 音符
  velocity: number;  // 0-1
}

/**
 * DrumLooper 用的節奏模式格式
 */
export interface DrumLooperPattern {
  pattern: DrumLooperHit[];
  bpm: number;
  beatsPerMeasure: number;
}

/**
 * 將 BeatPreset 轉換為 DrumLooper 可用的格式
 * @param preset 節奏預設
 * @param bpm 每分鐘拍數
 */
export function convertPresetToDrumLooperPattern(
  preset: BeatPreset,
  bpm: number
): DrumLooperPattern | null {
  if (preset.id === 'none') {
    return null;
  }

  const hits: DrumLooperHit[] = [];
  const subdivisions = preset.subdivisions;
  const beatsPerMeasure = parseInt(preset.timeSignature.split('/')[0]) || 4;

  // MIDI 音符對照表
  const midiMap: { [key: string]: number } = {
    kick: 36,
    snare: 38,
    hihat: 42,
    ride: 51,
    clap: 39,
    conga: 63,
  };

  // 力度對照表 (0-3 轉換為 0-1)
  const velocityMap: { [key: number]: number } = {
    0: 0,
    1: 0.4,
    2: 0.7,
    3: 0.9,
  };

  // 遍歷每種樂器的模式
  for (const [instrument, pattern] of Object.entries(preset.pattern)) {
    const midi = midiMap[instrument];
    if (!midi || !pattern) continue;

    pattern.forEach((strength, index) => {
      if (strength > 0) {
        // 計算這個位置對應的拍子
        // index 是在 subdivisions*beatsPerMeasure 個位置中的索引
        const beat = index / subdivisions;
        hits.push({
          beat,
          midi,
          velocity: velocityMap[strength] || 0.7,
        });
      }
    });
  }

  // 按時間排序
  hits.sort((a, b) => a.beat - b.beat);

  return {
    pattern: hits,
    bpm,
    beatsPerMeasure,
  };
}
