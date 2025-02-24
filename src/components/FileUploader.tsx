// src/components/FileUploader.tsx
import React, { ChangeEvent } from 'react';

interface FileUploaderProps {
  onUpload: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUpload }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div>
      <input type="file" accept=".xlsx, .xls, .csv" onChange={handleChange} />
    </div>
  );
};

export default FileUploader;