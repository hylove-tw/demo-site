// src/utils/musicXmlTranspose.ts
// 共用 MusicXML 轉調邏輯 — MusicReportEditor 與 DualMusicReportEditor 共用

// ── 調號→fifths / mode 映射 ──────────────────────────────────
export const KEY_SIGNATURE_MAP: Record<string, { fifths: number; mode: string }> = {
    // 大調
    'C-major': { fifths: 0, mode: 'major' },
    'G-major': { fifths: 1, mode: 'major' },
    'D-major': { fifths: 2, mode: 'major' },
    'F-major': { fifths: -1, mode: 'major' },
    'Bb-major': { fifths: -2, mode: 'major' },
    // 小調
    'A-minor': { fifths: 0, mode: 'minor' },
    'E-minor': { fifths: 1, mode: 'minor' },
    'D-minor': { fifths: -1, mode: 'minor' },
    'B-minor': { fifths: 2, mode: 'minor' },
    'G-minor': { fifths: -2, mode: 'minor' },
};

// ── 各調性根音的半音偏移量（相對 C=0） ──────────────────────
export const KEY_SEMITONE_OFFSET: Record<string, number> = {
    'C-major': 0,
    'G-major': 7,
    'D-major': 2,
    'F-major': 5,
    'Bb-major': 10,
    'A-minor': 0,
    'E-minor': 7,
    'D-minor': 5,
    'B-minor': 2,
    'G-minor': 10,
};

// ── MusicXML step 到半音的映射 ──────────────────────────────
const STEP_TO_SEMITONE: Record<string, number> = {
    C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

// 半音到 step+alter 的映射（升號版）
const SEMITONE_TO_SHARP: [string, number][] = [
    ['C', 0], ['C', 1], ['D', 0], ['D', 1], ['E', 0],
    ['F', 0], ['F', 1], ['G', 0], ['G', 1], ['A', 0], ['A', 1], ['B', 0],
];

// 半音到 step+alter 的映射（降號版）
const SEMITONE_TO_FLAT: [string, number][] = [
    ['C', 0], ['D', -1], ['D', 0], ['E', -1], ['E', 0],
    ['F', 0], ['G', -1], ['G', 0], ['A', -1], ['A', 0], ['B', -1], ['B', 0],
];

/** 將 <pitch> 元素的 step/alter/octave 轉為 MIDI 音高數值 */
export function pitchToMidi(step: string, alter: number, octave: number): number {
    return (STEP_TO_SEMITONE[step] ?? 0) + alter + (octave + 1) * 12;
}

/** 將 MIDI 音高數值轉回 step/alter/octave，根據 fifths 選擇升號或降號 */
export function midiToPitch(midi: number, fifths: number): { step: string; alter: number; octave: number } {
    const octave = Math.floor(midi / 12) - 1;
    const semitone = ((midi % 12) + 12) % 12;
    const table = fifths >= 0 ? SEMITONE_TO_SHARP : SEMITONE_TO_FLAT;
    const [step, alter] = table[semitone];
    return { step, alter, octave };
}

/**
 * 對 MusicXML DOM 執行轉調
 * - 更新 <key> 元素的 fifths 和 mode
 * - 轉調所有音符（跳過打擊樂聲部）
 */
export function transposeMusicXML(
    xmlDoc: Document,
    keyCenter: string,
    keyType: string
): void {
    const keyLookup = `${keyCenter}-${keyType}`;
    const keySig = KEY_SIGNATURE_MAP[keyLookup];
    const semitoneOffset = KEY_SEMITONE_OFFSET[keyLookup];

    if (!keySig || semitoneOffset === undefined) return;

    // 更新調號 (<key> 元素)
    const keyElems = xmlDoc.getElementsByTagName('key');
    for (let i = 0; i < keyElems.length; i++) {
        const keyElem = keyElems[i];
        let fifthsElem = keyElem.getElementsByTagName('fifths')[0];
        if (!fifthsElem) {
            fifthsElem = xmlDoc.createElement('fifths');
            keyElem.insertBefore(fifthsElem, keyElem.firstChild);
        }
        fifthsElem.textContent = keySig.fifths.toString();

        let modeElem = keyElem.getElementsByTagName('mode')[0];
        if (!modeElem) {
            modeElem = xmlDoc.createElement('mode');
            keyElem.appendChild(modeElem);
        }
        modeElem.textContent = keySig.mode;
    }

    // 轉調所有音符（僅在 offset != 0 時）
    if (semitoneOffset !== 0) {
        // 收集 drum part 的 ID，用於跳過打擊樂聲部
        const drumPartIds = new Set<string>();
        const scorePartElems = xmlDoc.getElementsByTagName('score-part');
        for (let i = 0; i < scorePartElems.length; i++) {
            const sp = scorePartElems[i];
            const midiChannels = sp.getElementsByTagName('midi-channel');
            if (midiChannels.length > 0 && midiChannels[0].textContent === '10') {
                const id = sp.getAttribute('id');
                if (id) drumPartIds.add(id);
            }
            const id = sp.getAttribute('id') || '';
            if (id.toLowerCase().includes('drum')) {
                drumPartIds.add(id);
            }
        }

        const parts = xmlDoc.getElementsByTagName('part');
        for (let p = 0; p < parts.length; p++) {
            const part = parts[p];
            const partId = part.getAttribute('id') || '';

            if (drumPartIds.has(partId)) continue;

            const pitchElems = part.getElementsByTagName('pitch');
            for (let n = 0; n < pitchElems.length; n++) {
                const pitchElem = pitchElems[n];
                const stepElem = pitchElem.getElementsByTagName('step')[0];
                const octaveElem = pitchElem.getElementsByTagName('octave')[0];
                if (!stepElem || !octaveElem) continue;

                const step = stepElem.textContent || 'C';
                const alterElem = pitchElem.getElementsByTagName('alter')[0];
                const alter = alterElem ? parseFloat(alterElem.textContent || '0') : 0;
                const octave = parseInt(octaveElem.textContent || '4');

                const midi = pitchToMidi(step, alter, octave);
                const transposed = midiToPitch(midi + semitoneOffset, keySig.fifths);

                stepElem.textContent = transposed.step;
                octaveElem.textContent = transposed.octave.toString();

                if (transposed.alter !== 0) {
                    if (!alterElem) {
                        const newAlter = xmlDoc.createElement('alter');
                        newAlter.textContent = transposed.alter.toString();
                        pitchElem.insertBefore(newAlter, octaveElem);
                    } else {
                        alterElem.textContent = transposed.alter.toString();
                    }
                } else if (alterElem) {
                    pitchElem.removeChild(alterElem);
                }
            }
        }
    }
}
