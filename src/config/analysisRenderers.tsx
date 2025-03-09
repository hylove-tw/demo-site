// 報告渲染函式（均為簡單示範，以 JSON 呈現，或顯示圖表 placeholder）
import React from "react";
import {ReportLayout} from "../components/ReportLayout";

const user = {
    id: 'U123456',
    name: '王大明',
    phone: '0912345678',
    email: 'daming@example.com',
    company: {
        name: '海纳福企業股份有限公司',
        address: '台北市內湖區港墘路221巷19號4樓',
        id: '24571198',
        phone: '+886-2-2657-6326',
        fax: '+886-2-2657-7584',
    },
};


export const renderBrainFeaturesReport = (result: any): React.ReactNode => (
    <div>
        <h3>元神音報告</h3>
        <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
);
export const renderHRReport = (result: any): React.ReactNode => {
    // 模擬測試基本資料
    const testInfo = {
        testName: result.analysisName,
        testTime: result.timestamp,
    };
    // 模擬測試結果內容
    const resultContent = (
        <div>
            <h3>測試結果</h3>
            <p>此處展示測試數據與分析結果，如情緒指數、正念指數等...</p>
            {/* 可根據需求進一步加入表格或圖表 */}
        </div>
    );

    // 模擬測試總結與解說
    const explanation = '本報告根據用戶腦波測試結果進行綜合分析，提供數據解讀與後續建議。';

    return (
        <ReportLayout
            user={user}
            testInfo={testInfo}
            resultContent={resultContent}
            explanation={explanation}
        />
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