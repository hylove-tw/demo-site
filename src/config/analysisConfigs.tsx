// src/config/analysisConfig.ts
import React from 'react';
import {
    beverageTestAnalysis,
    brainFeaturesAnalysis,
    emotionManagementAnalysis,
    hrAnalysis,
    mindfulnessLevelAnalysis,
    mindfulnessMovementAnalysis,
    mindfulnessNormalAnalysis, mineralCrystalAnalysis,
    musicTestAnalysis,
    perfumeTestAnalysis,
    petTestAnalysis,
    potentialAnalysis,
    videoTestAnalysis
} from "./analysisMethods";
import {
    renderBrainFeaturesReport, renderEmotionReport,
    renderHRReport,
    renderMindfulnessReport, renderMineralReport,
    renderPotentialReport
} from "./analysisRenderers"; // 若你有定義型別，可從這裡匯入，否則直接定義如下：


// 定義單一檔案需求型別
export interface AnalysisRequiredFile {
    verbose_name: string;
    name: string;
}

// 定義整個分析功能設定型別
export interface AnalysisFunctionConfig {
    id: string;
    name: string;
    requiredFiles: AnalysisRequiredFile[];
    func: (data: any[][]) => Promise<any>;
    renderReport: (result: any) => React.ReactNode;
}



// 分析功能設定陣列
export const analysisConfigs: AnalysisFunctionConfig[] = [
    {
        id: 'yuanshenyin',
        name: '元神音 - 腦波影音編碼及播放系統',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeData'},
            {verbose_name: '後測資料', name: 'afterData'},
        ],
        func: brainFeaturesAnalysis,
        renderReport: renderBrainFeaturesReport,
    },
    {
        id: 'hengyunlai',
        name: '亨運來 - H.R 評估系統',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeData'},
            {verbose_name: '後測資料', name: 'afterData'},
        ],
        func: hrAnalysis,
        renderReport: renderHRReport,
    },
    {
        id: 'mindei_normal',
        name: '利養炁 - 正念修行 (前測: 正常睜眼, 後測: 正念閉眼)',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeData'},
            {verbose_name: '後測資料', name: 'afterData'},
        ],
        func: mindfulnessNormalAnalysis,
        renderReport: renderMindfulnessReport,
    },
    {
        id: 'mindei_movement',
        name: '利養炁 - 練炁修行 (前測: 正常睜眼, 後測: 運行練炁)',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeData'},
            {verbose_name: '後測資料', name: 'afterData'},
        ],
        func: mindfulnessMovementAnalysis,
        renderReport: renderMindfulnessReport,
    },
    {
        id: 'mindei_level',
        name: '利養炁 - 練炁品階 (前測: 正念閉眼, 後測: 運行練炁)',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeData'},
            {verbose_name: '後測資料', name: 'afterData'},
        ],
        func: mindfulnessLevelAnalysis,
        renderReport: renderMindfulnessReport,
    },
    {
        id: 'zhentianfu',
        name: '貞天賦 - 潛能評估系統',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeData'},
            {verbose_name: '後測資料', name: 'afterData'},
        ],
        func: potentialAnalysis,
        renderReport: renderPotentialReport,
    },
    {
        id: 'emotion_management',
        name: '易 - 情緒管理系統',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeData'},
            {verbose_name: '後測資料', name: 'afterData'},
        ],
        func: emotionManagementAnalysis,
        renderReport: renderEmotionReport,
    },
    {
        id: 'pet_test',
        name: '易 - 寵物評比測試 (視覺觸覺)',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeData'},
            {verbose_name: '後測資料', name: 'afterData'},
        ],
        func: petTestAnalysis,
        renderReport: renderEmotionReport,
    },
    {
        id: 'beverage_test',
        name: '易 - 品茶/品酒/品咖啡評比測試 (嗅覺味覺)',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeData'},
            {verbose_name: '後測資料', name: 'afterData'},
        ],
        func: beverageTestAnalysis,
        renderReport: renderEmotionReport,
    },
    {
        id: 'perfume_test',
        name: '易 - 香水評比測試 (嗅覺)',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeData'},
            {verbose_name: '後測資料', name: 'afterData'},
        ],
        func: perfumeTestAnalysis,
        renderReport: renderEmotionReport,
    },
    {
        id: 'music_test',
        name: '易 - 音樂演奏/歌曲演唱評比測試 (聽覺)',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeData'},
            {verbose_name: '後測資料', name: 'afterData'},
        ],
        func: musicTestAnalysis,
        renderReport: renderEmotionReport,
    },
    {
        id: 'video_test',
        name: '易 - 短視頻廣告評比測試 (視覺聽覺)',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeData'},
            {verbose_name: '後測資料', name: 'afterData'},
        ],
        func: videoTestAnalysis,
        renderReport: renderEmotionReport,
    },
    {
        id: 'zhenbaoqi',
        name: '珍寶炁 - 最佳炁場之礦物結晶體',
        requiredFiles: [
            {verbose_name: '前測資料', name: 'beforeData'},
            {verbose_name: '後測資料', name: 'afterData'},
        ],
        func: mineralCrystalAnalysis,
        renderReport: renderMineralReport,
    },
];
