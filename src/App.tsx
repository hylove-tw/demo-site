// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AnalysisPage from './pages/AnalysisPage';
import FileManagePage from './pages/FileManagePage';
import FileDetailPage from './pages/FileDetailPage';
import AnalysisReportPage from './pages/AnalysisReportPage';
import UsersPage from './pages/UsersPage';
import PageWrapper from './components/PageWrapper';
import { UserProvider } from './context/UserContext';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <PageWrapper>
          <Routes>
            <Route path="/" element={<AnalysisPage />} />
            <Route path="/files" element={<FileManagePage />} />
            <Route path="/files/:id" element={<FileDetailPage />} />
            <Route path="/analysis/report/:reportId" element={<AnalysisReportPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Routes>
        </PageWrapper>
      </Router>
    </UserProvider>
  );
};

export default App;