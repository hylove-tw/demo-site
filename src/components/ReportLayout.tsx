// src/components/ReportLayout.tsx
import React from 'react';

export interface CompanyInfo {
    name: string;
    address: string;
    id: string;
    phone: string;
    fax: string;
    logoUrl?: string;
}

export interface UserInfo {
    id: string;
    name: string;
    phone: string;
    email: string;
}

export interface TestInfo {
    testName: string;
    testTime: string;
    bluetoothSerial?: string;
    availableBase?: string;
}


export interface ReportLayoutProps {
    company: CompanyInfo;
    user: UserInfo;
    test: TestInfo;
    explanation?: string;
    // 報告的主要內容（例如圖表、文字、EmotionReport 等）
    resultContent?: React.ReactNode;
}

const ReportLayout: React.FC<ReportLayoutProps> = (
    {
        company,
        user,
        test,
        explanation,
        resultContent,
    }
) => {
    const finalLogoUrl = company.logoUrl ?? '/hylove-logo.jpg';

    return (
        <div className="card w-full bg-base-100 shadow-xl p-6">
            {/* 報告標題 */}
            <h2 className="text-2xl font-bold mb-4">
                「{test.testName}」測試總結報告
            </h2>

            {/* 公司資訊區 */}
            <div className="mb-6 flex flex-col md:flex-row items-start space-x-4">
                {/* 固定寬度的 Logo 區塊 */}
                <div className="flex-shrink-0 w-20">
                    <img
                        src={finalLogoUrl}
                        alt="公司Logo"
                        className="w-full object-contain"
                    />
                </div>
                {/* 文字區塊 */}
                <div>
                    <h3 className="text-xl font-semibold">{company.name}</h3>
                    <p className="mt-1">{company.address}</p>
                    <p>統一編號: {company.id}</p>
                    <p>
                        Phone: {company.phone} | Fax: {company.fax}
                    </p>
                </div>
            </div>

            {/* 使用者與測試資訊 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-base-200 p-4 rounded">
                <div>
                    <p>
                        <strong>使用者ID：</strong> {user.id}
                    </p>
                    <p>
                        <strong>姓名：</strong> {user.name}
                    </p>
                    <p>
                        <strong>手機號碼：</strong> {user.phone}
                    </p>
                </div>
                <div>
                    <p>
                        <strong>E-Mail：</strong> {user.email}
                    </p>
                    <p>
                        <strong>測試時間：</strong> {test.testTime}
                    </p>
                    {test.bluetoothSerial && (
                        <p>
                            <strong>藍牙序號：</strong> {test.bluetoothSerial}
                        </p>
                    )}
                    {test.availableBase && (
                        <p>
                            <strong>可用基數：</strong> {test.availableBase}
                        </p>
                    )}
                </div>
            </div>

            {/* 報告主要內容 */}
            {resultContent && (
                <div className="mt-6">{resultContent}</div>
            )}

            {/* 報告結尾或備註 */}
            {explanation && (
                <div className="mt-4">
                    <p className="italic text-sm text-gray-600">
                        {explanation}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ReportLayout;