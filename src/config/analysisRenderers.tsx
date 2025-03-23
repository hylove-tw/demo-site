import React from 'react';
import MusicEmbed from "../components/MusicEmbed";

export interface MusicReportCustomParams {
    sheetTitle?: string;
    soundTempo?: number;
}

/**
 * renderBrainWaveMusicReport:
 * 1. 根據 customParams (sheetTitle 與 soundTempo) 更新 musicXML 內容，
 * 2. 傳入更新後的 XML 給 MusicEmbed 顯示，
 * 3. 如果 customParams 未提供則使用預設值。
 */
export const renderBrainWaveMusicReport = (
    musicXML: string,
    customParams?: MusicReportCustomParams
): React.ReactNode => {
    // 預設值
    const title = customParams?.sheetTitle || "未命名樂譜";
    const bpm = customParams?.soundTempo || 60;

    // 使用 DOMParser 解析原始 musicXML
    const parser = new DOMParser();
    const serializer = new XMLSerializer();
    const xmlDoc = parser.parseFromString(musicXML, "text/xml");

    // 更新樂譜標題
    const titleElems = xmlDoc.getElementsByTagName("movement-title");
    if (titleElems.length > 0) {
        titleElems[0].textContent = title;
    }

    // 更新 BPM：修改 <per-minute> 與 <sound> 的 tempo 屬性
    if (bpm > 0) {
        const perMinuteElems = xmlDoc.getElementsByTagName("per-minute");
        if (perMinuteElems.length > 0) {
            perMinuteElems[0].textContent = bpm.toString();
        }
        const soundElems = xmlDoc.getElementsByTagName("sound");
        if (soundElems.length > 0) {
            soundElems[0].setAttribute("tempo", bpm.toString());
        }
    }

    // 產生更新後的 XML 字串
    const newXml = serializer.serializeToString(xmlDoc);

    return (
        <div className="p-4">
            <MusicEmbed musicXML={newXml} height="500px"/>
        </div>
    );
};

export const renderHRReport = (result: any): React.ReactNode => {
    // 模擬測試結果內容
    return (
        <div>
            <h3>測試結果</h3>
            <p>此處展示測試數據與分析結果，如情緒指數、正念指數等...</p>
            {/* 可根據需求進一步加入表格或圖表 */}
        </div>
    );
}

export const renderMindfulnessReport = (result: any): React.ReactNode => (
    <div>
        <h3>利養炁報告</h3>
        <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
);
export const renderPotentialReport = (result: any): React.ReactNode => (
    <div>
        <h3>貞天賦報告</h3>
        <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
);
export const renderEmotionReport = (result: any): React.ReactNode => (
    <div>
        <h3>易 Motion 報告</h3>
        <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
);
export const renderMineralReport = (result: any): React.ReactNode => (
    <div>
        <h3>礦物報告</h3>
        <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
);
export const renderQingxiangyiReport = (result: any): React.ReactNode => (
    <div>
        <h3>情香意報告</h3>
        <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
);