// src/config/analysisMethods.ts
import { post } from '../services/api';

/**
 * 各分析方法的占位實作，根據傳入的 data 整合成 payload，
 * 並透過 axios 呼叫對應的 API endpoint。
 * 注意：此處 payload 格式與 endpoint 僅供參考，請根據實際需求調整。
 */

// 元神音：腦波影音編碼及播放系統
export async function musicAnalysis(data: any[][]): Promise<any> {
    const payload = {
            beforeBrainData: data[0],
            afterBrainData: data[1],
    };
    try {
        return await post('/api/v1/music', payload);
    } catch (error) {
        throw error;
    }
}

// 亨運來：H.R 評估系統
export async function hrAnalysis(data: any[][]): Promise<any> {
    const payload = {
        beforeBrainData: data[0],
        afterBrainData: data[1],
    };
    try {
        return await post('/api/v1/human_resource_data', payload);
    } catch (error) {
        throw error;
    }
}

// 利養炁 - 正念修行：前測（正常睜眼）與後測（正念閉眼）
export async function mindfulnessNormalAnalysis(data: any[][]): Promise<any> {
    const payload = {
        // find data object name which is same as the payload object name
        beforeBrainData: data[0],
        afterBrainData: data[1]
    };
    try {
        return await post('/api/v1/mindfulness', payload);
    } catch (error) {
        throw error;
    }
}

// 利養炁 - 練炁修行：前測（正常睜眼）與後測（運行練炁）
export async function mindfulnessMovementAnalysis(data: any[][]): Promise<any> {
    const payload = {
        beforeBrainData: data[0],
        afterBrainData: data[1]
    };
    try {
        return await post('/api/v1/mindfulness', payload);
    } catch (error) {
        throw error;
    }
}

// 利養炁 - 練炁品階：前測（正念閉眼）與後測（運行練炁）
export async function mindfulnessLevelAnalysis(data: any[][]): Promise<any> {
    const payload = {
        beforeBrainData: data[0],
        afterBrainData: data[1]
    };
    try {
        // 此 endpoint 可根據實際 API 文件修改
        return await post('/api/v1/mindfulness', payload);
    } catch (error) {
        throw error;
    }
}

// 貞天賦：潛能評估系統
export async function potentialAnalysis(data: any[][]): Promise<any> {
    const payload = {
        beforeBrainData: data[0],
        afterBrainData: data[1]
    };
    try {
        return await post('/api/v1/talent', payload);
    } catch (error) {
        throw error;
    }
}

// 易 - 情緒管理系統
export async function emotionManagementAnalysis(data: any[][]): Promise<any> {
    const payload = {
            beforeBrainData: data[0],
            afterBrainData: data[1]
    };
    try {
        return await post('/api/v1/analysis/sentiment', payload);
    } catch (error) {
        throw error;
    }
}

// 易 - 寵物評比測試（視覺、觸覺）
export async function petTestAnalysis(data: any[][]): Promise<any> {
    const payload = {
            beforeBrainData: data[0],
            afterBrainData: data[1]
    };
    try {
        // 假設此端點用於此測試模式
        return await post('/api/v1/analysis/ore', payload);
    } catch (error) {
        throw error;
    }
}

// 易 - 品茶/品酒/品咖啡評比測試（嗅覺、味覺）
export async function beverageTestAnalysis(data: any[][]): Promise<any> {
    const payload = {
            beforeBrainData: data[0],
            afterBrainData: data[1]
    };
    try {
        return await post('/api/v1/analysis/ore', payload);
    } catch (error) {
        throw error;
    }
}

// 易 - 香水評比測試（嗅覺）
export async function perfumeTestAnalysis(data: any[][]): Promise<any> {
    const payload = {
            beforeBrainData: data[0],
            afterBrainData: data[1]
    };
    try {
        return await post('/api/v1/analysis/ore', payload);
    } catch (error) {
        throw error;
    }
}

// 易 - 音樂演奏/歌曲演唱評比測試（聽覺）
export async function musicTestAnalysis(data: any[][]): Promise<any> {
    const payload = {
            beforeBrainData: data[0],
            afterBrainData: data[1]
    };
    try {
        return await post('/api/v1/analysis/ore', payload);
    } catch (error) {
        throw error;
    }
}

// 易 - 短視頻廣告評比測試（視覺、聽覺）
export async function videoTestAnalysis(data: any[][]): Promise<any> {
    const payload = {
            beforeBrainData: data[0],
            afterBrainData: data[1]
    };
    try {
        return await post('/api/v1/analysis/ore', payload);
    } catch (error) {
        throw error;
    }
}

// 珍寶炁：最佳炁場之礦物結晶體測試系統
export async function treasureAnalysis(data: any[][]): Promise<any> {
  const payload1 = { beforeBrainData: data[0], afterBrainData: data[1] };
  // 1) stage1
  const stage1 = await post('/api/v1/treasure/stage1', payload1);
  // 2) 以下依 PDF，te_score、te_comment、ea0、ea1、me_score 都在 stage1 回傳
  //    假設 stage1 已含 { te_scores, te_comments, ea0, ea1, me_score }
  const stage1Data = stage1;

  // 3) stage2：時序圖 + wear_ea + pillow_ea
  const payload2 = {
    ea_before_timing_diagram: stage1Data.ea0_timing_diagram,
    ea_after_timing_diagram: stage1Data.ea1_timing_diagram,
    wear_ea: stage1Data.wear_ea,
    pillow_ea: stage1Data.pillow_ea,
  };
  const stage2 = await post('/api/v1/treasure/stage2', payload2);
  const stage2Data = stage2.stage2 || stage2;

  // 合併回傳
  return {
    ...stage1Data,
    ...stage2Data,
  };
}

// 情香意：最佳炁場之香氛測試系統
export async function perfumeAnalysis(data: any[][]): Promise<any> {
  const payload1 = { beforeBrainData: data[0], afterBrainData: data[1] };
  const stage1 = await post('/api/v1/perfume/stage1', payload1);
  const s1 = stage1;
  // 第二階段
  const payload2 = {
    ea_before_timing_diagram: s1.ea0_timing_diagram,
    ea_after_timing_diagram: s1.ea1_timing_diagram,
    // perfume 特有
    fragrances: s1.te_comment.te1.fragrances,
    brands: s1.te_comment.te1.brands,
  };
  const stage2 = await post('/api/v1/perfume/stage2', payload2);
  const s2 = stage2.stage2 || stage2;
  return { ...s1, ...s2 };
}