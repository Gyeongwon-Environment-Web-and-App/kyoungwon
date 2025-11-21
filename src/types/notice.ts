export interface Notice {
  id: number;
  type: string;
  title: string;
  writer: string;
  datetime: string;
  content: string;
}

export interface NoticeFormData {
  title: string;
  category: string;
  content: string;
  uploadedFiles: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
    file?: File;
  }>;
  notify: string[];
}

export interface CreateNoticeRequest {
  title: string;
  post_type: string;
  content: string;
  objectInfos?: Array<{
    objectKey: string;
    filenameOriginal: string;
  }>;
  team_categories: string[];
}

export interface NoticeFile {
  id: number;
  objectKey: string;
  contentType: string;
  contentLength: number;
  filenameOriginal: string;
  createdAt: string;
}

export interface NoticePost {
  id: number;
  user_id: number;
  title: string;
  post_type: string;
  content: string;
  files: NoticeFile[];
}

export interface CreateNoticeResponse {
  message: string;
  post: NoticePost;
}

export interface UpdateNoticeRequest {
  title: string;
  post_type: string;
  content: string;
  team_categories: string[];
  objectInfos?: Array<{
    objectKey: string;
    filenameOriginal: string;
  }>;
}

export interface UpdateNoticeResponse {
  message: string;
  post: NoticePost;
}

export interface NoticeApiPost {
  id: number;
  username: string;
  title: string;
  post_type: string;
  created_at: string;
  content?: string;
}

export interface NoticeApiResponse {
  message: string;
  posts: NoticeApiPost[];
}

export interface NoticePaginationMeta {
  totalItems?: number;
  totalPages?: number;
}

export interface NoticePagedApiResponse extends NoticeApiResponse {
  pagination?: NoticePaginationMeta;
  totalItems?: number;
  totalPages?: number;
}

export interface NoticeByIdApiResponse {
  message: string;
  post: {
    id: number;
    username: string;
    title: string;
    post_type: string;
    created_at: string;
    content: string;
    prev: {
      id: number;
      title: string;
    };
    next: {
      id: number;
      title: string;
    };
    presigned_links: Array<{
      url: string;
      key: string;
    }>;
  };
}
