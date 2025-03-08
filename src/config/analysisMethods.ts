// src/config/analysisMethods.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_ANALYSIS_API_BASE || 'http://localhost:3000';

/**
 * 各分析方法的占位實作，根據傳入的 data 整合成 payload，
 * 並透過 axios 呼叫對應的 API endpoint。
 * 注意：此處 payload 格式與 endpoint 僅供參考，請根據實際需求調整。
 */

// 元神音：腦波影音編碼及播放系統
export async function brainFeaturesAnalysis(data: any[][]): Promise<any> {
    const payload = {
        brain_feature: {
            beforeBrainData: data[0],  // 此處請依需求進行轉換
            afterBrainData: data[1],
        },
    };
    try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/analysis/brain_features`, payload, {
            headers: {'Content-Type': 'application/json'},
        });
        return response.data;
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
        const response = await axios.post(`${API_BASE_URL}/api/v1/human_resource_data`, payload, {
            headers: {'Content-Type': 'application/json'},
        });
        return response.data;
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
        const response = await axios.post(`${API_BASE_URL}/api/v1/mindfulness`, payload, {
            headers: {'Content-Type': 'application/json'},
        });
        return response.data;
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
        const response = await axios.post(`${API_BASE_URL}/api/v1/mindfulness`, payload, {
            headers: {'Content-Type': 'application/json'},
        });
        return response.data;
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
        const response = await axios.post(`${API_BASE_URL}/api/v1/mindfulness`, payload, {
            headers: {'Content-Type': 'application/json'},
        });
        return response.data;
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
        const response = await axios.post(`${API_BASE_URL}/api/v1/talent`, payload, {
            headers: {'Content-Type': 'application/json'},
        });
        return response.data;
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
        const response = await axios.post(`${API_BASE_URL}/api/v1/analysis/sentiment`, payload, {
            headers: {'Content-Type': 'application/json'},
        });
        return response.data;
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
        const response = await axios.post(`${API_BASE_URL}/api/v1/analysis/ore`, payload, {
            headers: {'Content-Type': 'application/json'},
        });
        return response.data;
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
        const response = await axios.post(`${API_BASE_URL}/api/v1/analysis/ore`, payload, {
            headers: {'Content-Type': 'application/json'},
        });
        return response.data;
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
        const response = await axios.post(`${API_BASE_URL}/api/v1/analysis/ore`, payload, {
            headers: {'Content-Type': 'application/json'},
        });
        return response.data;
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
        const response = await axios.post(`${API_BASE_URL}/api/v1/analysis/ore`, payload, {
            headers: {'Content-Type': 'application/json'},
        });
        return response.data;
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
        const response = await axios.post(`${API_BASE_URL}/api/v1/analysis/ore`, payload, {
            headers: {'Content-Type': 'application/json'},
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// 珍寶炁：最佳炁場之礦物結晶體測試系統
export async function mineralCrystalAnalysis(data: any[][]): Promise<any> {
    const payload = {
            beforeBrainData: data[0],
            afterBrainData: data[1]
    };
    try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/analysis/ore`, payload, {
            headers: {'Content-Type': 'application/json'},
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// 情香意：最佳炁場之香氛測試系統
export async function qingxiangyiAnalysis(data: any[][]): Promise<any> {
    const payload = {
            beforeBrainData: data[0],
            afterBrainData: data[1]
    };
    try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/analysis/ore`, payload, {
            headers: {'Content-Type': 'application/json'},
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}