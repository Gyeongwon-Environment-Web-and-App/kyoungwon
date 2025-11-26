import React, { useRef } from 'react';

import { Camera, File, Image as ImageIcon, X } from 'lucide-react';

import { Button } from '../ui/button';
import {
  convertDeviceFileToFileData,
  getPhotoFromCamera,
  getPhotoFromLibrary,
} from '@/utils/deviceService';

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
  accept?: string;
}

function FileAttach<T extends { uploadedFiles: FileData[] }>({
  formData,
  setFormData,
  objectCategory,
  showLabel = true,
  labelText = '파일 첨부',
  className1 = '',
  className2 = '',
  accept = '',
}: FileAttachProps<T>) {
  void objectCategory;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = async () => {
    try {
      const deviceFile = await getPhotoFromCamera();
      if (deviceFile) {
        const fileData = await convertDeviceFileToFileData(deviceFile);
        setFormData((prev) => ({
          ...prev,
          uploadedFiles: [...prev.uploadedFiles, fileData],
        }));
      }
    } catch (error) {
      console.error('카메라 오류:', error);
    }
  };

  const handlePhotoLibraryClick = async () => {
    try {
      const deviceFile = await getPhotoFromLibrary();
      if (deviceFile) {
        const fileData = await convertDeviceFileToFileData(deviceFile);
        setFormData((prev) => ({
          ...prev,
          uploadedFiles: [...prev.uploadedFiles, fileData],
        }));
      }
    } catch (error) {
      console.error('사진 라이브러리 오류:', error);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index),
    }));
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
          accept={accept || "image/*" }
          multiple
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCameraClick}
            className="flex items-center justify-center gap-1 border border-light-border px-2 md:px-3 py-1.5 md:py-2 rounded text-center outline-none text-xs md:text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            <Camera className="h-4 w-4" />
            카메라
          </button>
          <button
            type="button"
            onClick={handlePhotoLibraryClick}
            className="flex items-center justify-center gap-1 border border-light-border px-2 md:px-3 py-1.5 md:py-2 rounded text-center outline-none text-xs md:text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            <ImageIcon className="h-4 w-4" />
            사진 선택
          </button>
          <button
            type="button"
            onClick={handleFileClick}
            className="flex items-center justify-center gap-1 border border-light-border px-2 md:px-3 py-1.5 md:py-2 rounded text-center outline-none text-xs md:text-sm font-bold hover:bg-gray-50 transition-colors"
          >
            <File className="h-4 w-4" />
            파일 선택
          </button>
        </div>

        <div className="ml-5 text-sm md:text-base">
          {formData.uploadedFiles.length > 0 ? (
            <div className="flex flex-row flex-wrap items-center gap-3">
              {formData.uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-x-2">
                  <span className="text-xs md:text-sm">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    className="cursor-pointer p-0 hover:bg-white"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <X className="h-4 w-4 text-red" />
                  </Button>
                </div>
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
