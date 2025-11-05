import React, { useMemo } from 'react';

import type { DateRange } from 'react-day-picker';

import { useComplaints } from '../../hooks/useComplaints';
import ComplaintListCard from './ComplaintListCard';

interface ComplaintListContainerProps {
  dateRange?: DateRange;
  selectedCategory?: string;
  selectedAreas?: string[];
  onCategoryChange?: (category: string) => void;
}

const ComplaintListContainer: React.FC<ComplaintListContainerProps> = ({
  dateRange,
  selectedCategory,
  selectedAreas = [],
}) => {
  const { complaints, isLoading, fetchError } = useComplaints(dateRange);

  const filtered = useMemo(() => {
    if (!selectedCategory || selectedCategory === '전체') return complaints;
    return complaints.filter((complaint) => {
      const categoryMatch = complaint.teams.some(
        (team) => team.category === selectedCategory
      );

      const regionMatch =
        selectedAreas.length === 0 ||
        selectedAreas.includes(complaint.address.region_nm);

      return categoryMatch && regionMatch;
    });
  }, [selectedCategory, complaints, selectedAreas]);

  return (
    <div className="w-full h-full flex flex-col">
      {isLoading && (
        <div className="text-center text-gray-500 py-5">
          <p className="text-sm">민원 목록을 불러오는 중...</p>
        </div>
      )}
      {fetchError && (
        <div className="text-center text-red-500 py-5">
          <p className="text-sm">에러: {fetchError}</p>
        </div>
      )}
      {!isLoading && !fetchError && filtered.length === 0 && (
        <div className="text-center text-gray-500 py-5">
          <p className="text-sm">해당 기간에 민원이 없습니다.</p>
        </div>
      )}
      {!isLoading && !fetchError && filtered.length > 0 && (
        <div className="flex flex-col h-full">
          <div className="px-2 pb-5">
            <p className="font-semibold text-sm pb-1 mb-5 border-b border-d9d9d9">
              전체 민원 목록
            </p>
            <div className="xxxs:h-[63vh] xxs:h-[60vh] xs:h-[71vh] xsm:h-[71vh] space-y-3 overflow-y-auto scrollbar-hide">
              {filtered
                .sort((a, b) => b.id - a.id)
                .map((complaint) => (
                  <ComplaintListCard key={complaint.id} complaint={complaint} />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintListContainer;
