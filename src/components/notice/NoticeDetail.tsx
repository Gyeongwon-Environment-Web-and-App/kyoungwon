import React, { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotices } from '@/hooks/useNotices';
import apiClient from '@/lib/api';
import { ChevronDownIcon, ChevronLeft, Download } from '@/lib/icons';
import type { Notice, NoticeByIdApiResponse } from '@/types/notice';
import { formatDateToYYMMDD } from '@/utils/formatDate';

import deleteIcon from '../../assets/icons/actions/delete.png';
import fix from '../../assets/icons/common/pen.png';
import { Button } from '../ui/button';

interface NoticeDetailData extends Notice {
  prev?: { id: number; title: string };
  next?: { id: number; title: string };
  presigned_links?: Array<{ url: string; key: string }>;
}

// Helper function to check if a file is an image based on its key/URL
const isImageFile = (key: string): boolean => {
  const imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.bmp',
    '.svg',
  ];
  const lowerKey = key.toLowerCase();
  return imageExtensions.some((ext) => lowerKey.endsWith(ext));
};

// Helper function to check if a file is a PDF
const isPdfFile = (key: string): boolean => {
  return key.toLowerCase().endsWith('.pdf');
};

const NoticeDetail: React.FC = () => {
  const { id, mode } = useParams<{ id: string; mode: string }>();
  const navigate = useNavigate();
  const { getNoticeById, isLoading, fetchError, deleteNotice } = useNotices();
  const [notice, setNotice] = useState<NoticeDetailData | null>(null);
  const [detailData, setDetailData] = useState<{
    prev?: { id: number; title: string };
    next?: { id: number; title: string };
    presigned_links?: Array<{ url: string; key: string }>;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch notice data when id changes
  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchNotice = async () => {
      try {
        const modeValue = mode === 'true' || mode === undefined || mode === '';
        const noticeData = await getNoticeById(Number(id), modeValue);
        setNotice(noticeData);
      } catch (error) {
        console.error('Failed to fetch notice:', error);
      }
    };

    fetchNotice();
  }, [id, mode, getNoticeById]);

  // Fetch full detail data including prev/next/presigned_links
  useEffect(() => {
    if (!id) return;

    const fetchDetailData = async () => {
      try {
        const modeValue = mode === 'true' || mode === undefined || mode === '';
        const endpoint = `/post/getPostById/${id}/${modeValue}`;
        const response = await apiClient.get<NoticeByIdApiResponse>(endpoint);

        if (response.data.post) {
          setDetailData({
            prev: response.data.post.prev,
            next: response.data.post.next,
            presigned_links: response.data.post.presigned_links,
          });
        }
      } catch (error) {
        console.error('Failed to fetch notice detail data:', error);
      }
    };

    fetchDetailData();
  }, [id, mode]);

  // Handle back navigation
  const handleBackClick = () => {
    navigate('/notice/table');
  };

  // Handle previous/next navigation
  const handlePrevClick = () => {
    if (detailData?.prev?.id) {
      navigate(`/post/getPostById/${detailData.prev.id}/${mode || 'true'}`);
    }
  };

  const handleNextClick = () => {
    if (detailData?.next?.id) {
      navigate(`/post/getPostById/${detailData.next.id}/${mode || 'true'}`);
    }
  };

  // Handle delete notice
  const handleDelete = async () => {
    if (!id || !notice) {
      return;
    }

    const confirmMessage = `"${notice.title}" 공지사항을 정말 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteNotice(Number(id));
      alert('공지사항이 성공적으로 삭제되었습니다.');
      navigate('/notice/table');
    } catch (error) {
      console.error('Failed to delete notice:', error);
      alert('공지사항 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
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

  // Error state
  if (fetchError || !notice) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-500 mb-2">
            {fetchError || '공지사항을 찾을 수 없습니다.'}
          </p>
          <Button variant="outline" size="sm" onClick={handleBackClick}>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-xl font-semibold p-0 print-hide"
        >
          <ChevronLeft className="w-6 h-6" />
          목록
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex md:px-3 px-2 items-center shadow-none outline-none border border-a2a2a2 md:border-[#575757] focus:border-[#575757] focus:outline-none print-hide"
            onClick={() => {
              if (id) {
                navigate(`/notice/form/${id}`);
              }
            }}
          >
            <img src={fix} alt="수정 아이콘" className="w-5 h-5" />
            <span className="hidden md:block text-sm">수정</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex md:px-3 px-2 items-center shadow-none outline-none border border-a2a2a2 md:border-[#575757] focus:border-[#575757] focus:outline-none print-hide"
              >
                <Download className="w-4 h-4 md:text-black text-[#575757]" />
                <span className="hidden md:block text-sm">다운로드</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => window.print()}>
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            className="flex px-2 md:px-4 items-center shadow-none bg-[#646464] text-white border-none outline-none hover:bg-under hover:text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDelete}
            disabled={isDeleting || !id}
          >
            <img src={deleteIcon} alt="삭제 아이콘" />
            <span className="hidden md:block text-sm">
              {isDeleting ? '삭제 중...' : '삭제'}
            </span>
          </Button>
        </div>
      </div>
      <div className="rounded border border-a5a5a5">
        <div className="flex justify-between px-5 py-3 border-b border-a5a5a5">
          <div className="flex items-center font-semibold text-lg">
            <div className="rounded bg-a5a5a5 px-2 py-1 text-white font-semibold mr-2 text-base">
              {notice.type}
            </div>
            {notice.title}
          </div>
          <div className="flex items-center text-base gap-2">
            <p className="font-semibold">{notice.writer}</p>
            <p className="font-light">{formatDateToYYMMDD(notice.datetime)}</p>
          </div>
        </div>
        <div className="p-8 text-lg">
          {/* Display notice content - handle line breaks */}
          <div className="whitespace-pre-wrap mb-4">{notice.content}</div>

          {/* Display file attachments if available */}
          {detailData?.presigned_links &&
            detailData.presigned_links.length > 0 && (
              <div className="mt-6 border-t border-a5a5a5 pt-4">
                <h3 className="font-semibold mb-3">첨부 파일</h3>

                {/* Separate images, PDFs, and other files */}
                {(() => {
                  const imageFiles = detailData.presigned_links.filter((link) =>
                    isImageFile(link.key)
                  );
                  const pdfFiles = detailData.presigned_links.filter((link) =>
                    isPdfFile(link.key)
                  );
                  const otherFiles = detailData.presigned_links.filter(
                    (link) => !isImageFile(link.key) && !isPdfFile(link.key)
                  );

                  return (
                    <>
                      {/* Image previews grid */}
                      {imageFiles.length > 0 && (
                        <div className="mb-4">
                          <div className="">
                            {imageFiles.map((link, index) => (
                              <div key={index} className="mb-4">
                                <div className="relative w-full rounded-lg overflow-hidden border border-gray-200">
                                  <img
                                    src={link.url}
                                    alt={`첨부 이미지 ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      // Fallback to a placeholder if image fails to load
                                      target.src =
                                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwQzExMC40NjEgMTIwIDExOSAxMTEuNDYxIDExOSAxMDFDMTE5IDkwLjUzODggMTEwLjQ2MSA4MiAxMDAgODJDODkuNTM4OCA4MiA4MSA5MC41Mzg4IDgxIDEwMUM4MSAxMTEuNDYxIDg5LjUzODggMTIwIDEwMCAxMjBaIiBmaWxsPSIjQ0NDQ0NDIi8+CjxwYXRoIGQ9Ik0xNjAgMTYwSDEyMEMxMTcuNzkxIDE2MCAxMTYgMTU4LjIwOSAxMTYgMTU2VjEyMEMxMTYgMTE3Ljc5MSAxMTcuNzkxIDExNiAxMjAgMTE2SDE2MEMxNjIuMjA5IDExNiAxNjQgMTE3Ljc5MSAxNjQgMTIwVjE1NkMxNjQgMTU4LjIwOSAxNjIuMjA5IDE2MCAxNjAgMTYwWiIgc3Ryb2tlPSIjQ0NDQ0NDIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+';
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PDF previews */}
                      {pdfFiles.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2 text-gray-600">
                            PDF 파일
                          </h4>
                          {pdfFiles.map((link, index) => {
                            const filename =
                              link.key.split('/').pop() || `PDF ${index + 1}`;
                            return (
                              <div key={index} className="mb-4">
                                <div className="mb-2 text-sm font-medium text-gray-700">
                                  {filename}
                                </div>
                                <iframe
                                  src={link.url}
                                  className="w-full h-[600px] border border-gray-200 rounded-lg"
                                  title={filename}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Other non-image files as download links */}
                      {otherFiles.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2 text-gray-600">
                            기타 파일
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {otherFiles.map((link, index) => {
                              // Extract filename from key
                              const filename =
                                link.key.split('/').pop() ||
                                `파일 ${index + 1}`;
                              return (
                                <a
                                  key={index}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:border-light-green hover:bg-gray-50 transition-colors"
                                >
                                  <span className="text-lg">📄</span>
                                  <span className="text-sm text-gray-700">
                                    {filename}
                                  </span>
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
        </div>
      </div>
      <div className="mt-6 border border-a5a5a5 rounded grid grid-cols-[auto_1fr] grid-rows-[1fr_1fr] print-hide">
        <button
          onClick={handlePrevClick}
          disabled={!detailData?.next}
          className={`col-start-2 row-start-1 flex items-center gap-2 border-b border-a5a5a5 ${
            detailData?.next
              ? 'cursor-pointer hover:bg-gray-50'
              : 'cursor-not-allowed opacity-50'
          }`}
        >
          <div className="flex items-center h-full border-r border-a5a5a5 gap-2 pr-2">
            <div className="text-base text-gray-500">다음글</div>
            <ChevronDownIcon className="w-5 h-5 -rotate-180" />
          </div>
          <p className="font-medium col-span-1">
            {detailData?.prev?.title || '다음 글이 없습니다'}
          </p>
        </button>
        <button
          onClick={handleNextClick}
          disabled={!detailData?.prev}
          className={`col-start-2 row-start-2 flex items-center transition-colors gap-2 ${
            detailData?.prev
              ? 'cursor-pointer hover:bg-gray-50'
              : 'cursor-not-allowed opacity-50'
          }`}
        >
          <div className="flex items-center h-full border-r border-a5a5a5 gap-2 pr-2">
            <div className="text-base text-gray-500">이전글</div>
            <ChevronDownIcon className="w-5 h-5" />
          </div>
          <p className="font-medium">
            {detailData?.next?.title || '이전 글이 없습니다'}
          </p>
        </button>
      </div>
    </div>
  );
};

export default NoticeDetail;
