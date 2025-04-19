import React from 'react';
import MusicEmbed from "../components/MusicEmbed";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

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
    // 解構 result 中的主要欄位
    const {
        TEScore,
        TEScore_report,
        EM_report,
        sentimentBeforeAvg,
        sentimentAfterAvg,
        delta,
        theta,
        lowAlpha,
        highAlpha,
        lowBeta,
        highBeta,
        lowGamma,
        highGamma,
        ranking_report = [],
    } = result;

    return (
        <div className="p-4">

            {/* 總體分數區域 */}
            <div className="mb-4">
                <h3 className="text-xl font-semibold">總體職能評估 TE</h3>
                <p className="mt-2">
                    分數：<strong>{TEScore}</strong>
                </p>
                <p>{TEScore_report?.te_score_remark_tw}</p>
            </div>

            {/* 情緒報告區域 */}
            <div className="mb-4">
                <h3 className="text-xl font-semibold">情緒評估</h3>
                <p>
                    前測平均：<strong>{sentimentBeforeAvg}</strong>，後測平均：<strong>{sentimentAfterAvg}</strong>
                </p>
                <p>
                    分數：<strong>{EM_report?.score}</strong>
                </p>
                <p>{EM_report?.em_remark_tw}</p>
            </div>

            {/* 主要維度區域（delta、theta、lowAlpha...） */}
            <div className="mb-4">
                <h3 className="text-xl font-semibold">各維度簡要</h3>
                <table className="table w-full">
                    <thead>
                    <tr>
                        <th>維度</th>
                        <th>評分</th>
                        <th>備註</th>
                        <th>預測</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* 領導統御 */}
                    <tr>
                        <td>{delta?.title}</td>
                        <td>{delta?.comment}</td>
                        <td>{delta?.comment_remark_tw}</td>
                        <td>{delta?.predict}</td>
                    </tr>
                    {/* 創新發展 */}
                    <tr>
                        <td>{theta?.title}</td>
                        <td>{theta?.comment}</td>
                        <td>{theta?.comment_remark_tw}</td>
                        <td>{theta?.predict}</td>
                    </tr>
                    {/* 研發整合 */}
                    <tr>
                        <td>{lowAlpha?.title}</td>
                        <td>{lowAlpha?.comment}</td>
                        <td>{lowAlpha?.comment_remark_tw}</td>
                        <td>{lowAlpha?.predict}</td>
                    </tr>
                    {/* 人事行政 */}
                    <tr>
                        <td>{highAlpha?.title}</td>
                        <td>{highAlpha?.comment}</td>
                        <td>{highAlpha?.comment_remark_tw}</td>
                        <td>{highAlpha?.predict}</td>
                    </tr>
                    {/* 業務拓展 */}
                    <tr>
                        <td>{lowBeta?.title}</td>
                        <td>{lowBeta?.comment}</td>
                        <td>{lowBeta?.comment_remark_tw}</td>
                        <td>{lowBeta?.predict}</td>
                    </tr>
                    {/* 公關行銷 */}
                    <tr>
                        <td>{highBeta?.title}</td>
                        <td>{highBeta?.comment}</td>
                        <td>{highBeta?.comment_remark_tw}</td>
                        <td>{highBeta?.predict}</td>
                    </tr>
                    {/* 生產管理 */}
                    <tr>
                        <td>{lowGamma?.title}</td>
                        <td>{lowGamma?.comment}</td>
                        <td>{lowGamma?.comment_remark_tw}</td>
                        <td>{lowGamma?.predict}</td>
                    </tr>
                    {/* 任務執行 */}
                    <tr>
                        <td>{highGamma?.title}</td>
                        <td>{highGamma?.comment}</td>
                        <td>{highGamma?.comment_remark_tw}</td>
                        <td>{highGamma?.predict}</td>
                    </tr>
                    </tbody>
                </table>
            </div>

            {/* 排名報告區域 */}
            <div className="mb-4">
                <h3 className="text-xl font-semibold">排名報告（由高到低）</h3>
                <table className="table w-full">
                    <thead>
                    <tr>
                        <th>維度</th>
                        <th>評分</th>
                        <th>備註</th>
                        <th>預測</th>
                    </tr>
                    </thead>
                    <tbody>
                    {ranking_report.map((item: any, idx: number) => (
                        <tr key={idx}>
                            <td>{item.title}</td>
                            <td>{item.comment}</td>
                            <td>{item.comment_remark_tw}</td>
                            <td>{item.predict}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* 附加：JSON 原始資料（除錯用） */}
            <details className="collapse border border-base-300 bg-base-100 rounded-box">
                <summary className="collapse-title text-sm font-medium">
                    顯示原始資料（除錯用）
                </summary>
                <div className="collapse-content">
          <pre className="whitespace-pre-wrap text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
                </div>
            </details>
        </div>
    );
};

export interface MindfulnessReportData {
    practiceType: string;
    practiceLevel: string;
    bodyMind: { comment: string; type: string };
    vitality: { comment: string; type: string };
    delta: { comment: string; type: string };
    theta: { comment: string; type: string };
    lowAlpha: { comment: string; type: string };
    highAlpha: { comment: string; type: string };
    lowBeta: { comment: string; type: string };
    highBeta: { comment: string; type: string };
    lowGamma: { comment: string; type: string };
    highGamma: { comment: string; type: string };
    en?: any; // 留作未來擴充
}

export const renderMindfulnessReport = (result: MindfulnessReportData): React.ReactNode => {
    // 將要渲染的區塊依序放在這裡
    const sections: Array<[string, { comment: string; type: string }]> = [
        ['身心狀態', result.bodyMind],
        ['元氣狀態', result.vitality],
        ['Delta 頻段', result.delta],
        ['Theta 頻段', result.theta],
        ['低 Alpha 頻段', result.lowAlpha],
        ['高 Alpha 頻段', result.highAlpha],
        ['低 Beta 頻段', result.lowBeta],
        ['高 Beta 頻段', result.highBeta],
        ['低 Gamma 頻段', result.lowGamma],
        ['高 Gamma 頻段', result.highGamma],
    ];

    return (
        <div className="p-6 space-y-6">
            {/* 報告標題 */}
            <h2 className="text-3xl font-bold">利養炁報告</h2>

            {/* 修行類型與等級 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="card bg-base-100 shadow p-4">
                    <h3 className="text-lg font-semibold">修行類型</h3>
                    <p className="mt-2">{result.practiceType}</p>
                </div>
                <div className="card bg-base-100 shadow p-4">
                    <h3 className="text-lg font-semibold">修行等級</h3>
                    <p className="mt-2">{result.practiceLevel}</p>
                </div>
            </div>

            {/* 各頻段與身心／元氣詳細 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map(([title, info]) => (
                    <div key={title} className="card bg-base-100 shadow p-4">
                        <h4 className="text-md font-medium mb-2">{title}</h4>
                        <p className="text-sm mb-1">{info.comment}</p>
                        <p className="text-xs text-gray-500">{info.type}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
export const renderPotentialReport = (result: any): React.ReactNode => {
    const fields = [
        result.delta,
        result.theta,
        result.lowAlpha,
        result.highAlpha,
        result.lowBeta,
        result.highBeta,
        result.lowGamma,
        result.highGamma,
    ];

    return (
        <div className="p-4 space-y-6">
            <h3 className="text-2xl font-bold mb-4">貞天賦報告</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-base-100 shadow-md p-4">
                    <h4 className="text-lg font-semibold">情緒分析</h4>
                    <p className="text-sm">情緒前平均：{result.sentimentBeforeAvg}</p>
                    <p className="text-sm">情緒後平均：{result.sentimentAfterAvg}</p>
                    <p className="text-sm font-medium">情緒評語：{result.EM_report.em_remark_tw}</p>
                </div>

                <div className="card bg-base-100 shadow-md p-4">
                    <h4 className="text-lg font-semibold">總能量 TE</h4>
                    <p className="text-sm">分數：{result.TEScore}</p>
                    <p className="text-sm font-medium">評語：{result.TEScore_report.te_score_remark_tw}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field, idx) => (
                    <div key={idx} className="card bg-base-100 shadow p-4">
                        <h5 className="font-bold text-lg">{field.title} ({field.comment})</h5>
                        <p className="text-sm">{field.comment_remark_tw}</p>
                        <p className="text-xs text-gray-500">潛能預測：{field.predict} - {field.predit_remark_tw}</p>
                    </div>
                ))}
            </div>

            <div className="card bg-base-100 shadow-md p-4 mt-6">
                <h4 className="text-lg font-semibold mb-2">能力排名（強到弱）</h4>
                <ol className="list-decimal list-inside space-y-1">
                    {result.ranking_report.map((item: any, idx: number) => (
                        <li key={idx}>
                            <span className="font-semibold">{item.title} ({item.comment})：</span>
                            {item.comment_remark_tw}
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
};
export const renderEmotionReport = (result: any): React.ReactNode => {
    const beforeScores = result.sentimentBefore.data.map((d: any) => d.score);
    const afterScores = result.sentimentAfter.data.map((d: any) => d.score);
    const categories = result.sentimentBefore.data.map((_: any, i: number) => `T ${i + 1}`);

    const options: Highcharts.Options = {
        chart: {
            type: 'column',
        },
        title: {
            text: '易 Motion 情緒指數前後測比較圖',
        },
        xAxis: {
            categories,
            title: {text: '測試樣本'},
        },
        yAxis: {
            min: -5,
            max: 5,
            title: {
                text: '情緒指數',
            },
            plotLines: [
                {
                    value: result.sentimentBefore.sentimentAvg,
                    color: '#f87171',
                    width: 1,
                    dashStyle: 'ShortDash',
                    label: {
                        text: `前測平均: ${result.sentimentBefore.sentimentAvg}`,
                        align: 'right',
                        style: {color: '#f87171'},
                    },
                },
                {
                    value: result.sentimentAfter.sentimentAvg,
                    color: '#60a5fa',
                    width: 1,
                    dashStyle: 'ShortDash',
                    label: {
                        text: `後測平均: ${result.sentimentAfter.sentimentAvg}`,
                        align: 'right',
                        style: {color: '#60a5fa'},
                    },
                },
            ],
        },
        tooltip: {
            shared: true,
            valueSuffix: '',
        },
        plotOptions: {
            column: {
                grouping: true,
                shadow: false,
            },
        },
        series: [
            {
                name: result.sentimentBefore.name,
                data: beforeScores,
                type: 'column',
                color: '#f87171',
            },
            {
                name: result.sentimentAfter.name,
                data: afterScores,
                type: 'column',
                color: '#60a5fa',
            },
        ],
    };

    return (
        <div className="p-4">
            <h3 className="text-xl font-semibold mb-4">易 Motion 報告</h3>
            <HighchartsReact highcharts={Highcharts} options={options}/>
        </div>
    );
};

export interface MineralReportData {
    delta: string;
    theta: string;
    lowAlpha: string;
    highAlpha: string;
    lowBeta: string;
    highBeta: string;
    lowGamma: string;
    highGamma: string;
}

export const renderMineralReport = (result: MineralReportData): React.ReactNode => {
    const sections: Array<[string, string]> = [
        ['Delta 頻段', result.delta],
        ['Theta 頻段', result.theta],
        ['低 Alpha 頻段', result.lowAlpha],
        ['高 Alpha 頻段', result.highAlpha],
        ['低 Beta 頻段', result.lowBeta],
        ['高 Beta 頻段', result.highBeta],
        ['低 Gamma 頻段', result.lowGamma],
        ['高 Gamma 頻段', result.highGamma],
    ];

    return (
        <div className="p-6 space-y-6">
            {/* 報告標題 */}
            <h2 className="text-3xl font-bold">礦物報告</h2>

            {/* 各頻段效果卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {sections.map(([title, comment]) => (
                    <div key={title} className="card bg-base-100 shadow-md p-4">
                        <h4 className="text-lg font-medium mb-2">{title}</h4>
                        <p className="text-sm text-gray-700">{comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
export const renderQingxiangyiReport = (result: any): React.ReactNode => (
    <div>
        <h3>情香意報告</h3>
        <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
);