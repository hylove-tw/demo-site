// src/components/PageWrapper.tsx
import React from 'react';
import Navbar from './Navbar';

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 頂部導覽列 */}
      <Navbar />
      {/* 主內容區，flex-grow 讓內容區自動填滿剩餘高度 */}
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
      {/* 頁尾 */}
      <footer className="bg-base-200 text-base-content text-center p-4">
        &copy; {new Date().getFullYear()} Hylove. All rights reserved.
      </footer>
    </div>
  );
};

export default PageWrapper;