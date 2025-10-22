import React, { useRef, useState } from 'react';

interface FileData {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface GenericFileAttachProps {
  formData: { uploadedFiles: FileData[] };
  setFormData: (
    updates: (prev: { uploadedFiles: FileData[] }) => {
      uploadedFiles: FileData[];
    }
  ) => void;
}

const GenericFileAttach = ({
  formData,
  setFormData,
}: GenericFileAttachProps) => {
  const [uploading, setUploading] = useState(false);
  const [, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileUploadFail, setFileUploadFail] = useState(false);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploadedFileName(null); // 이전 업로드 상태 초기화
    setUploading(true);

    try {
      // 백엔드 없이 로컬에서 파일 처리
      const fileReader = new FileReader();

      fileReader.onload = (event) => {
        const fileUrl = event.target?.result as string;

        // formData에 파일 정보 추가
        const newFile = {
          name: selectedFile.name,
          url: fileUrl, // FileReader로 생성된 로컬 URL
          type: selectedFile.type,
          size: selectedFile.size,
        };

        console.log('새로 추가된 파일:', newFile);
        console.log('파일 크기:', selectedFile.size, '바이트');

        setFormData((prev: { uploadedFiles: FileData[] }) => ({
          ...prev,
          uploadedFiles: [...prev.uploadedFiles, newFile],
        }));

        setUploadedFileName(selectedFile.name);
        setUploading(false);
      };

      fileReader.onerror = () => {
        setFileUploadFail(true);
        setUploading(false);
        console.error('파일 읽기 실패');
      };

      // 파일을 Data URL로 읽기
      fileReader.readAsDataURL(selectedFile);
    } catch (err: unknown) {
      setFileUploadFail(true);
      console.error('파일 처리 중 에러 발생:', err);
      setUploading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      <button
        type="button"
        onClick={handleFileClick}
        className="w-36 md:w-[200px] border border-light-border px-2 py-1.5 rounded text-center outline-none text-sm font-bold"
      >
        파일 선택
      </button>

      <span className="ml-5 text-sm">
        {uploading
          ? '업로드 중...'
          : formData.uploadedFiles.length > 0
            ? formData.uploadedFiles[formData.uploadedFiles.length - 1].name
            : fileUploadFail
              ? '업로드 실패'
              : '선택된 파일 없음'}
      </span>
    </>
  );
};

export default GenericFileAttach;
