import apiClient from '@/lib/api';
import {
  type CreateNoticeRequest,
  type CreateNoticeResponse,
  type Notice,
  type NoticeApiPost,
  type NoticeFormData,
  type NoticePagedApiResponse,
} from '@/types/notice';

import { uploadFilesToCloudflare } from './fileUploadService';

function mapCategoryToPostType(category: string): string {
  const categoryMap: Record<string, string> = {
    안내사항: 'announcement',
    정보: 'information',
    구청: 'district_office',
    주민센터: 'community_center',
  };

  return categoryMap[category] || category;
}

function mapPostTypeToCategory(postType: string): string {
  const postTypeMap: Record<string, string> = {
    announcement: '안내사항',
    information: '정보',
    district_office: '구청',
    community_center: '주민센터',
  };

  return postTypeMap[postType] || postType;
}

function mapNotifyToTeamCategories(notify: string[]): string[] {
  const teamMap: Record<string, string> = {
    '생활팀에게 전달': '생활',
    '음식물팀에게 전달': '음식물',
    '재활용팀에게 전달': '재활용',
    '전체팀에게 전달': '전체',
  };

  return notify.map((item) => teamMap[item] || item);
}

function transformFilesToObjectInfos(
  uploadedFiles: NoticeFormData['uploadedFiles']
): Array<{ objectKey: string; filenameOriginal: string }> {
  return uploadedFiles
    .filter((file) => file.url && file.url.trim() !== '')
    .map((file) => ({
      objectKey: file.url,
      filenameOriginal: file.name,
    }));
}

function transformApiPostToNotice(apiPost: NoticeApiPost): Notice {
  return {
    id: apiPost.id,
    type: mapPostTypeToCategory(apiPost.post_type),
    title: apiPost.title,
    writer: apiPost.username || '담당자 없음',
    datetime: apiPost.created_at,
    content: apiPost.content ?? '',
  };
}

export const NOTICE_PAGE_SIZE = 15;

export interface NoticeListResult {
  items: Notice[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  modeDesc: boolean;
}

export const noticeService = {
  async createNotice(formData: NoticeFormData): Promise<CreateNoticeResponse> {
    try {
      const filesToUpload = formData.uploadedFiles.filter(
        (file) => file.file && !file.url
      );

      let updatedFiles = formData.uploadedFiles;

      if (filesToUpload.length > 0) {
        console.log('공지사항 위해 파일 업로드 중:', filesToUpload.length);
        const fileObjects = filesToUpload
          .map((f) => f.file)
          .filter((f): f is File => f !== undefined);

        const uploadedFiles = await uploadFilesToCloudflare(
          fileObjects,
          'notice'
        );

        updatedFiles = formData.uploadedFiles.map((file) => {
          if (file.file && !file.url) {
            const uploaded = uploadedFiles.find(
              (uf) => uf.originalName === file.name
            );
            if (uploaded) {
              return {
                ...file,
                url: uploaded.key,
              };
            }
          }
          return file;
        });

        console.log('✅ 파일 업로드 성공 - 공지사항');
      }

      const objectInfos = transformFilesToObjectInfos(updatedFiles);
      const teamCategories = mapNotifyToTeamCategories(formData.notify || []);

      const requestData: CreateNoticeRequest = {
        title: formData.title,
        post_type: mapCategoryToPostType(formData.category),
        content: formData.content,
        team_categories: teamCategories,
        ...(objectInfos.length > 0 && { objectInfos }),
      };

      console.log('🌐 API 호출: /post/create', {
        requestData,
        timeStamp: new Date().toISOString(),
      });

      const response = await apiClient.post<CreateNoticeResponse>(
        '/post/create',
        requestData
      );

      console.log('📡 API 응답 - 공지사항 전송:', {
        rawResponse: response.data,
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error) {
      console.error('공지사항 전송 중 오류:', error);
      throw error;
    }
  },

  async getAllNotices(
    page: number,
    modeDesc: boolean
  ): Promise<NoticeListResult> {
    try {
      const endpoint = `/post/getPostsByPage/${page}/${NOTICE_PAGE_SIZE}/${modeDesc}`;
      const response = await apiClient.get<NoticePagedApiResponse>(endpoint);

      console.log('getAllNotices', response.data);

      const normalizedPosts = response.data.posts
        ? response.data.posts.map(transformApiPostToNotice)
        : [];

      const totalItems =
        response.data.pagination?.totalItems ??
        response.data.totalItems ??
        normalizedPosts.length;
      const totalPages =
        response.data.pagination?.totalPages ??
        response.data.totalPages ??
        Math.max(1, Math.ceil(totalItems / NOTICE_PAGE_SIZE));

      return {
        items: normalizedPosts,
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: NOTICE_PAGE_SIZE,
        modeDesc,
      };
    } catch (error) {
      console.error('공지사항 수신 중 오류:', error);
      throw error;
    }
  },
};
