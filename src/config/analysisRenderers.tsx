// 報告渲染函式（均為簡單示範，以 JSON 呈現，或顯示圖表 placeholder）
import React from "react";


export const renderBrainFeaturesReport = (result: any): React.ReactNode => (
    <div>
        <h3>元神音報告</h3>
        <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
);
export const renderHRReport = (result: any): React.ReactNode => (
    <div>
        <h3>亨運來報告</h3>
        <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
);
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
        <h3>珍寶炁報告</h3>
        <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
);

export const renderQingxiangyiReport = (result: any): React.ReactNode => (
    <div>
        <h3>情香意報告</h3>
        <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
);