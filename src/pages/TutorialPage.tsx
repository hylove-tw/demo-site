// src/pages/TutorialPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  SECTION_GROUPS,
  TUTORIAL_SECTIONS,
  getSectionsByGroup,
  getSection,
} from '../config/tutorialData';

const TutorialPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['intro']));

  const currentSection = getSection(activeSection);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleSectionClick = (sectionId: string, groupId: string) => {
    setActiveSection(sectionId);
    // 確保該群組是展開的
    if (!expandedGroups.has(groupId)) {
      setExpandedGroups(prev => new Set(prev).add(groupId));
    }
  };

  // 找到當前和相鄰的章節
  const allSections = TUTORIAL_SECTIONS;
  const currentIndex = allSections.findIndex(s => s.id === activeSection);
  const prevSection = currentIndex > 0 ? allSections[currentIndex - 1] : null;
  const nextSection = currentIndex < allSections.length - 1 ? allSections[currentIndex + 1] : null;

  return (
    <div className="container mx-auto">
      {/* 麵包屑 */}
      <div className="text-sm breadcrumbs mb-4">
        <ul>
          <li><Link to="/">首頁</Link></li>
          <li>使用教學</li>
          {currentSection && <li>{currentSection.title}</li>}
        </ul>
      </div>

      <h1 className="text-2xl font-bold mb-6">使用教學</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 教學內容 */}
        <div className="flex-1 order-2 lg:order-1">
          {currentSection && (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">{currentSection.title}</h2>
                {currentSection.content}
              </div>
            </div>
          )}

          {/* 導航按鈕 */}
          <div className="flex justify-between mt-8">
            <button
              className="btn btn-outline"
              onClick={() => prevSection && handleSectionClick(prevSection.id, prevSection.group)}
              disabled={!prevSection}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              {prevSection?.title || '上一章'}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => nextSection && handleSectionClick(nextSection.id, nextSection.group)}
              disabled={!nextSection}
            >
              {nextSection?.title || '下一章'}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* 側邊目錄 */}
        <div className="lg:w-72 flex-shrink-0 order-1 lg:order-2">
          <div className="sticky top-4">
            <ul className="menu bg-base-200 rounded-lg w-full">
              <li className="menu-title">目錄</li>
              {SECTION_GROUPS.map((group) => {
                const groupSections = getSectionsByGroup(group.id);
                const isExpanded = expandedGroups.has(group.id);
                const hasActiveSection = groupSections.some(s => s.id === activeSection);

                return (
                  <li key={group.id}>
                    {/* 群組標題 */}
                    <button
                      type="button"
                      className={`justify-between font-medium ${hasActiveSection ? 'text-primary' : ''}`}
                      onClick={() => toggleGroup(group.id)}
                    >
                      {group.title}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>

                    {/* 子項目 */}
                    {isExpanded && (
                      <ul className="ml-4 border-l-2 border-base-300">
                        {groupSections.map((section) => (
                          <li key={section.id}>
                            <button
                              type="button"
                              className={activeSection === section.id ? 'active' : ''}
                              onClick={() => handleSectionClick(section.id, group.id)}
                            >
                              {section.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;
