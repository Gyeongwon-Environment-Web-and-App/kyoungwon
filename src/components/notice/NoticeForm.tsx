import React, { useCallback, useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import apiClient from '@/lib/api';
import { noticeService } from '@/services/noticeService';
import type { NoticeByIdApiResponse, NoticeFormData } from '@/types/notice';

import FileAttach from '../forms/FileAttach';
import TextForward from '../forms/TextForward';

interface NoticeFormPorps {
  onSubmit?: () => void;
}

const NoticeForm: React.FC<NoticeFormPorps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<NoticeFormData>({
    title: '',
    category: '',
    content: '',
    uploadedFiles: [],
    notify: [],
  });
  const [focus, setFocus] = useState({ routeInput: false });
  const [isLoading, setIsLoading] = useState(false);

  const { noticeId } = useParams();
  const isEditMode = Boolean(noticeId);
  const navigate = useNavigate();

  // Helper function to map post_type to category
  const mapPostTypeToCategory = useCallback((postType: string): string => {
    const postTypeMap: Record<string, string> = {
      announcement: '안내사항',
      information: '정보',
      district_office: '구청',
      community_center: '주민센터',
    };
    return postTypeMap[postType] || postType;
  }, []);

  // Load notice data when in edit mode
  useEffect(() => {
    const loadNoticeData = async () => {
      if (!noticeId) return;

      try {
        setIsLoading(true);
        const endpoint = `/post/getPostById/${noticeId}/true`;
        const response = await apiClient.get<NoticeByIdApiResponse>(endpoint);

        if (response.data.post) {
          const post = response.data.post;

          // Map API response to form data
          const loadedData: NoticeFormData = {
            title: post.title || '',
            category: mapPostTypeToCategory(post.post_type) || '',
            content: post.content || '',
            uploadedFiles:
              post.presigned_links && post.presigned_links.length > 0
                ? post.presigned_links.map((link) => ({
                    name: link.key.split('/').pop() || 'file',
                    url: link.key,
                    type: '',
                    size: 0,
                  }))
                : [],
            notify: [], // team_categories는 API 응답에 없으므로 빈 배열로 시작
          };

          setFormData(loadedData);
        }
      } catch (error) {
        console.error('공지사항 데이터 불러오기 실패:', error);
        alert('공지사항 데이터를 불러오는 중 오류가 발생했습니다.');
        navigate('/notice/table');
      } finally {
        setIsLoading(false);
      }
    };

    loadNoticeData();
  }, [noticeId, navigate, mapPostTypeToCategory]);

  const updateFormData = (updates: Partial<NoticeFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const getNotifyData = () => {
    return formData.notify || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.category.trim() ||
      !formData.content.trim()
    ) {
      alert('제목, 공지구분, 내용을 모두 입력해주세요.');
      return;
    }

    try {
      if (isEditMode && noticeId) {
        // Update existing notice
        await noticeService.updateNotice(Number(noticeId), formData);

        if (onSubmit) {
          onSubmit();
        } else {
          alert('공지사항이 성공적으로 수정되었습니다.');
          navigate(`/post/getPostById/${noticeId}/true`);
        }
      } else {
        // Create new notice
        const response = await noticeService.createNotice(formData);

        if (onSubmit) {
          onSubmit();
        } else {
          alert(
            `공지사항 등록이 완료되었습니다. 공지사항 내용: ${response.post}`
          );
          navigate('/notice/table');
        }
      }
    } catch (error) {
      console.error(
        isEditMode ? '공지사항 수정 실패:' : '공지사항 등록 실패:',
        error
      );
      alert(
        isEditMode
          ? '공지사항 수정 중 오류가 발생했습니다.'
          : '공지사항 등록 중 오류가 발생했습니다.'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-light-green"></div>
          <span className="text-sm text-gray-600">
            공지사항을 불러오는 중...
          </span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-lg border border-a5a5a5">
        <div className="flex flex-col md:grid md:grid-cols-[150px_1fr_1fr_1fr_150px] gap-x-4 gap-y-3 md:gap-y-7 items-start md:items-center px-5 md:px-10 md:pt-10 pt-5 text-lg">
          {/* 제목 */}
          <label className="col-span-1 font-bold">
            제목
            <span className="text-red pr-0"> *</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            className="col-span-4 rounded border border-light-border text-base px-3 py-1.5 text-left w-full"
            placeholder="제목을 입력하세요"
          />

          {/* 공지구분 */}
          <label className="col-span-1 font-bold">
            공지구분
            <span className="text-red pr-0"> *</span>
          </label>
          <div
            className={`flex col-span-3 text-sm border border-light-border rounded w-full`}
          >
            {['안내사항', '정보', '구청', '주민센터'].map((label, idx, arr) => (
              <button
                key={label}
                type="button"
                className={`
                  flex-1 px-1 md:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full
                  ${formData.category === label ? 'bg-lighter-green' : ''}
                  ${idx === 0 ? 'rounded-l' : ''}
                  ${idx === arr.length - 1 ? 'rounded-r' : ''}
                `}
                style={{
                  borderRight:
                    idx !== arr.length - 1 ? '1px solid #ACACAC' : 'none',
                }}
                onClick={() => updateFormData({ category: label })}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder={focus.routeInput ? '' : '직접 입력'}
            className={`col-span-1 border border-light-border px-3 py-1.5 mb-0 rounded text-left text-base w-full`}
            onChange={(e) => updateFormData({ category: e.target.value })}
            onFocus={() => setFocus({ routeInput: true })}
            onBlur={() => setFocus({ routeInput: false })}
            onClick={() => updateFormData({ category: '' })}
          />

          {/* 파일 첨부 */}
          <FileAttach
            formData={formData}
            setFormData={(updates) => {
              if (typeof updates === 'function') {
                updateFormData(updates(formData));
              } else {
                updateFormData(updates);
              }
            }}
            objectCategory="notice"
            className1="col-span-1"
            className2="col-span-4 flex items-center"
            accept="image/*,application/pdf,.doc,.docx,application/msword,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          />

          {/* 내용 */}
          <label className="col-span-1 font-bold md:mb-5">
            내용
            <span className="text-red pr-0"> *</span>
          </label>
          <textarea
            id="content"
            value={formData.content}
            className="col-span-4 border border-light-border px-3 py-2 rounded w-full h-60 resize-none mb-5 md:mb-8"
            onChange={(e) => updateFormData({ content: e.target.value })}
          />
        </div>

        {/* 문자 메시지 전달 */}
        <div className="flex items-center justify-center mb-6 md:mb-8">
          <TextForward
            options={[
              '생활팀에게 전달',
              '음식물팀에게 전달',
              '재활용팀에게 전달',
              '전체팀에게 전달',
            ]}
            mobileOptions={['생활', '음식물', '재활용', '전체']} // 모바일용 짧은 텍스트
            selectedValues={getNotifyData()}
            onChange={(updatedList) => updateFormData({ notify: updatedList })}
          />
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="text-center mt-5 pb-5">
        <button
          type="submit"
          className="bg-light-green hover:bg-green-600 text-white font-semibold px-20 py-2 rounded outline-1"
        >
          {isEditMode ? '수정 완료' : '작성 완료'}
        </button>
      </div>
    </form>
  );
};

export default NoticeForm;
