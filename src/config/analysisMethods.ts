// src/config/analysisMethods.ts
import { post, ApiError } from '../services/api';

// 共用 payload 結構
interface BrainDataPayload {
  beforeBrainData: any;
  afterBrainData: any;
}

// Mindfulness 分析類型
type MindfulnessType = 'normal' | 'movement' | 'level';

// ORE 評比測試類型
type OreTestType = 'pet' | 'beverage' | 'perfume' | 'music' | 'video';

// 元神音：腦波影音編碼及播放系統
export async function musicAnalysis(
  data: any[][],
  customParams?: Record<string, any>
): Promise<any> {
  const payload = {
    title: customParams?.title || '未命名的樂譜',
    bpm: customParams?.bpm || 60,
    time_signature: customParams?.time_signature || '4/4',
    p1: customParams?.p1 || 'piano',
    p2: customParams?.p2 || 'piano',
    p3: customParams?.p3 || 'piano',
    beforeBrainData: data[0],
    afterBrainData: data[1],
  };
  return post('/api/v1/music', payload);
}

// 亨運來：H.R 評估系統
export async function hrAnalysis(data: any[][]): Promise<any> {
  const payload: BrainDataPayload = {
    beforeBrainData: data[0],
    afterBrainData: data[1],
  };
  return post('/api/v1/human_resource_data', payload);
}

// 利養炁 - 正念修行：前測（正常睜眼）與後測（正念閉眼）
export async function mindfulnessNormalAnalysis(data: any[][]): Promise<any> {
  const payload = {
    type: 'normal' as MindfulnessType,
    beforeBrainData: data[0],
    afterBrainData: data[1],
  };
  return post('/api/v1/mindfulness', payload);
}

// 利養炁 - 練炁修行：前測（正常睜眼）與後測（運行練炁）
export async function mindfulnessMovementAnalysis(data: any[][]): Promise<any> {
  const payload = {
    type: 'movement' as MindfulnessType,
    beforeBrainData: data[0],
    afterBrainData: data[1],
  };
  return post('/api/v1/mindfulness', payload);
}

// 利養炁 - 練炁品階：前測（正念閉眼）與後測（運行練炁）
export async function mindfulnessLevelAnalysis(data: any[][]): Promise<any> {
  const payload = {
    type: 'level' as MindfulnessType,
    beforeBrainData: data[0],
    afterBrainData: data[1],
  };
  return post('/api/v1/mindfulness', payload);
}

// 貞天賦：潛能評估系統
export async function potentialAnalysis(data: any[][]): Promise<any> {
  const payload: BrainDataPayload = {
    beforeBrainData: data[0],
    afterBrainData: data[1],
  };
  return post('/api/v1/talent', payload);
}

// 易 - 情緒管理系統
export async function emotionManagementAnalysis(data: any[][]): Promise<any> {
  const payload: BrainDataPayload = {
    beforeBrainData: data[0],
    afterBrainData: data[1],
  };
  return post('/api/v1/analysis/sentiment', payload);
}

// 易 - 寵物評比測試（視覺、觸覺）
export async function petTestAnalysis(data: any[][]): Promise<any> {
  const payload = {
    type: 'pet' as OreTestType,
    beforeBrainData: data[0],
    afterBrainData: data[1],
  };
  return post('/api/v1/analysis/ore', payload);
}

// 易 - 品茶/品酒/品咖啡評比測試（嗅覺、味覺）
export async function beverageTestAnalysis(data: any[][]): Promise<any> {
  const payload = {
    type: 'beverage' as OreTestType,
    beforeBrainData: data[0],
    afterBrainData: data[1],
  };
  return post('/api/v1/analysis/ore', payload);
}

// 易 - 香水評比測試（嗅覺）
export async function perfumeTestAnalysis(data: any[][]): Promise<any> {
  const payload = {
    type: 'perfume' as OreTestType,
    beforeBrainData: data[0],
    afterBrainData: data[1],
  };
  return post('/api/v1/analysis/ore', payload);
}

// 易 - 音樂演奏/歌曲演唱評比測試（聽覺）
export async function musicTestAnalysis(data: any[][]): Promise<any> {
  const payload = {
    type: 'music' as OreTestType,
    beforeBrainData: data[0],
    afterBrainData: data[1],
  };
  return post('/api/v1/analysis/ore', payload);
}

// 易 - 短視頻廣告評比測試（視覺、聽覺）
export async function videoTestAnalysis(data: any[][]): Promise<any> {
  const payload = {
    type: 'video' as OreTestType,
    beforeBrainData: data[0],
    afterBrainData: data[1],
  };
  return post('/api/v1/analysis/ore', payload);
}

// 珍寶炁：最佳炁場之礦物結晶體測試系統（兩階段）
export async function treasureAnalysis(data: any[][]): Promise<any> {
  const payload1: BrainDataPayload = {
    beforeBrainData: data[0],
    afterBrainData: data[1],
  };

  // Stage 1
  const stage1Data = await post('/api/v1/treasure/stage1', payload1);

  // 驗證 stage1 回傳必要欄位
  if (!stage1Data.ea0_timing_diagram || !stage1Data.ea1_timing_diagram) {
    throw new ApiError('第一階段分析回傳資料不完整', undefined);
  }

  // Stage 2
  const payload2 = {
    ea_before_timing_diagram: stage1Data.ea0_timing_diagram,
    ea_after_timing_diagram: stage1Data.ea1_timing_diagram,
    wear_ea: stage1Data.wear_ea,
    pillow_ea: stage1Data.pillow_ea,
  };

  const stage2Response = await post('/api/v1/treasure/stage2', payload2);
  const stage2Data = stage2Response.stage2 || stage2Response;

  return {
    ...stage1Data,
    ...stage2Data,
  };
}

// 情香意：最佳炁場之香氛測試系統（兩階段）
export async function perfumeAnalysis(data: any[][]): Promise<any> {
  const payload1: BrainDataPayload = {
    beforeBrainData: data[0],
    afterBrainData: data[1],
  };

  // Stage 1
  const stage1Data = await post('/api/v1/perfume/stage1', payload1);

  // 驗證 stage1 回傳必要欄位
  if (!stage1Data.ea0_timing_diagram || !stage1Data.ea1_timing_diagram) {
    throw new ApiError('第一階段分析回傳資料不完整', undefined);
  }

  if (!stage1Data.te_comment?.te1?.fragrances || !stage1Data.te_comment?.te1?.brands) {
    throw new ApiError('第一階段分析缺少香氛資料', undefined);
  }

  // Stage 2
  const payload2 = {
    ea_before_timing_diagram: stage1Data.ea0_timing_diagram,
    ea_after_timing_diagram: stage1Data.ea1_timing_diagram,
    fragrances: stage1Data.te_comment.te1.fragrances,
    brands: stage1Data.te_comment.te1.brands,
  };

  const stage2Response = await post('/api/v1/perfume/stage2', payload2);
  const stage2Data = stage2Response.stage2 || stage2Response;

  return {
    ...stage1Data,
    ...stage2Data,
  };
}

// 腦波欄位名稱對應
const BRAINWAVE_FIELDS = [
  'Good Signal Quality(0-100)',
  'Attention',
  'Meditation',
  'Delta',
  'Theta',
  'Low Alpha',
  'High Alpha',
  'Low Beta',
  'High Beta',
  'Low Gamma',
  'High Gamma',
];

// 將腦波資料陣列轉換為 API 需要的格式
function transformBrainData(data: any): Record<string, number[]> {
  const result: Record<string, number[]> = {};

  // 確保 data 是陣列
  if (!Array.isArray(data)) {
    console.error('transformBrainData: data is not an array', data);
    // 回傳空陣列作為預設值
    for (const field of BRAINWAVE_FIELDS) {
      result[field] = [];
    }
    return result;
  }

  // 取最多 30 筆資料
  const limitedData = data.slice(0, 30);

  for (const field of BRAINWAVE_FIELDS) {
    result[field] = limitedData.map(row => {
      const value = row?.[field];
      return typeof value === 'number' ? value : parseFloat(value) || 0;
    });
  }

  return result;
}

// 雙人腦波音樂：生成雙人腦波音樂譜
export async function dualMusicAnalysis(
  data: any[][],
  customParams?: Record<string, any>
): Promise<any> {
  const payload = {
    title: customParams?.title || '未命名的樂譜',
    bpm: customParams?.bpm || 60,
    time_signature: customParams?.time_signature || '4/4',
    first_player: {
      instrument: {
        p1: customParams?.first_p1 || 'piano',
        p2: customParams?.first_p2 || 'piano',
        p3: customParams?.first_p3 || 'piano',
      },
      ...transformBrainData(data[0]),
    },
    second_player: {
      instrument: {
        p1: customParams?.second_p1 || 'piano',
        p2: customParams?.second_p2 || 'piano',
        p3: customParams?.second_p3 || 'piano',
      },
      ...transformBrainData(data[1]),
    },
  };
  return post('/api/v1/dualmusic', payload);
}
