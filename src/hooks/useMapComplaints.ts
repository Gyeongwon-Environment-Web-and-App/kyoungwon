import { useCallback, useEffect, useState } from 'react';

import type { DateRange } from 'react-day-picker';

import { complaintService } from '@/services/complaintService';
import type { Complaint } from '@/types/complaint';

// Map English filter IDs to Korean category names for API
const mapCategoryToKorean = (categoryId: string): string => {
  const categoryMap: Record<string, string> = {
    general: '생활',
    recycle: '재활용',
    food: '음식물',
    others: '기타',
    bad: '반복민원',
    all: 'all',
  };

  return categoryMap[categoryId] || categoryId;
};

export const useMapComplaints = (
  category?: string,
  dateRange?: DateRange,
  onCategoryReset?: () => void
) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Helper function to fetch all complaints and handle common logic
  const fetchAllComplaints = useCallback(async (): Promise<Complaint[]> => {
    const allData = await complaintService.getComplaintsByCategoryAndOrDates(
      undefined,
      undefined
    );
    return allData.sort((a, b) => b.id - a.id);
  }, []);

  // Helper function to handle empty category response
  const handleEmptyCategoryResponse = useCallback(
    async (koreanCategory: string) => {
      window.alert(`${koreanCategory} 카테고리의 민원이 없습니다.`);

      try {
        const sortedAllData = await fetchAllComplaints();
        setComplaints(sortedAllData);

        // Reset category state to "all" when showing all pins
        if (onCategoryReset) {
          onCategoryReset();
        }
      } catch (fallbackError) {
        console.error('Failed to fetch all complaints:', fallbackError);
        setComplaints([]);
      }
    },
    [fetchAllComplaints, onCategoryReset]
  );

  // Helper function to handle category-specific errors
  const handleCategoryError = useCallback(
    async (currentCategory: string, koreanCategory: string) => {
      if (currentCategory === 'bad') {
        window.alert('반복민원 데이터를 불러오는데 실패했습니다.');
        setComplaints([]);
      } else {
        window.alert(`${koreanCategory} 카테고리의 민원이 없습니다.`);

        try {
          const sortedAllData = await fetchAllComplaints();
          setComplaints(sortedAllData);

          // Reset category state to "all" when showing all pins
          if (onCategoryReset) {
            onCategoryReset();
          }
        } catch (fallbackError) {
          console.error('Failed to fetch all complaints:', fallbackError);
          setComplaints([]);
        }
      }
    },
    [fetchAllComplaints, onCategoryReset]
  );

  const loadComplaints = useCallback(
    async (currentCategory?: string, currentDateRange?: DateRange) => {
      setIsLoading(true);
      setFetchError(null);

      // Cache Korean category mapping to avoid redundant calls
      const koreanCategory = currentCategory
        ? mapCategoryToKorean(currentCategory)
        : undefined;

      try {
        let data: Complaint[];

        if (currentCategory === 'bad') {
          data = await complaintService.getComplaintsByNegs(currentDateRange);
        } else {
          const categoryForApi =
            currentCategory && currentCategory !== 'all'
              ? koreanCategory
              : undefined;
          data = await complaintService.getComplaintsByCategoryAndOrDates(
            currentDateRange,
            categoryForApi
          );
        }

        const sortedData = data.sort((a, b) => b.id - a.id);

        console.log('Map complaints fetched:', {
          complaints: sortedData,
          category: currentCategory,
        });

        // Check if no data returned for specific category
        if (
          sortedData.length === 0 &&
          currentCategory &&
          currentCategory !== 'all' &&
          koreanCategory
        ) {
          await handleEmptyCategoryResponse(koreanCategory);
          return;
        }

        setComplaints(sortedData);
      } catch (error) {
        // Handle category-specific errors
        if (currentCategory && currentCategory !== 'all' && koreanCategory) {
          await handleCategoryError(currentCategory, koreanCategory);
        } else {
          setComplaints([]);
        }

        setFetchError('지도 민원 불러오기 실패');
        console.log('Map Complaint Service - load Complaints:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [handleEmptyCategoryResponse, handleCategoryError]
  );

  useEffect(() => {
    loadComplaints(category, dateRange);
  }, [category, dateRange, loadComplaints]);

  const getComplaintById = useCallback(async (id: string) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await complaintService.getComplaintById(id);
      return data;
    } catch (error) {
      console.error('Error in useMapComplaints.getComplaintById:', error);
      setFetchError('민원 불러오기 실패');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    complaints,
    isLoading,
    fetchError,
    refetch: () => loadComplaints(category, dateRange),
    getComplaintById,
  };
};
