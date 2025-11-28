import apiClient from '@/lib/api';
import {
  type CreateNoticeRequest,
  type CreateNoticeResponse,
  type Notice,
  type NoticeApiPost,
  type NoticeByIdApiResponse,
  type NoticeFormData,
  type NoticePagedApiResponse,
  type UpdateNoticeResponse,
} from '@/types/notice';
import {
  computeNoticeDiff,
  type CurrentNoticeData,
  type OriginalNoticeData,
} from '@/utils/computeDiff';

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

async function reuploadFileToPresignedUrl(
  sourceUrl: string,
  uploadUrl: string,
  contentType?: string
) {
  const downloadResponse = await fetch(sourceUrl);

  if (!downloadResponse.ok) {
    throw new Error(
      `기존 파일 다운로드 실패 (status: ${downloadResponse.status})`
    );
  }

  const fileBlob = await downloadResponse.blob();
  const finalContentType =
    contentType || fileBlob.type || 'application/octet-stream';

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: fileBlob,
    headers: {
      'Content-Type': finalContentType,
    },
  });

  if (!uploadResponse.ok) {
    throw new Error(
      `새 URL로 파일 업로드 실패 (status: ${uploadResponse.status})`
    );
  }

  return {
    size: fileBlob.size,
    contentType: finalContentType,
  };
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
      // Validate page number before API call (1-based indexing)
      const validatedPage = Math.max(1, Math.floor(page));
      if (validatedPage !== page) {
        console.warn(
          `Invalid page number: ${page}. Using validated page: ${validatedPage}`
        );
      }

      const endpoint = `/post/getPostsByPage/${validatedPage}/${NOTICE_PAGE_SIZE}/${modeDesc}`;

      // console.log('🌐 API 호출: getAllNotices', {
      //   endpoint,
      //   page: validatedPage,
      //   pageSize: NOTICE_PAGE_SIZE,
      //   modeDesc,
      //   timestamp: new Date().toISOString(),
      // });

      const response = await apiClient.get<NoticePagedApiResponse>(endpoint);

      // console.log('📡 API 응답 - getAllNotices', {
      //   rawResponse: response.data,
      //   timestamp: new Date().toISOString(),
      // });

      const normalizedPosts = response.data.posts
        ? response.data.posts.map(transformApiPostToNotice)
        : [];

      // Improved fallback calculation for totalItems
      // Prefer API response, but if missing, use length only if we got a full page
      const totalItems =
        response.data.pagination?.totalItems ??
        response.data.totalItems ??
        (normalizedPosts.length === NOTICE_PAGE_SIZE
          ? normalizedPosts.length * validatedPage // Estimate if we got a full page
          : normalizedPosts.length); // Use actual count if partial page

      // Improved fallback calculation for totalPages
      // Only use calculated value if API didn't provide it
      const totalPages =
        response.data.pagination?.totalPages ??
        response.data.totalPages ??
        Math.max(1, Math.ceil(totalItems / NOTICE_PAGE_SIZE));

      // console.log('📊 Pagination 정보', {
      //   requestedPage: validatedPage,
      //   totalItems,
      //   totalPages,
      //   itemsReceived: normalizedPosts.length,
      //   pageSize: NOTICE_PAGE_SIZE,
      // });

      return {
        items: normalizedPosts,
        totalItems,
        totalPages,
        currentPage: validatedPage,
        pageSize: NOTICE_PAGE_SIZE,
        modeDesc,
      };
    } catch (error) {
      console.error('❌ 공지사항 수신 중 오류:', error);
      throw error;
    }
  },

  async getNoticeById(id: number, mode: boolean = true): Promise<Notice> {
    try {
      const endpoint = `/post/getPostById/${id}/${mode}`;
      console.log('🌐 API 호출: getNoticeById', {
        endpoint,
        id,
        mode,
        timestamp: new Date().toISOString(),
      });

      const response = await apiClient.get<NoticeByIdApiResponse>(endpoint);

      console.log('📡 API 응답 - 공지사항 상세:', {
        rawResponse: response.data,
        timestamp: new Date().toISOString(),
      });

      if (response.data.post) {
        return transformApiPostToNotice(response.data.post);
      } else {
        throw new Error('API response missing post data');
      }
    } catch (error) {
      console.error('공지사항 상세 조회 중 오류:', error);
      throw error;
    }
  },

  async updateNotice(
    id: number,
    formData: NoticeFormData
  ): Promise<UpdateNoticeResponse> {
    try {
      // Step 1: 원본 공지사항 데이터 가져오기
      const originalResponse = await apiClient.get<NoticeByIdApiResponse>(
        `/post/getPostById/${id}/true`
      );
      const originalPost = originalResponse.data.post;

      if (!originalPost) {
        throw new Error('원본 공지사항 데이터를 불러올 수 없습니다.');
      }

      const originalFileUrlMap = new Map<string, string>();
      originalPost.presigned_links?.forEach((link) => {
        if (link.key && link.url) {
          originalFileUrlMap.set(link.key, link.url);
        }
      });

      // Step 2: 수정 시 모든 파일에 대해 새로운 키를 받아야 함
      const allFiles = formData.uploadedFiles;
      const filesToUpload = allFiles.filter((file) => file.file && !file.url);
      const existingFiles = allFiles.filter((file) => !file.file && file.url);

      let updatedFiles = formData.uploadedFiles;

      // 새로 추가된 파일이 있으면 업로드
      if (filesToUpload.length > 0) {
        console.log(
          '공지사항 수정을 위해 새 파일 업로드 중:',
          filesToUpload.length
        );
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

        console.log('✅ 새 파일 업로드 성공 - 공지사항 수정');
      }

      // 기존 파일들에 대해서도 새로운 키 받기
      if (existingFiles.length > 0) {
        console.log(
          '공지사항 수정을 위해 기존 파일에 대한 새 키 요청 중:',
          existingFiles.length
        );

        // 기존 파일 정보로 새로운 키 요청
        const filesInfo = existingFiles.map((file) => ({
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
        }));

        const requestBody = {
          filesInfo,
          object_category: 'notice',
        };

        const response = await apiClient.post<{
          data: Array<{ key: string; url: string }>;
        }>('/cloudflare/getKeysAndUrlsToUpload', requestBody);

        if (response.data.data && response.data.data.length > 0) {
          const uploadResults = await Promise.all(
            existingFiles.map(async (file, index) => {
              const newKeyInfo = response.data.data[index];
              if (!newKeyInfo) return null;

              const downloadUrl =
                originalFileUrlMap.get(file.url) ?? file.url ?? '';

              if (!downloadUrl.startsWith('http')) {
                throw new Error(
                  `기존 파일 다운로드 URL을 찾을 수 없습니다: ${file.name}`
                );
              }

              await reuploadFileToPresignedUrl(
                downloadUrl,
                newKeyInfo.url,
                file.type
              );

              return {
                originalKey: file.url,
                newKey: newKeyInfo.key,
              };
            })
          );

          const keyUpdateMap = new Map(
            uploadResults
              .filter(
                (result): result is { originalKey: string; newKey: string } =>
                  result !== null
              )
              .map((result) => [result.originalKey, result.newKey])
          );

          updatedFiles = updatedFiles.map((file) => {
            if (!file.file && file.url && keyUpdateMap.has(file.url)) {
              return {
                ...file,
                url: keyUpdateMap.get(file.url) ?? file.url,
              };
            }
            return file;
          });

          console.log(
            '✅ 기존 파일 재업로드 및 새 키 수신 성공 - 공지사항 수정'
          );
        }
      }

      // Step 3: 현재 데이터를 API 형식으로 변환
      const objectInfos = transformFilesToObjectInfos(updatedFiles);
      const teamCategories = mapNotifyToTeamCategories(formData.notify || []);

      const currentData: CurrentNoticeData = {
        title: formData.title,
        post_type: mapCategoryToPostType(formData.category),
        content: formData.content,
        team_categories: teamCategories,
        ...(objectInfos.length > 0 && { objectInfos }),
      };

      // Step 4: 원본 데이터를 API 형식으로 변환
      const originalData: OriginalNoticeData = {
        title: originalPost.title,
        post_type: originalPost.post_type,
        content: originalPost.content,
        presigned_links: originalPost.presigned_links,
        team_categories: [], // API 응답에 team_categories가 없으므로 빈 배열
      };

      // Step 5: 변경된 필드만 추출
      const diffPayload = computeNoticeDiff(originalData, currentData);

      // 변경사항이 없으면 에러 처리
      if (Object.keys(diffPayload).length === 0) {
        throw new Error('변경된 내용이 없습니다.');
      }

      // undefined 값 제거 (API가 요구하는 형식에 맞추기)
      const cleanPayload: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(diffPayload)) {
        if (value !== undefined) {
          cleanPayload[key] = value;
        }
      }

      const endpoint = `/post/edit/${id}`;

      // 상세한 요청 정보 로깅
      const token = localStorage.getItem('userToken');
      console.log('🔍 === API 요청 상세 정보 ===');
      console.log('URL:', endpoint);
      console.log('Method: PATCH');
      console.log('ID (in URL):', id);
      console.log(
        'Bearer Token:',
        token ? `${token.substring(0, 20)}...` : '없음'
      );
      console.log(
        'Request Body (cleanPayload):',
        JSON.stringify(cleanPayload, null, 2)
      );
      console.log('Request Body Keys:', Object.keys(cleanPayload));
      console.log('원본 데이터:', JSON.stringify(originalData, null, 2));
      console.log('현재 데이터:', JSON.stringify(currentData, null, 2));
      console.log(
        'Diff Payload (before cleanup):',
        JSON.stringify(diffPayload, null, 2)
      );
      console.log('===========================');

      const response = await apiClient.patch<UpdateNoticeResponse>(
        endpoint,
        cleanPayload
      );

      console.log('📡 API 응답 - 공지사항 수정:', {
        rawResponse: response.data,
        timestamp: new Date().toISOString(),
      });

      if (!response.data || !response.data.post) {
        throw new Error('Invalid response structure: missing post data');
      }

      return response.data;
    } catch (error) {
      console.error('공지사항 수정 중 오류:', error);
      throw error;
    }
  },

  async deleteNotice(id: number): Promise<{ message: string }> {
    try {
      const endpoint = `/post/delete/${id}`;
      console.log('🌐 API 호출: deleteNotice', {
        endpoint,
        id,
        timestamp: new Date().toISOString(),
      });

      const response = await apiClient.delete<{ message: string }>(endpoint);

      console.log('📡 API 응답 - 공지사항 삭제:', {
        rawResponse: response.data,
        timestamp: new Date().toISOString(),
      });

      return response.data;
    } catch (error) {
      console.error('공지사항 삭제 중 오류:', error);
      throw error;
    }
  },
};
