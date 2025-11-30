import type { TransformedStatisticsData } from '@/types/statistics';

export const getHybridChartData = (
  transformedData: TransformedStatisticsData | null
) => {
  // If we have API data, always use it (even if empty arrays)
  if (transformedData) {
    return {
      complaintTypeData: transformedData.positiveNegatives || [],
      dongComplaintData: transformedData.regions || [],
      complaintData: transformedData.positiveNegatives || [],
      timeSlotData: transformedData.timePeriods || [],
      weekdayData: transformedData.days || [],
    };
  }

  // If no API data, return empty arrays instead of dummy data
  return {
    complaintTypeData: [],
    dongComplaintData: [],
    complaintData: [],
    timeSlotData: [],
    weekdayData: [],
  };
};

// Helper function to check if we should show the first pie chart
export const shouldShowFirstPieChart = (
  selectedCategory: string | null,
  hasRegionData: boolean = false
): boolean => {
  // Don't show first pie chart if region data is present
  if (hasRegionData) return false;

  return (
    !selectedCategory ||
    selectedCategory === '전체통계' ||
    selectedCategory === '성상별'
  );
};
