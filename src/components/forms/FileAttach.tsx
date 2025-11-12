import React, { useRef, useState } from 'react';

// Generic type for any form data with uploadedFiles
type FileData = {
  name: string;
  url: string; // Will be Cloudflare key after upload, empty before
  type: string;
  size: number;
  previewUrl?: string; // Local preview URL for images
  file?: File; // Original File object (for later upload)
};

interface FileAttachProps<T extends { uploadedFiles: FileData[] }> {
  formData: T;
  setFormData: (updates: Partial<T> | ((prev: T) => T)) => void;
  objectCategory: string; // Required: 'complaint', 'driver', 'vehicle', 'notice', etc.
  showLabel?: boolean;
  labelText?: string;
  className1?: string;
  className2?: string;
}

function FileAttach<T extends { uploadedFiles: FileData[] }>({
  formData,
  setFormData,
  objectCategory, // Reserved for future use (upload happens in confirm stage)
  showLabel = true,
  labelText = '파일 첨부',
  className1 = '',
  className2 = ''
}: FileAttachProps<T>) {
  // objectCategory is reserved for future use - files are uploaded in ComplaintConfirm stage
  void objectCategory;
  const [, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploadedFileName(null);

    // Create a local preview URL for images (for display purposes)
    let previewUrl: string = '';
    if (selectedFile.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(selectedFile);
    }

    // Store file locally without uploading
    // Upload will happen in ComplaintConfirm stage
    const newFile: FileData = {
      name: selectedFile.name,
      url: '', // Will be filled with Cloudflare key after upload
      type: selectedFile.type || 'application/octet-stream',
      size: selectedFile.size,
      previewUrl: previewUrl || undefined,
      file: selectedFile, // Store original File object for later upload
    };

    console.log('파일 선택됨 (업로드 대기):', newFile.name);
    console.log('파일 크기:', selectedFile.size, '바이트');

    // Update form data - handle both function and object updates
    setFormData((prev) => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, newFile],
    }));

    setUploadedFileName(selectedFile.name);
  };

  return (
    <>
      {showLabel && (
        <label className={`font-bold text-[1rem] ${className1}`}>
          {labelText}
        </label>
      )}
      <div className={className2}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          style={{ display: 'none' }}
          accept="image/*"
        />

        <button
          type="button"
          onClick={handleFileClick}
          className="w-36 md:w-[200px] border border-light-border px-2 md:px-3 py-1.5 md:py-2 rounded text-center outline-none text-xs md:text-sm font-bold"
        >
          파일 선택
        </button>

        <span className="ml-5 text-sm md:text-base">
          {formData.uploadedFiles.length > 0
            ? formData.uploadedFiles[formData.uploadedFiles.length - 1].name
            : '선택된 파일 없음'}
        </span>
      </div>
    </>
  );
}

export default FileAttach;
