// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FileManagePage from './pages/FileManagePage';
import AnalysisPage from './pages/AnalysisPage';
import FileDetailPage from './pages/FileDetailPage';
import AnalysisReportPage from './pages/AnalysisReportPage';
import UsersPage from './pages/UserPages';
import UserPage from './pages/UserPage';
import { useUserManager } from './hooks/useUserManager';

const App: React.FC = () => {
  const { currentUser } = useUserManager();

  return (
    <Router>
      <nav style={{ marginBottom: '1rem' }}>
        <Link to="/">腦波分析</Link> |{' '}
        <Link to="/files">檔案管理</Link> |{' '}
        <Link to="/users">使用者管理</Link> |{' '}
        {/* 顯示目前的使用者，如果存在 */}
        {currentUser ? (
          <Link to={`/users/${currentUser.id}`}>{currentUser.name}</Link>
        ) : (
          <span>尚未設定使用者</span>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<AnalysisPage />} />
        <Route path="/files" element={<FileManagePage />} />
        <Route path="/files/:id" element={<FileDetailPage />} />
        <Route path="/analysis/report/:reportId" element={<AnalysisReportPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/:id" element={<UserPage />} />
      </Routes>
    </Router>
  );
};

export default App;