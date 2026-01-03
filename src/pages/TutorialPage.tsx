// src/pages/TutorialPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CORE_FEATURES,
  MORE_FEATURES,
  SYSTEM_STATS,
  QUICK_START_STEPS,
  GUIDE_SECTIONS,
  FAQ_ITEMS,
  CollapseItem,
  FeatureCard,
} from '../config/tutorialData';

// 通用元件
const InfoAlert: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="alert alert-info">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span>{children}</span>
  </div>
);

const FeatureCardComponent: React.FC<FeatureCard> = ({ badge, badgeColor = 'primary', title, description }) => (
  <div className="card bg-base-200">
    <div className="card-body">
      <h4 className="card-title text-base">
        <span className={`badge badge-${badgeColor}`}>{badge}</span>
        {title}
      </h4>
      <p className="text-sm text-base-content/70">{description}</p>
    </div>
  </div>
);

const CollapseGroup: React.FC<{ items: CollapseItem[]; name: string }> = ({ items, name }) => (
  <div className="space-y-4">
    {items.map((item, i) => (
      <div key={i} className="collapse collapse-plus bg-base-200">
        <input type="radio" name={name} defaultChecked={i === 0} />
        <div className="collapse-title font-medium">{item.title}</div>
        <div className="collapse-content">{item.content}</div>
      </div>
    ))}
  </div>
);

const Card: React.FC<{ title: string; titleSize?: string; children: React.ReactNode }> = ({
  title,
  titleSize = 'text-xl',
  children
}) => (
  <div className="card bg-base-100 shadow-md">
    <div className="card-body">
      <h2 className={`card-title ${titleSize} mb-4`}>{title}</h2>
      {children}
    </div>
  </div>
);

// 頁面區塊
const WhatIsSection: React.FC = () => (
  <Card title="What is HyLove?" titleSize="text-2xl">
    <div className="space-y-6">
      <p className="text-lg">
        HyLove 是一套專業的<strong>腦波分析系統</strong>，透過先進的演算法將腦波資料轉換為有意義的分析報告，
        協助您了解大腦活動模式並獲得深入的洞察。
      </p>

      <InfoAlert>所有資料都儲存在您的瀏覽器中，確保隱私安全。</InfoAlert>

      <h3 className="text-xl font-semibold mt-8">核心功能</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {CORE_FEATURES.map((feature, i) => (
          <FeatureCardComponent key={i} {...feature} />
        ))}
      </div>

      <h3 className="text-xl font-semibold mt-8">更多分析功能</h3>
      <CollapseGroup items={MORE_FEATURES} name="feature-accordion" />

      <h3 className="text-xl font-semibold mt-8">系統特色</h3>
      <div className="grid gap-3 md:grid-cols-3">
        {SYSTEM_STATS.map((stat, i) => (
          <div key={i} className="stat bg-base-200 rounded-lg">
            <div className="stat-title">{stat.title}</div>
            <div className="stat-value text-lg">{stat.value}</div>
            <div className="stat-desc">{stat.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </Card>
);

const UserGuideSection: React.FC = () => (
  <section className="space-y-6">
    <Card title="Quick Start" titleSize="text-2xl">
      <ul className="steps steps-vertical">
        {QUICK_START_STEPS.map((step, i) => (
          <li key={i} className="step step-primary">
            <div className="text-left ml-4">
              <p className="font-medium">{step.title}</p>
              <p className="text-sm text-base-content/60">{step.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>

    {GUIDE_SECTIONS.map((section, i) => (
      <Card key={i} title={section.title}>
        {section.content}
      </Card>
    ))}
  </section>
);

const FAQSection: React.FC = () => (
  <Card title="FAQ" titleSize="text-2xl">
    <CollapseGroup items={FAQ_ITEMS} name="faq-accordion" />
  </Card>
);

// 主頁面
const TutorialPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('what-is');

  const sections = [
    { id: 'what-is', title: 'What is HyLove?', component: WhatIsSection },
    { id: 'user-guide', title: 'User Guide', component: UserGuideSection },
    { id: 'faq', title: 'FAQ', component: FAQSection },
  ];

  const currentIndex = sections.findIndex(s => s.id === activeSection);
  const ActiveComponent = sections[currentIndex]?.component || WhatIsSection;

  return (
    <div className="container mx-auto">
      <div className="text-sm breadcrumbs mb-4">
        <ul>
          <li><Link to="/">首頁</Link></li>
          <li>使用教學</li>
        </ul>
      </div>

      <h1 className="text-2xl font-bold mb-6">使用教學</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 教學內容 */}
        <div className="flex-1 order-2 lg:order-1 space-y-8">
          <ActiveComponent />

          {/* 導航按鈕 */}
          <div className="flex justify-between mt-8">
            <button
              className="btn btn-outline"
              onClick={() => setActiveSection(sections[currentIndex - 1]?.id)}
              disabled={currentIndex === 0}
            >
              上一章
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setActiveSection(sections[currentIndex + 1]?.id)}
              disabled={currentIndex === sections.length - 1}
            >
              下一章
            </button>
          </div>
        </div>

        {/* 側邊目錄 */}
        <div className="lg:w-64 flex-shrink-0 order-1 lg:order-2">
          <div className="sticky top-4">
            <ul className="menu bg-base-200 rounded-lg w-full">
              <li className="menu-title">目錄</li>
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    className={activeSection === section.id ? 'active' : ''}
                    onClick={() => setActiveSection(section.id)}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;
