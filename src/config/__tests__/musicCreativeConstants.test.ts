import {
  timeSignatureForMelody,
  isValidKeyCenter,
  resolveKeyCenter,
  diatonicToChromaticIndex,
  transposeNote,
  getChromaticNoteName,
  transposeManyToNames,
} from '../musicCreativeConstants';

describe('isValidKeyCenter', () => {
  it('accepts valid major keys', () => {
    expect(isValidKeyCenter('C', 'major')).toBe(true);
    expect(isValidKeyCenter('G', 'major')).toBe(true);
    expect(isValidKeyCenter('F', 'major')).toBe(true);
    expect(isValidKeyCenter('D', 'major')).toBe(true);
    expect(isValidKeyCenter('Bb', 'major')).toBe(true);
  });

  it('accepts valid minor keys', () => {
    expect(isValidKeyCenter('A', 'minor')).toBe(true);
    expect(isValidKeyCenter('E', 'minor')).toBe(true);
    expect(isValidKeyCenter('D', 'minor')).toBe(true);
    expect(isValidKeyCenter('B', 'minor')).toBe(true);
    expect(isValidKeyCenter('G', 'minor')).toBe(true);
  });

  it('rejects major key used as minor', () => {
    expect(isValidKeyCenter('C', 'minor')).toBe(false);
    expect(isValidKeyCenter('F', 'minor')).toBe(false);
    expect(isValidKeyCenter('Bb', 'minor')).toBe(false);
  });

  it('rejects minor key used as major', () => {
    expect(isValidKeyCenter('A', 'major')).toBe(false);
    expect(isValidKeyCenter('E', 'major')).toBe(false);
    expect(isValidKeyCenter('B', 'major')).toBe(false);
  });

  it('rejects unknown keys', () => {
    expect(isValidKeyCenter('X', 'major')).toBe(false);
    expect(isValidKeyCenter('', 'minor')).toBe(false);
  });

  // D and G exist in both major and minor
  it('accepts D and G for both major and minor', () => {
    expect(isValidKeyCenter('D', 'major')).toBe(true);
    expect(isValidKeyCenter('D', 'minor')).toBe(true);
    expect(isValidKeyCenter('G', 'major')).toBe(true);
    expect(isValidKeyCenter('G', 'minor')).toBe(true);
  });
});

describe('resolveKeyCenter', () => {
  it('returns original key when valid', () => {
    expect(resolveKeyCenter('G', 'major')).toEqual({ keyCenter: 'G', fallback: false });
    expect(resolveKeyCenter('A', 'minor')).toEqual({ keyCenter: 'A', fallback: false });
  });

  it('falls back to C for invalid major key', () => {
    expect(resolveKeyCenter('X', 'major')).toEqual({ keyCenter: 'C', fallback: true });
    expect(resolveKeyCenter('A', 'major')).toEqual({ keyCenter: 'C', fallback: true });
  });

  it('falls back to A for invalid minor key', () => {
    expect(resolveKeyCenter('X', 'minor')).toEqual({ keyCenter: 'A', fallback: true });
    expect(resolveKeyCenter('C', 'minor')).toEqual({ keyCenter: 'A', fallback: true });
  });
});

describe('diatonicToChromaticIndex', () => {
  it('maps C major scale degrees 0-6 to correct chromatic positions', () => {
    // C=0, D=2, E=4, F=5, G=7, A=9, B=11
    expect(diatonicToChromaticIndex(0)).toBe(0);  // C
    expect(diatonicToChromaticIndex(1)).toBe(2);  // D
    expect(diatonicToChromaticIndex(2)).toBe(4);  // E
    expect(diatonicToChromaticIndex(3)).toBe(5);  // F
    expect(diatonicToChromaticIndex(4)).toBe(7);  // G
    expect(diatonicToChromaticIndex(5)).toBe(9);  // A
    expect(diatonicToChromaticIndex(6)).toBe(11); // B
  });

  it('maps degree 7 to next octave root (12)', () => {
    expect(diatonicToChromaticIndex(7)).toBe(12); // c
  });

  it('maps second octave values 8-15 correctly', () => {
    // 8=c(12), 9=d(14), 10=e(16), 11=f(17), 12=g(19), 13=a(21), 14=b(23), 15=c\'(24)
    expect(diatonicToChromaticIndex(8)).toBe(12);  // c
    expect(diatonicToChromaticIndex(9)).toBe(14);  // d
    expect(diatonicToChromaticIndex(10)).toBe(16); // e
    expect(diatonicToChromaticIndex(11)).toBe(17); // f
    expect(diatonicToChromaticIndex(12)).toBe(19); // g
    expect(diatonicToChromaticIndex(13)).toBe(21); // a
    expect(diatonicToChromaticIndex(14)).toBe(23); // b
    expect(diatonicToChromaticIndex(15)).toBe(24); // c'
  });
});

describe('transposeNote', () => {
  it('C major (offset 0) returns same as diatonicToChromaticIndex', () => {
    for (let v = 0; v <= 15; v++) {
      expect(transposeNote(v, 'C')).toBe(diatonicToChromaticIndex(v));
    }
  });

  it('transposes to G major (offset 7)', () => {
    expect(transposeNote(0, 'G')).toBe(7);   // C → G
    expect(transposeNote(1, 'G')).toBe(9);   // D → A
    expect(transposeNote(4, 'G')).toBe(14);  // G → d
    expect(transposeNote(7, 'G')).toBe(19);  // c → g
  });

  it('transposes to F major (offset 5)', () => {
    expect(transposeNote(0, 'F')).toBe(5);   // C → F
    expect(transposeNote(3, 'F')).toBe(10);  // F → A#/Bb
  });

  it('transposes to D major (offset 2)', () => {
    expect(transposeNote(0, 'D')).toBe(2);   // C → D
    expect(transposeNote(4, 'D')).toBe(9);   // G → A
  });

  it('transposes to Bb major (offset 10)', () => {
    expect(transposeNote(0, 'Bb')).toBe(10); // C → A#/Bb
    expect(transposeNote(2, 'Bb')).toBe(14); // E → d
  });

  it('transposes minor keys (same offset logic)', () => {
    // A minor: offset 9
    expect(transposeNote(0, 'A')).toBe(9);   // C → A
    expect(transposeNote(2, 'A')).toBe(13);  // E → c#/db

    // E minor: offset 4
    expect(transposeNote(0, 'E')).toBe(4);   // C → E
    expect(transposeNote(4, 'E')).toBe(11);  // G → B
  });

  it('handles unknown key center gracefully (offset 0)', () => {
    expect(transposeNote(0, 'X')).toBe(0);
    expect(transposeNote(5, 'X')).toBe(9);
  });
});

describe('getChromaticNoteName', () => {
  it('returns correct note names for first octave', () => {
    expect(getChromaticNoteName(0)).toBe('C');
    expect(getChromaticNoteName(4)).toBe('E');
    expect(getChromaticNoteName(7)).toBe('G');
    expect(getChromaticNoteName(11)).toBe('B');
  });

  it('returns correct note names for second octave', () => {
    expect(getChromaticNoteName(12)).toBe('c');
    expect(getChromaticNoteName(14)).toBe('d');
    expect(getChromaticNoteName(19)).toBe('g');
  });

  it('returns correct note names for extended range', () => {
    expect(getChromaticNoteName(24)).toBe("c'");
  });

  it('returns bracketed index for out-of-range values', () => {
    expect(getChromaticNoteName(36)).toBe('[36]');
    expect(getChromaticNoteName(-1)).toBe('[-1]');
  });
});

describe('transposeManyToNames', () => {
  it('transposes C major scale to G major', () => {
    const cMajorScale = [0, 1, 2, 3, 4, 5, 6, 7];
    const result = transposeManyToNames(cMajorScale, 'G');
    // C→G, D→A, E→B, F→c, G→d, A→e, B→f#, c→g
    expect(result).toEqual(['G', 'A', 'B', 'c', 'd', 'e', 'f#/gb', 'g']);
  });

  it('transposes to C (no change)', () => {
    const result = transposeManyToNames([0, 2, 4], 'C');
    expect(result).toEqual(['C', 'E', 'G']);
  });

  it('transposes second octave values to Bb', () => {
    // value 8 = c (chromatic 12) + Bb offset 10 = 22
    // chromatic 22 = a#/bb (spec: second octave)
    // Hmm let me recalculate:
    // value 8 → chromatic 12, + 10 = 22 → 'b' at index 23? No.
    // Index 22 in the array: index 0-11 first octave, 12-23 second octave
    // 22 = 'a#/bb'
    // Wait, let me check the array:
    // 12='c', 13='c#/db', 14='d', 15='d#/eb', 16='e', 17='f', 18='f#/gb', 19='g', 20='g#/ab', 21='a', 22='a#/bb', 23='b'
    const result = transposeManyToNames([8], 'Bb');
    expect(result).toEqual(["a#/bb"]);
  });

  it('spec example: 音中心 section verification', () => {
    // Spec: 計算值 0 在 C 大調 = C, 轉到 D 大調 = D
    expect(transposeManyToNames([0], 'D')).toEqual(['D']);

    // 計算值 2 = E, 轉到 G 大調: E + 7 semitones = B
    expect(transposeManyToNames([2], 'G')).toEqual(['B']);
  });
});


describe('timeSignatureForMelody', () => {
  // This table must match music-gen's app/core/pipeline.py `_MELODY_TIME_SIG`.
  // The server derives the meter from `melody` and ignores any time_signature
  // sent to it, so a mismatch here shows up as a score whose printed meter
  // disagrees with the audio — with nothing failing loudly in between.
  const SERVER_TABLE: Record<number, string> = {
    1: '4/4', 2: '4/8', 3: '3/8', 4: '3/8', 5: '4/4',
    6: '3/4', 7: '6/8', 8: '12/16', 9: '8/16',
  };

  it.each(Object.entries(SERVER_TABLE))(
    'melody %s produces %s, as the server does',
    (melody, expected) => {
      expect(timeSignatureForMelody(Number(melody))).toBe(expected);
    },
  );

  it('falls back to 4/4 for an unset or unknown melody', () => {
    expect(timeSignatureForMelody(undefined)).toBe('4/4');
    expect(timeSignatureForMelody(99)).toBe('4/4');
  });
});
