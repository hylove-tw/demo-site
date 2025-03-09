// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FileManagePage from './pages/FileManagePage';
import AnalysisPage from './pages/AnalysisPage';
import FileDetailPage from './pages/FileDetailPage';
import AnalysisReportPage from './pages/AnalysisReportPage';
import UsersPage from './pages/UsersPage';

// 從你建立的 UserContext 匯入 UserProvider
import { UserProvider } from './context/UserContext';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <nav style={{ marginBottom: '1rem' }}>
          <Link to="/">腦波分析</Link> |{' '}
          <Link to="/files">檔案管理</Link> |{' '}
          <Link to="/users">使用者管理</Link>
        </nav>
        <Routes>
          <Route path="/" element={<AnalysisPage />} />
          <Route path="/files" element={<FileManagePage />} />
          <Route path="/files/:id" element={<FileDetailPage />} />
          <Route path="/analysis/report/:reportId" element={<AnalysisReportPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;