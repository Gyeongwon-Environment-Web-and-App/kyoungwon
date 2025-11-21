import React, { useRef } from 'react';

// Generic type for any form data with uploadedFiles
export type FileData = {
  name: string;
  url: string;
  type: string;
  size: number;
  previewUrl?: string;
  file?: File;
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
  objectCategory,
  showLabel = true,
  labelText = '파일 첨부',
  className1 = '',
  className2 = '',
}: FileAttachProps<T>) {
  void objectCategory;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // Process all selected files
    const newFiles: FileData[] = selectedFiles.map((selectedFile) => {
      // Create a local preview URL for images (for display purposes)
      let previewUrl: string = '';
      if (selectedFile.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(selectedFile);
      }

      // Store file locally without uploading
      const newFile: FileData = {
        name: selectedFile.name,
        url: '', 
        type: selectedFile.type || 'application/octet-stream',
        size: selectedFile.size,
        previewUrl: previewUrl || undefined,
        file: selectedFile, 
      };

      console.log('파일 선택됨 (업로드 대기):', newFile.name);
      console.log('파일 크기:', selectedFile.size, '바이트');

      return newFile;
    });

    // Update form data - handle both function and object updates
    setFormData((prev) => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...newFiles],
    }));

    // Reset input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {showLabel && (
        <label className={`font-bold md:text-lg ${className1}`}>
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
          multiple
        />

        <button
          type="button"
          onClick={handleFileClick}
          className="w-36 md:w-[200px] border border-light-border px-2 md:px-3 py-1.5 md:py-2 rounded text-center outline-none text-xs md:text-sm font-bold"
        >
          파일 선택
        </button>

        <div className="ml-5 text-sm md:text-base">
          {formData.uploadedFiles.length > 0 ? (
            <div className="flex flex-row gap-3">
              {formData.uploadedFiles.map((file, index) => (
                <span key={index} className="text-xs md:text-sm">
                  {file.name}
                </span>
              ))}
            </div>
          ) : (
            <span>선택된 파일 없음</span>
          )}
        </div>
      </div>
    </>
  );
}

export default FileAttach;
