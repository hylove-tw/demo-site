// src/App.tsx
import React from 'react';
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import FileManagePage from './pages/FileManagePage';
import AnalysisPage from './pages/AnalysisPage';
import FileDetailPage from './pages/FileDetailPage';
import AnalysisReportPage from './pages/AnalysisReportPage';

const App: React.FC = () => {
    return (
        <Router>
            <nav>
                <Link to="/files">檔案清單</Link> |{' '}
                <Link to="/analysis">資料分析</Link>
            </nav>
            <Routes>
                <Route path="/files" element={<FileManagePage/>}/>
                <Route path="/analysis" element={<AnalysisPage/>}/>
                <Route path="/files/:id" element={<FileDetailPage/>}/>
                <Route path="/analysis/report/:reportId" element={<AnalysisReportPage/>}/>
            </Routes>
        </Router>
    );
};

export default App;