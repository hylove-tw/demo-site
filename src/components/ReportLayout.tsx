// src/components/ReportLayout.tsx
import React from 'react';

interface CompanyInfo {
  name: string;
  address: string;
  id: string;
  phone: string;
  fax: string;
}

interface TestInfo {
  testName: string;
  memberId: string;
  testTime: string;
  // 其他必要欄位
}

interface TestResults {
  // 可以根據實際需求調整
  ea0?: number;
  ea1?: number;
  me?: number;
  te?: number[];
  ea?: number;
  eaDiff?: number;
}

interface RecommendedItem {
  option: string;
  products: string[];
}

interface ReportLayoutProps {
  companyInfo: CompanyInfo;
  testInfo: TestInfo;
  firstTest: TestResults;
  secondTest: TestResults;
  recommendedResults: RecommendedItem[];
  explanation: string;
}

export const ReportLayout: React.FC<ReportLayoutProps> = ({
  companyInfo,
  testInfo,
  firstTest,
  secondTest,
  recommendedResults,
  explanation,
}) => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.6 }}>
      {/* 公司資訊區 */}
      <div>
        <h2>{companyInfo.name}</h2>
        <p>{companyInfo.address}</p>
        <p>統一編號: {companyInfo.id}</p>
        <p>Phone: {companyInfo.phone} | Fax: {companyInfo.fax}</p>
      </div>
      <hr />

      {/* 測試基本資料 */}
      <div>
        <h3>測試基本資料</h3>
        <p>測試名稱: {testInfo.testName}</p>
        <p>會員編號: {testInfo.memberId}</p>
        <p>測試時間: {testInfo.testTime}</p>
      </div>
      <hr />

      {/* 第一次測試結果 */}
      <div>
        <h3>第一次測試結果</h3>
        <p>前測情緒平均值 (EA0): {firstTest.ea0}</p>
        <p>後測情緒平均值 (EA1): {firstTest.ea1}</p>
        <p>正念修行指數 (ME): {firstTest.me}</p>
        <p>質能指數 (TE): {firstTest.te ? firstTest.te.join(' / ') : '-'}</p>
      </div>
      <hr />

      {/* 第二次測試結果 */}
      <div>
        <h3>第二次測試結果</h3>
        <p>情緒平均值: {secondTest.ea}</p>
        <p>判別式計算值 (EA差值): {secondTest.eaDiff}</p>
      </div>
      <hr />

      {/* 推薦結果 */}
      <div>
        <h3>推薦結果</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }} border={1}>
          <thead>
            <tr>
              <th>選項</th>
              <th>推薦產品</th>
            </tr>
          </thead>
          <tbody>
            {recommendedResults.map((item, index) => (
              <tr key={index}>
                <td>{item.option}</td>
                <td>{item.products.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <hr />

      {/* 測試總結與解說 */}
      <div>
        <h3>測試總結與解說</h3>
        <p>{explanation}</p>
      </div>
    </div>
  );
};