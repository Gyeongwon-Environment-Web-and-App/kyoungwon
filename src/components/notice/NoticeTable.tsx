import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { type ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotices } from '@/hooks/useNotices';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from '@/lib/icons';
import type { Notice } from '@/types/notice';
import { formatDateToYYMMDD } from '@/utils/formatDate';

import filter from '../../assets/icons/actions/filter.svg';
import { Button } from '../ui/button';

const NoticeTable: React.FC = () => {
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortOrder, setSortOrder] = useState<'최근순' | '오래된순'>('최근순');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const {
    notices: apiNotices,
    isLoading,
    fetchError,
    pagination,
    setPage,
    setSortMode,
    refetch,
  } = useNotices();

  const navigate = useNavigate();

  const filterNoticesByTerm = useCallback((source: Notice[], term: string) => {
    const searchLower = term.toLowerCase();

    return source.filter((notice) => {
      return (
        notice.id.toString().includes(searchLower) ||
        notice.type.toLowerCase().includes(searchLower) ||
        notice.title.toLowerCase().includes(searchLower) ||
        notice.writer.toLowerCase().includes(searchLower) ||
        notice.content.toLowerCase().includes(searchLower) ||
        notice.datetime.toLowerCase().includes(searchLower)
      );
    });
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      setFilteredNotices(filterNoticesByTerm(apiNotices, searchTerm));
    } else {
      setFilteredNotices(apiNotices);
    }
  }, [apiNotices, searchTerm, filterNoticesByTerm]);

  const handlePageChange = (page: number) => {
    // Validation is handled in useNotices hook, but add basic bounds check for UI safety
    if (page < 1) {
      console.warn(`Invalid page number: ${page}. Minimum page is 1.`);
      return;
    }
    // setPage in useNotices will handle validation against totalPages
    setPage(page);
  };
  const handleFirstPage = () => {
    if (paginationInfo.totalPages > 0) {
      setPage(1);
    }
  };
  const handleLastPage = () => {
    if (paginationInfo.totalPages > 0) {
      setPage(paginationInfo.totalPages);
    }
  };
  const handlePrevPage = () => {
    if (paginationInfo.hasPrevPage) {
      setPage(paginationInfo.currentPage - 1);
    }
  };
  const handleNextPage = () => {
    if (paginationInfo.hasNextPage) {
      setPage(paginationInfo.currentPage + 1);
    }
  };
  const generatePageNumbers = () => {
    const { totalPages, currentPage } = paginationInfo;

    // Handle edge cases
    if (totalPages <= 0) {
      return [];
    }

    if (totalPages === 1) {
      return [1];
    }

    const pages = [];
    const maxVisiblePages = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // 시간 필터링 함수
  const handleSortChange = (order: '최근순' | '오래된순') => {
    setSortOrder(order);
    const isDescending = order === '최근순';
    setSortMode(isDescending);
  };

  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);

    if (!searchValue.trim()) {
      setFilteredNotices(apiNotices);
      return;
    }

    const filtered = filterNoticesByTerm(apiNotices, searchValue);
    setFilteredNotices(filtered);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRowClick = (notice: Notice) => {
    navigate(`/post/getPostById/${notice.id}/true`);
  };

  const paginationInfo = useMemo(() => {
    const hasItems = pagination.totalItems > 0;
    const totalPages = hasItems ? Math.max(1, pagination.totalPages) : 0;
    const currentPage = hasItems
      ? Math.min(pagination.currentPage, totalPages)
      : 0;

    return {
      totalItems: pagination.totalItems,
      totalPages,
      currentPage,
      pageSize: pagination.pageSize,
      hasPrevPage: hasItems ? currentPage > 1 : false,
      hasNextPage: hasItems ? currentPage < totalPages : false,
    };
  }, [pagination]);

  const columns: ColumnDef<Notice>[] = [
    {
      accessorKey: 'id',
      header: '글 번호',
      cell: ({ row }) => (
        <div className="text-center">{row.getValue('id')}</div>
      ),
    },
    {
      accessorKey: 'type',
      header: '공지 구분',
      cell: ({ row }) => (
        <div className="text-center truncate flex-1">
          {row.getValue('type')}
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: '제목',
      cell: ({ row }) => (
        <div className="text-left truncate">{row.getValue('title')}</div>
      ),
    },
    {
      accessorKey: 'writer',
      header: '작성자',
      cell: ({ row }) => (
        <div className="text-center truncate">
          {row.getValue('writer') || '담당자 없음'}
        </div>
      ),
    },
    {
      accessorKey: 'datetime',
      header: '작성 일자',
      cell: ({ row }) => (
        <div className="text-center">
          {formatDateToYYMMDD(row.getValue('datetime'))}
        </div>
      ),
    },
  ];

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

  if (fetchError) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-500 mb-2">{fetchError}</p>
          <Button variant="outline" size="sm" onClick={refetch}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 검색 및 필터 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] mb-3">
        {/* 검색 영역 */}
        <div className="flex gap-2 items-center justify-start mb-3 lg:mb-0">
          <div className="relative flex flex-1 lg:flex-auto lg:max-w-60">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                isSearchFocused ? 'text-light-green' : 'text-[#575757]'
              }`}
            />
            <input
              type="text"
              placeholder="제목+내용 검색"
              className="pl-10 pr-4 py-1 border border-[#575757] rounded-md focus:outline-none focus:ring-1 focus:ring-light-green focus:border-transparent mx-[2px] flex-1 md:flex-auto"
              value={searchTerm}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shadow-none bg-[#646464] text-white border-none w-[3rem] outline-none hover:bg-under hover:text-white text-sm flex-shrink-0"
            onClick={() => handleSearch(searchTerm)}
          >
            검색
          </Button>
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-2">
          <div className="flex flex-wrap md:flex-nowrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center w-24 border border-a2a2a2 md:border-[#575757] outline-none text-sm p-0"
                  title={`현재: ${sortOrder === '최근순' ? '최근순' : '오래된순'}`}
                >
                  <img
                    src={filter}
                    alt="시간순서 필터 버튼"
                    className="object-cover w-5"
                  />
                  {sortOrder}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleSortChange('최근순')}>
                  최근 민원 순
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('오래된순')}>
                  옛 민원 순
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-x-auto">
        <DataTable
          columns={columns}
          data={filteredNotices}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Pagination */}
      {paginationInfo.totalPages > 0 && (
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-none outline-none shadow-none"
              onClick={handleFirstPage}
              disabled={!paginationInfo.hasPrevPage}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-none outline-none shadow-none"
              onClick={handlePrevPage}
              disabled={!paginationInfo.hasPrevPage}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center space-x-1">
              {generatePageNumbers().map((page) => (
                <Button
                  key={page}
                  variant={
                    page === paginationInfo.currentPage ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-8 h-8 border-none outline-none shadow-none text-sm"
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="border-none outline-none shadow-none"
              onClick={handleNextPage}
              disabled={!paginationInfo.hasNextPage}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-none outline-none shadow-none"
              onClick={handleLastPage}
              disabled={!paginationInfo.hasNextPage}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeTable;
