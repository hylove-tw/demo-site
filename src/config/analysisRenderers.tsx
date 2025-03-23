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