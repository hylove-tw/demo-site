// src/components/ReportLayout.tsx
import React from 'react';

interface CompanyInfo {
    name: string;
    address: string;
    id: string;
    phone: string;
    fax: string;
}

interface User {
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
    user: User;
    testInfo: TestInfo;
    resultContent: any;
    explanation: string;
}

export const ReportLayout: React.FC<ReportLayoutProps> = (
    {
        user,
        testInfo,
        resultContent,
        explanation,
    }) => {
    return (
        <div style={{fontFamily: 'Arial, sans-serif', lineHeight: 1.6}}>
            {/* 公司資訊區 */}
            <div>
                <h2>{user.company.name}</h2>
                <p>{user.company.address}</p>
                <p>統一編號: {user.company.id}</p>
                <p>Phone: {user.company.phone} | Fax: {user.company.fax}</p>
            </div>
            <hr/>

            {/* 測試基本資料 */}
            <div>
                <h3>測試基本資料</h3>
                <p>測試名稱: {testInfo.testName}</p>
                <p>會員編號: {user.id}</p>
                <p>測試時間: {testInfo.testTime}</p>
            </div>
            <hr/>
            {resultContent}
        </div>
    );
};