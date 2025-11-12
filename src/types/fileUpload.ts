export interface FileInfo {
  filename: string;
  contentType: string;
}

export interface GetUploadUrlsRequest {
  filesInfo: FileInfo[];
  object_category: string;
}

export interface UploadUrlData {
  key: string;
  url: string;
}

export interface GetUploadUrlsResponse {
  message: string[];
  data: UploadUrlData[];
}

export interface UploadedFileInfo {
  key: string;
  originalName: string;
  contentType: string;
  size: number;
}

export interface UploadError {
  message: string;
  file?: string;
}
