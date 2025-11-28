import { useCallback, useEffect, useRef, useState } from 'react';

import { NOTICE_PAGE_SIZE, noticeService } from '@/services/noticeService';
import type { Notice } from '@/types/notice';

interface NoticePaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  modeDesc: boolean;
}

const DEFAULT_PAGE = 1;
const DEFAULT_MODE_DESC = true;

export const useNotices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [modeDesc, setModeDesc] = useState(DEFAULT_MODE_DESC);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Use ref to track latest totalPages for validation in changePage
  const totalPagesRef = useRef(totalPages);

  const loadNotices = useCallback(
    async (pageValue: number, modeValue: boolean) => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const response = await noticeService.getAllNotices(
          pageValue,
          modeValue
        );

        setNotices(response.items);
        setTotalPages(response.totalPages);
        totalPagesRef.current = response.totalPages; // Update ref
        setTotalItems(response.totalItems);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '공지사항 불러오기 실패';
        setFetchError(errorMessage);
        console.error('useNotices - loadNotices error:', error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getNoticeById = useCallback(
    async (id: number, mode: boolean = true) => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = await noticeService.getNoticeById(id, mode);
        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : '공지사항 상세 불러오기 실패';
        setFetchError(errorMessage);
        console.error('useNotices - getNoticeById error:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadNotices(currentPage, modeDesc);
  }, [currentPage, modeDesc, loadNotices]);

  // Keep ref in sync with totalPages state
  useEffect(() => {
    totalPagesRef.current = totalPages;
  }, [totalPages]);

  useEffect(() => {
    // Ensure currentPage doesn't exceed totalPages after data is loaded
    if (currentPage > totalPages && totalPages > 0) {
      console.log(
        `Adjusting page from ${currentPage} to ${totalPages} (totalPages updated)`
      );
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const changePage = useCallback(
    (page: number) => {
      // Use functional update to access latest state values
      setCurrentPage((prev) => {
        // Validate page number
        if (page < 1) {
          console.warn(`Invalid page number: ${page}. Using page 1 instead.`);
          return prev === 1 ? prev : 1;
        }

        // Use ref to get latest totalPages (avoids stale closure)
        const latestTotalPages = totalPagesRef.current;
        const maxPage = Math.max(1, latestTotalPages || 1);
        const safePage = Math.min(page, maxPage);

        if (safePage === prev) {
          return prev; // No change needed
        }

        console.log(
          `Changing page from ${prev} to ${safePage} (requested: ${page}, totalPages: ${latestTotalPages})`
        );
        return safePage;
      });
    },
    [] // No dependencies needed since we use ref
  );

  const changeSortMode = useCallback((isDescending: boolean) => {
    setModeDesc(isDescending);
    setCurrentPage(1);
  }, []);

  const pagination: NoticePaginationState = {
    currentPage,
    totalPages,
    totalItems,
    pageSize: NOTICE_PAGE_SIZE,
    modeDesc,
  };

  const refetch = () => {
    loadNotices(currentPage, modeDesc);
  };

  const deleteNotice = useCallback(async (id: number) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await noticeService.deleteNotice(id);
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '공지사항 삭제 실패';
      setFetchError(errorMessage);
      console.error('useNotices - deleteNotice error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    notices,
    isLoading,
    fetchError,
    pagination,
    setPage: changePage,
    setSortMode: changeSortMode,
    refetch,
    getNoticeById,
    deleteNotice,
  };
};
