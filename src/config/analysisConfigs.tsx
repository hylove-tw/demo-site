// src/config/analysisConfig.tsx
import React from 'react';
import {
    beverageTestAnalysis,
    musicAnalysis,
    emotionManagementAnalysis,
    hrAnalysis,
    mindfulnessLevelAnalysis,
    mindfulnessMovementAnalysis,
    mindfulnessNormalAnalysis,
    mineralCrystalAnalysis,
    musicTestAnalysis,
    perfumeTestAnalysis,
    petTestAnalysis,
    potentialAnalysis,
    videoTestAnalysis,
    qingxiangyiAnalysis
} from './analysisMethods';
import {
    renderBrainWaveMusicReport,
    renderEmotionReport,
    renderHRReport,
    renderMindfulnessReport,
    renderMineralReport,
    renderPotentialReport,
    renderQingxiangyiReport
} from './analysisRenderers';


export interface AnalysisRequiredFile {
    verbose_name: string;
    name: string;
}

export interface CustomField {
    label: string;        // 顯示名稱
    fieldName: string;    // 用來當 key
    type?: 'string' | 'number' | 'boolean';
    defaultValue?: any;   // 預設值
}

export interface AnalysisConfig {
    id: string;
    group: string;
    name: string;
    description: string;
    requiredFiles: AnalysisRequiredFile[];
    func: (data: any[][], customParams?: Record<string, any>) => Promise<any>;
    renderReport: (result: any, customParams?: any) => React.ReactNode;
    // 讓使用者自訂欄位
    customFields?: CustomField[];
    // 編輯元件，接收目前的 customParams 與 onChange callback
    editComponent?: React.FC<{
        customParams: Record<string, any>;
        onChange: (newParams: Record<string, any>) => void;
    }>;
}

export const analysisConfigs: AnalysisConfig[] = [
    {
        id: 'yuanshenyin',
        group: '',
        name: '元神音',
        description:
            '單人腦波影音編碼及播放系統，專注於個人腦波數據的動態編碼與影音展示。',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeBrainData'},
            {verbose_name: '後測資料', name: 'afterBrainData'},
        ],
        func: musicAnalysis,
        renderReport: renderBrainWaveMusicReport,
        customFields: [
            {
                label: '樂譜標題',
                fieldName: 'sheetTitle',
                type: 'string',
                defaultValue: 'My Music',
            },
            {
                label: '速度',
                fieldName: 'soundTempo',
                type: 'number',
                defaultValue: 60,
            },
        ],
        editComponent: ({customParams, onChange}) => {
            return (
                <div className="flex flex-col space-y-2 p-4 border rounded">
                    <input
                        type="text"
                        className="input input-bordered"
                        placeholder="樂譜標題"
                        value={customParams.sheetTitle ?? ""}
                        onChange={(e) =>
                            onChange({...customParams, sheetTitle: e.target.value})
                        }
                    />
                    <input
                        type="number"
                        className="input input-bordered"
                        placeholder="速度"
                        value={customParams.soundTempo ?? ""}
                        onChange={(e) =>
                            onChange({
                                ...customParams,
                                soundTempo: parseInt(e.target.value) || 0,
                            })
                        }
                    />
                </div>
            );
        },
    },
    {
        id: 'hengyunlai',
        group: '',
        name: '亨運來',
        description: 'H.R 評估系統，用於評估個人的人力資源潛能及工作適配度。',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeBrainData'},
            {verbose_name: '後測資料', name: 'afterBrainData'},
        ],
        func: hrAnalysis,
        renderReport: renderHRReport,
    },
    {
        id: 'mindei_normal',
        group: '利養炁',
        name: '正念修行',
        description: '正念修行模式，通過前測（正常睜眼）與後測（正念閉眼）的數據對比，評估身心指數。',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeBrainData'},
            {verbose_name: '後測資料', name: 'afterBrainData'},
        ],
        func: mindfulnessNormalAnalysis,
        renderReport: renderMindfulnessReport,
    },
    {
        id: 'mindei_movement',
        group: '利養炁',
        name: '練炁修行',
        description: '練炁修行模式，前測為正常睜眼，後測為運行練炁，評估能量運行狀態。',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeBrainData'},
            {verbose_name: '後測資料', name: 'afterBrainData'},
        ],
        func: mindfulnessMovementAnalysis,
        renderReport: renderMindfulnessReport,
    },
    {
        id: 'mindei_level',
        group: '利養炁',
        name: '練炁品階',
        description: '練炁品階模式，前測為正念閉眼，後測為運行練炁，評估修行層級及品質。',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeBrainData'},
            {verbose_name: '後測資料', name: 'afterBrainData'},
        ],
        func: mindfulnessLevelAnalysis,
        renderReport: renderMindfulnessReport,
    },
    {
        id: 'zhentianfu',
        group: '',
        name: '貞天賦',
        description: '潛能評估系統，通過腦波數據評估個人的潛能表現與能量分布。',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeBrainData'},
            {verbose_name: '後測資料', name: 'afterBrainData'},
        ],
        func: potentialAnalysis,
        renderReport: renderPotentialReport,
    },
    {
        id: 'emotion_management',
        group: '易',
        name: '情緒管理系統',
        description: '情緒管理系統，針對情緒狀態進行評估與管理，涵蓋多種情緒測試模式。',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeBrainData'},
            {verbose_name: '後測資料', name: 'afterBrainData'},
        ],
        func: emotionManagementAnalysis,
        renderReport: renderEmotionReport,
    },
    {
        id: 'pet_test',
        group: '易',
        name: '寵物評比測試',
        description: '透過視覺與觸覺測試，評估並匹配最適合的寵物相關指標。',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeBrainData'},
            {verbose_name: '後測資料', name: 'afterBrainData'},
        ],
        func: petTestAnalysis,
        renderReport: renderEmotionReport,
    },
    {
        id: 'beverage_test',
        group: '易',
        name: '品茶/品酒/品咖啡評比測試',
        description: '基於嗅覺與味覺評比，提供茶、酒、咖啡等飲品的評估參考。',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeBrainData'},
            {verbose_name: '後測資料', name: 'afterBrainData'},
        ],
        func: beverageTestAnalysis,
        renderReport: renderEmotionReport,
    },
    {
        id: 'perfume_test',
        group: '易',
        name: '香水評比測試',
        description: '以嗅覺為主的測試模式，評估並推薦最適合使用者的香水。',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeBrainData'},
            {verbose_name: '後測資料', name: 'afterBrainData'},
        ],
        func: perfumeTestAnalysis,
        renderReport: renderEmotionReport,
    },
    {
        id: 'music_test',
        group: '易',
        name: '音樂演奏/歌曲演唱評比測試',
        description: '針對聽覺進行的評比測試，檢視音樂表現及腦波反應。',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeBrainData'},
            {verbose_name: '後測資料', name: 'afterBrainData'},
        ],
        func: musicTestAnalysis,
        renderReport: renderEmotionReport,
    },
    {
        id: 'video_test',
        group: '易',
        name: '短視頻廣告評比測試',
        description: '綜合視覺與聽覺的評比，評估視頻廣告對情緒與認知的影響。',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeBrainData'},
            {verbose_name: '後測資料', name: 'afterBrainData'},
        ],
        func: videoTestAnalysis,
        renderReport: renderEmotionReport,
    },
    {
        id: 'zhenbaoqi',
        group: '',
        name: '珍寶炁',
        description: '最佳炁場之礦物結晶體測試系統，利用腦波與情緒數據推薦最適合的結晶體產品（台灣專利）。',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeBrainData'},
            {verbose_name: '後測資料', name: 'afterBrainData'},
        ],
        func: mineralCrystalAnalysis,
        renderReport: renderMineralReport,
    },
    {
        id: 'qingxiangyi',
        group: '',
        name: '情香意',
        description: '最佳炁場之香氛測試系統，通過腦波與情緒數據分析，推薦適合的香氛產品，並提供詳細報告與對照表。',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeBrainData'},
            {verbose_name: '後測資料', name: 'afterBrainData'},
        ],
        func: qingxiangyiAnalysis,
        renderReport: renderQingxiangyiReport,
    },
];

export const AnalysisOptions: React.FC = () => {
    // 篩選出沒有設定 group 的項目
    const noGroup = analysisConfigs.filter(fn => !fn.group || fn.group.trim() === "");
    // 篩選出有 group 的項目
    const withGroup = analysisConfigs.filter(fn => fn.group && fn.group.trim() !== "");

    // 將有 group 的項目依據 group 分組
    const grouped = withGroup.reduce((acc: Record<string, any[]>, fn) => {
        const group = fn.group!;
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(fn);
        return acc;
    }, {});

    return (
        <>
            {noGroup.map(fn => (
                <option key={fn.id} value={fn.id}>
                    {fn.name} (需 {fn.requiredFiles.length} 個檔案)
                </option>
            ))}
            {Object.entries(grouped).map(([group, funcs]) => (
                <optgroup key={group} label={group}>
                    {funcs.map(fn => (
                        <option key={fn.id} value={fn.id}>
                            {group} - {fn.name} (需 {fn.requiredFiles.length} 個檔案)
                        </option>
                    ))}
                </optgroup>
            ))}
        </>
    );
};
