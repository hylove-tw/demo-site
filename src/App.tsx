// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AnalysisPage from './pages/AnalysisPage';
import AnalysisDetailPage from './pages/AnalysisDetailPage';
import AnalysisHistoryPage from './pages/AnalysisHistoryPage';
import FileManagePage from './pages/FileManagePage';
import FileDetailPage from './pages/FileDetailPage';
import AnalysisReportPage from './pages/AnalysisReportPage';
import UsersPage from './pages/UsersPage';
import TutorialPage from './pages/TutorialPage';
import PageWrapper from './components/PageWrapper';
import { UserProvider } from './context/UserContext';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router basename={process.env.PUBLIC_URL}>
        <PageWrapper>
          <Routes>
            <Route path="/" element={<AnalysisPage />} />
            <Route path="/analysis/:id" element={<AnalysisDetailPage />} />
            <Route path="/history" element={<AnalysisHistoryPage />} />
            <Route path="/files" element={<FileManagePage />} />
            <Route path="/files/:id" element={<FileDetailPage />} />
            <Route path="/analysis/report/:reportId" element={<AnalysisReportPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/tutorial" element={<TutorialPage />} />
          </Routes>
        </PageWrapper>
      </Router>
    </UserProvider>
  );
};

export default App;