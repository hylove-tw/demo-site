import React from 'react';
import { registerPlugin, AnalysisPlugin } from '../registry';
import { musicAnalysisCreative, dualMusicAnalysisCreative } from '../../config/analysisMethods';
import { renderBrainWaveMusicReport, renderDualMusicReportCreative } from '../../config/analysisRenderers';
import {
  KEY_CENTERS,
  MELODY_PATTERNS,
  GENRES,
  BRAINWAVE_FREQUENCIES,
  NATURE_SOUNDS,
  getCompatibleMelodies,
  getCompatibleGenres,
  getBpmMidpoint,
  MelodyPattern,
  Genre,
} from '../../config/musicCreativeConstants';

// 可選樂器列表（同現有元神音）
const INSTRUMENTS = [
  { value: 'piano', label: '鋼琴' },
  { value: 'guitar', label: '吉他' },
  { value: 'bass', label: '貝斯' },
  { value: 'violin', label: '小提琴' },
  { value: 'flute', label: '長笛' },
  { value: 'saxophone', label: '薩克斯風' },
  { value: 'cello', label: '大提琴' },
  { value: 'electric guitar', label: '電吉他' },
  { value: 'vocals', label: '人聲' },
];

const EditComponent: React.FC<{
  customParams: Record<string, any>;
  onChange: (newParams: Record<string, any>) => void;
}> = ({ customParams, onChange }) => {
  const handleChange = (field: string, value: any) => {
    onChange({ ...customParams, [field]: value });
  };

  const playerMode = customParams.playerMode ?? 'single';
  const musicType = customParams.musicType ?? 'emotion';
  const keyType = customParams.keyType ?? 'major';
  const selectedMelody = customParams.melodyPattern as number | undefined;
  const selectedGenre = customParams.genre as string | undefined;

  // 篩選相容的主旋律和曲風
  const availableMelodies: MelodyPattern[] = selectedGenre
    ? getCompatibleMelodies(selectedGenre)
    : MELODY_PATTERNS;

  const availableGenres: Genre[] = selectedMelody
    ? getCompatibleGenres(selectedMelody)
    : GENRES;

  // 取得目前選擇的曲風物件
  const currentGenre = GENRES.find((g) => g.id === selectedGenre);

  // BPM 範圍（依曲風限制）
  const bpmMin = currentGenre?.bpmRange[0] ?? 30;
  const bpmMax = currentGenre?.bpmRange[1] ?? 200;
  const currentBpm = customParams.bpm ?? 60;

  // 選曲風時的自動設定
  const handleGenreSelect = (genreId: string) => {
    const genre = GENRES.find((g) => g.id === genreId);
    if (!genre) return;

    const updates: Record<string, any> = {
      ...customParams,
      genre: genreId,
    };

    // 自動建議 BPM 中位值
    updates.bpm = getBpmMidpoint(genre.bpmRange);

    // 如果目前選的主旋律不相容，清除選擇
    if (selectedMelody) {
      const compat = getCompatibleMelodies(genreId);
      if (!compat.find((m) => m.id === selectedMelody)) {
        delete updates.melodyPattern;
        delete updates.time_signature;
      }
    }

    onChange(updates);
  };

  // 選主旋律時的自動設定
  const handleMelodySelect = (melodyId: number) => {
    const melody = MELODY_PATTERNS.find((m) => m.id === melodyId);
    if (!melody) return;

    const updates: Record<string, any> = {
      ...customParams,
      melodyPattern: melodyId,
      time_signature: melody.timeSignature,
    };

    // 如果目前選的曲風不相容，清除選擇
    if (selectedGenre) {
      const compat = getCompatibleGenres(melodyId);
      if (!compat.find((g) => g.id === selectedGenre)) {
        delete updates.genre;
      }
    }

    onChange(updates);
  };

  const getDefaultInstrument = (field: string) => {
    const defaults: Record<string, string> = {
      p1: 'flute', p2: 'piano', p3: 'cello',
      first_p1: 'flute', first_p2: 'piano', first_p3: 'cello',
      second_p1: 'violin', second_p2: 'guitar', second_p3: 'bass',
    };
    return defaults[field] || 'piano';
  };

  const renderInstrumentSelect = (field: string, label: string) => (
    <div className="form-control form-control-minimal">
      <label className="label label-minimal">
        <span className="label-text">{label}</span>
      </label>
      <select
        className="select select-underline w-full"
        value={customParams[field] ?? getDefaultInstrument(field)}
        onChange={(e) => handleChange(field, e.target.value)}
      >
        {INSTRUMENTS.map((inst) => (
          <option key={inst.value} value={inst.value}>
            {inst.label}
          </option>
        ))}
      </select>
    </div>
  );

  const isMelodyRecommended = (melodyId: number) =>
    musicType === 'spiritual' && melodyId >= 1 && melodyId <= 3;

  const isMelodyAvailable = (melodyId: number) =>
    availableMelodies.some((m) => m.id === melodyId);

  const isGenreAvailable = (genreId: string) =>
    availableGenres.some((g) => g.id === genreId);

  return (
    <div className="space-y-6 p-4 border border-base-300 rounded-lg">
      {/* ── 區段 0：演奏模式切換 ── */}
      <div>
        <label className="label label-minimal">
          <span className="label-text font-semibold">演奏模式</span>
        </label>
        <div className="join w-full">
          <button
            type="button"
            className={`btn join-item flex-1 ${playerMode === 'single' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => handleChange('playerMode', 'single')}
          >
            單人模式
          </button>
          <button
            type="button"
            className={`btn join-item flex-1 ${playerMode === 'dual' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => handleChange('playerMode', 'dual')}
          >
            雙人模式（琴瑟合）
          </button>
        </div>
        <div className="text-xs opacity-60 mt-2 px-1">
          {playerMode === 'single'
            ? '單人模式：上傳前測與後測腦波資料，生成三聲部樂譜'
            : '雙人模式：上傳兩人腦波資料，生成六聲部合奏樂譜'}
        </div>
      </div>

      {/* ── 區段 1：音樂類型 ── */}
      <div>
        <label className="label label-minimal">
          <span className="label-text font-semibold">音樂類型</span>
        </label>
        <div className="join w-full">
          <button
            type="button"
            className={`btn join-item flex-1 ${musicType === 'emotion' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => handleChange('musicType', 'emotion')}
          >
            情緒音樂（睜眼）
          </button>
          <button
            type="button"
            className={`btn join-item flex-1 ${musicType === 'spiritual' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => handleChange('musicType', 'spiritual')}
          >
            心靈音樂（閉眼）
          </button>
        </div>
        {musicType === 'spiritual' && (
          <div className="alert alert-info mt-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>心靈音樂建議選擇主旋律 1、2 或 3</span>
          </div>
        )}
      </div>

      {/* ── 區段 2：紀錄時間 + 樂譜標題 ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control form-control-minimal">
          <label className="label label-minimal">
            <span className="label-text">樂譜標題</span>
          </label>
          <input
            type="text"
            className="input input-underline w-full"
            placeholder="未命名的樂譜"
            value={customParams.title ?? ''}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </div>
        <div className="form-control form-control-minimal">
          <label className="label label-minimal">
            <span className="label-text">紀錄時間（分鐘）</span>
          </label>
          <input
            type="number"
            className="input input-underline w-full"
            placeholder="5"
            min={1}
            max={60}
            value={customParams.recordingTime ?? 5}
            onChange={(e) => handleChange('recordingTime', parseInt(e.target.value) || 5)}
          />
        </div>
      </div>

      <div className="divider-minimal">音中心</div>

      {/* ── 區段 3：音中心 ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control form-control-minimal">
          <label className="label label-minimal">
            <span className="label-text">調性類型</span>
          </label>
          <div className="join w-full">
            <button
              type="button"
              className={`btn join-item flex-1 btn-sm ${keyType === 'major' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                const newKeys = KEY_CENTERS.major;
                onChange({
                  ...customParams,
                  keyType: 'major',
                  keyCenter: newKeys[0].value,
                });
              }}
            >
              大調
            </button>
            <button
              type="button"
              className={`btn join-item flex-1 btn-sm ${keyType === 'minor' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                const newKeys = KEY_CENTERS.minor;
                onChange({
                  ...customParams,
                  keyType: 'minor',
                  keyCenter: newKeys[0].value,
                });
              }}
            >
              小調
            </button>
          </div>
        </div>
        <div className="form-control form-control-minimal">
          <label className="label label-minimal">
            <span className="label-text">調性</span>
          </label>
          <select
            className="select select-underline w-full"
            value={customParams.keyCenter ?? KEY_CENTERS[keyType as 'major' | 'minor'][0].value}
            onChange={(e) => handleChange('keyCenter', e.target.value)}
          >
            {KEY_CENTERS[keyType as 'major' | 'minor'].map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="divider-minimal">主旋律</div>

      {/* ── 區段 4：主旋律 ── */}
      <div className="grid grid-cols-3 gap-3">
        {MELODY_PATTERNS.map((melody) => {
          const available = isMelodyAvailable(melody.id);
          const recommended = isMelodyRecommended(melody.id);
          const selected = selectedMelody === melody.id;

          return (
            <button
              key={melody.id}
              type="button"
              disabled={!available}
              className={`card card-compact border-2 text-left transition-all cursor-pointer
                ${selected ? 'border-primary bg-primary/10' : available ? 'border-base-300 hover:border-primary/50' : 'border-base-200 opacity-40 cursor-not-allowed'}
              `}
              onClick={() => available && handleMelodySelect(melody.id)}
            >
              <div className="card-body p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">主旋律 {melody.id}</span>
                  <div className="flex gap-1">
                    {recommended && (
                      <span className="badge badge-success badge-xs">推薦</span>
                    )}
                    <span className="badge badge-outline badge-xs">{melody.timeSignature}</span>
                  </div>
                </div>
                <div className="text-xs opacity-70 mt-1 grid grid-cols-2 gap-x-2">
                  {melody.noteValues.map((nv, i) => (
                    <span key={i}>值{i}: {nv}</span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="divider-minimal">曲風</div>

      {/* ── 區段 5：曲風 ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {GENRES.map((genre) => {
          const available = isGenreAvailable(genre.id);
          const selected = selectedGenre === genre.id;

          return (
            <button
              key={genre.id}
              type="button"
              disabled={!available}
              className={`card card-compact border-2 text-left transition-all cursor-pointer
                ${selected ? 'border-primary bg-primary/10' : available ? 'border-base-300 hover:border-primary/50' : 'border-base-200 opacity-40 cursor-not-allowed'}
              `}
              onClick={() => available && handleGenreSelect(genre.id)}
            >
              <div className="card-body p-3">
                <div className="font-bold text-sm">{genre.nameZh}</div>
                <div className="text-xs opacity-60">{genre.nameEn}</div>
                <div className="text-xs mt-1">
                  <span className="badge badge-outline badge-xs">BPM {genre.bpmRange[0]}~{genre.bpmRange[1]}</span>
                </div>
                <div className="text-xs opacity-50 mt-0.5">{genre.beatPattern}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="divider-minimal">BPM 設定</div>

      {/* ── 區段 6：BPM ── */}
      <div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            className="range range-primary flex-1"
            min={bpmMin}
            max={bpmMax}
            value={Math.min(Math.max(currentBpm, bpmMin), bpmMax)}
            onChange={(e) => handleChange('bpm', parseInt(e.target.value))}
          />
          <input
            type="number"
            className="input input-underline w-24"
            min={bpmMin}
            max={bpmMax}
            value={Math.min(Math.max(currentBpm, bpmMin), bpmMax)}
            onChange={(e) => {
              const v = parseInt(e.target.value) || bpmMin;
              handleChange('bpm', Math.min(Math.max(v, bpmMin), bpmMax));
            }}
          />
        </div>
        <div className="flex justify-between text-xs opacity-50 mt-1 px-1">
          <span>{bpmMin}</span>
          {currentGenre && (
            <span>建議: {getBpmMidpoint(currentGenre.bpmRange)} BPM</span>
          )}
          <span>{bpmMax}</span>
        </div>
      </div>

      <div className="divider-minimal">樂器設定</div>

      {/* ── 區段 7：樂器設定 ── */}
      {playerMode === 'single' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderInstrumentSelect('p1', '高音域樂器 (P1)')}
          {renderInstrumentSelect('p2', '中音域樂器 (P2)')}
          {renderInstrumentSelect('p3', '低音域樂器 (P3)')}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-primary mb-3">第一演奏者</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInstrumentSelect('first_p1', '高音域樂器 (P1)')}
              {renderInstrumentSelect('first_p2', '中音域樂器 (P2)')}
              {renderInstrumentSelect('first_p3', '低音域樂器 (P3)')}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-secondary mb-3">第二演奏者</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInstrumentSelect('second_p1', '高音域樂器 (P1)')}
              {renderInstrumentSelect('second_p2', '中音域樂器 (P2)')}
              {renderInstrumentSelect('second_p3', '低音域樂器 (P3)')}
            </div>
          </div>
        </div>
      )}

      <div className="divider-minimal">背景音效</div>

      {/* ── 區段 8：背景音效 ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control form-control-minimal">
          <label className="label label-minimal">
            <span className="label-text">腦波背景頻率</span>
          </label>
          <select
            className="select select-underline w-full"
            value={customParams.brainwaveFrequency ?? ''}
            onChange={(e) =>
              handleChange(
                'brainwaveFrequency',
                e.target.value === '' ? null : parseFloat(e.target.value)
              )
            }
          >
            <option value="">不使用</option>
            {BRAINWAVE_FREQUENCIES.map((freq) => (
              <option key={freq.value} value={freq.value}>
                {freq.label} - {freq.description}
              </option>
            ))}
          </select>
        </div>
        <div className="form-control form-control-minimal">
          <label className="label label-minimal">
            <span className="label-text">自然音效</span>
          </label>
          <select
            className="select select-underline w-full"
            value={customParams.natureSound ?? ''}
            onChange={(e) => handleChange('natureSound', e.target.value)}
          >
            <option value="">不使用</option>
            {NATURE_SOUNDS.map((sound) => (
              <option key={sound.value} value={sound.value}>
                {sound.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

const plugin: AnalysisPlugin = {
  id: 'yuanshenyin-v2',
  group: '主要功能',
  name: '元神音創意平台',
  badge: { text: 'New', color: 'badge-success' },
  shortDescription: '進階腦波音樂創作，支援單人與雙人模式，自訂曲風、主旋律、音中心與背景音效',
  description:
    '元神音創意平台提供完整的音樂創作選項流程，可自選單人或雙人（琴瑟合）模式、情緒/心靈音樂類型、調性（大調/小調）、9 種主旋律、12 種曲風、BPM、樂器配置及腦波背景頻率與自然音效，生成專屬的腦波音樂五線譜。',
  requiredFiles: [
    { verbose_name: '腦波資料一', name: 'data1' },
    { verbose_name: '腦波資料二', name: 'data2' },
  ],
  execute: (data: any[][], customParams?: Record<string, any>) => {
    if (customParams?.playerMode === 'dual') {
      return dualMusicAnalysisCreative(data, customParams);
    }
    return musicAnalysisCreative(data, customParams);
  },
  renderReport: (result: any, customParams?: any) => {
    if (customParams?.playerMode === 'dual') {
      return renderDualMusicReportCreative(result, customParams);
    }
    return renderBrainWaveMusicReport(result, customParams);
  },
  customFields: [
    { label: '樂譜標題', fieldName: 'title', type: 'string', defaultValue: '未命名的樂譜' },
    { label: '速度 (BPM)', fieldName: 'bpm', type: 'number', defaultValue: 60 },
    { label: '拍號', fieldName: 'time_signature', type: 'string', defaultValue: '4/4' },
    { label: '高音域樂器', fieldName: 'p1', type: 'string', defaultValue: 'flute' },
    { label: '中音域樂器', fieldName: 'p2', type: 'string', defaultValue: 'piano' },
    { label: '低音域樂器', fieldName: 'p3', type: 'string', defaultValue: 'cello' },
  ],
  editComponent: EditComponent,
};

registerPlugin(plugin);
export default plugin;
