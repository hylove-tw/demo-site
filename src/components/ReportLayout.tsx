// src/components/ReportLayout.tsx
import React from 'react';

interface CompanyInfo {
    name: string;
    address: string;
    id: string;
    phone: string;
    fax: string;
}

interface MemberInfo {
    id: string;
    name: string;
    phone: string;
    email: string;
    company: CompanyInfo;
}

interface TestInfo {
    testName: string;
    testTime: string;
    // 其他必要欄位
}

interface ReportLayoutProps {
    memberInfo: MemberInfo;
    testInfo: TestInfo;
    resultContent: any;
    explanation: string;
}

export const ReportLayout: React.FC<ReportLayoutProps> = (
    {
        memberInfo,
        testInfo,
        resultContent,
        explanation,
    }) => {
    return (
        <div style={{fontFamily: 'Arial, sans-serif', lineHeight: 1.6}}>
            {/* 公司資訊區 */}
            <div>
                <h2>{memberInfo.company.name}</h2>
                <p>{memberInfo.company.address}</p>
                <p>統一編號: {memberInfo.company.id}</p>
                <p>Phone: {memberInfo.company.phone} | Fax: {memberInfo.company.fax}</p>
            </div>
            <hr/>

            {/* 測試基本資料 */}
            <div>
                <h3>測試基本資料</h3>
                <p>測試名稱: {testInfo.testName}</p>
                <p>會員編號: {memberInfo.id}</p>
                <p>測試時間: {testInfo.testTime}</p>
            </div>
            <hr/>
            {resultContent}
        </div>
    );
};