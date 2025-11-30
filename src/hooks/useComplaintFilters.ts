import { useCallback, useEffect, useState } from 'react';

import type { DateRange } from 'react-day-picker';

import { useRegionStatistics } from '@/hooks/useRegionStatistics';
import { useStatistics } from '@/hooks/useStatistics';
import { useTimePeriodByDay } from '@/hooks/useTimePeriodByDay';

export const useComplaintFilters = (externalDateRange?: DateRange) => {
  const [internalDateRange, setInternalDateRange] = useState<
    DateRange | undefined
  >();
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedTrashType, setSelectedTrashType] =
    useState<string>('성상별');
  const [selectedTimeline, setSelectedTimeline] =
    useState<string>('전체 시간대');
  const [selectedWeekday, setSelectedWeekday] = useState<string>('전체 요일');

  const dateRange = externalDateRange ?? internalDateRange;
  // Always provide a function for setDateRange - no-op when external dateRange is provided
  const setDateRange: (range: DateRange | undefined) => void = externalDateRange
    ? () => {
        // No-op when external dateRange is provided
      }
    : setInternalDateRange;

  const {
    transformedData,
    isLoading,
    error,
    fetchStatistics,
    clearStatistics,
  } = useStatistics();

  const {
    regionData,
    isLoading: regionLoading,
    error: regionError,
    fetchRegionStatistics,
    clearRegionStatistics,
  } = useRegionStatistics();

  const {
    data: timePeriodByDayData,
    isLoading: timePeriodByDayLoading,
    error: timePeriodByDayError,
    fetchTimePeriodByDay,
    clearData: clearTimePeriodByDay,
  } = useTimePeriodByDay();

  const getSelectedAreaDisplay = useCallback((areas: string[]) => {
    if (areas.length === 0) return '전체 지역';

    const 쌍문Children = ['쌍문 1동', '쌍문 2동', '쌍문 3동', '쌍문 4동'];
    const 방학Children = ['방학 1동', '방학 3동'];

    const selected쌍문Children = 쌍문Children.filter((child) =>
      areas.includes(child)
    );
    const selected방학Children = 방학Children.filter((child) =>
      areas.includes(child)
    );

    const displayParts = [];

    if (selected쌍문Children.length === 쌍문Children.length) {
      displayParts.push('쌍문동');
    } else if (selected쌍문Children.length > 0) {
      displayParts.push(selected쌍문Children.join(', '));
    }

    if (selected방학Children.length === 방학Children.length) {
      displayParts.push('방학동');
    } else if (selected방학Children.length > 0) {
      displayParts.push(selected방학Children.join(', '));
    }

    return displayParts.join(', ');
  }, []);

  const handleAreaSelectionChange = useCallback(
    async (areas: string[]) => {
      setSelectedAreas(areas);

      // Clear trash type data when switching to region selection
      if (areas.length > 0) {
        setSelectedTrashType('성상별');
        clearStatistics();
      }

      if (areas.length > 0) {
        // Fetch region statistics when areas are selected
        await fetchRegionStatistics(areas, selectedTimeline, dateRange);
      } else {
        // Clear region statistics when no areas are selected
        clearRegionStatistics();
      }
    },
    [
      selectedTimeline,
      dateRange,
      fetchRegionStatistics,
      clearRegionStatistics,
      clearStatistics,
    ]
  );

  const handleTrashTypeChange = useCallback(
    async (trashType: string) => {
      setSelectedTrashType(trashType);

      setSelectedAreas([]);
      clearRegionStatistics();

      if (trashType === '전체통계' || trashType === '성상별') {
        clearStatistics();
        return;
      }

      await fetchStatistics([trashType], dateRange);
    },
    [dateRange, fetchStatistics, clearStatistics, clearRegionStatistics]
  );

  // Effect to handle filter changes and trigger data fetching
  useEffect(() => {
    const fetchData = async () => {
      // If areas are selected, fetch region statistics
      if (selectedAreas.length > 0) {
        await fetchRegionStatistics(selectedAreas, selectedTimeline, dateRange);
      } else {
        // Clear region statistics when no areas are selected
        clearRegionStatistics();
      }

      // If trash type is selected and not default, fetch statistics
      if (
        selectedTrashType &&
        selectedTrashType !== '전체통계' &&
        selectedTrashType !== '성상별'
      ) {
        await fetchStatistics([selectedTrashType], dateRange);
      } else {
        // Clear statistics when default trash type is selected
        clearStatistics();
      }
    };

    fetchData();
  }, [
    selectedAreas,
    selectedTimeline,
    selectedWeekday,
    selectedTrashType,
    dateRange,
    fetchRegionStatistics,
    clearRegionStatistics,
    fetchStatistics,
    clearStatistics,
  ]);

  // Effect to reset related filters when one filter changes
  useEffect(() => {
    // Reset timeline and weekday when trash type changes
    if (selectedTrashType !== '성상별') {
      setSelectedTimeline('전체 시간대');
      setSelectedWeekday('전체 요일');
    }
  }, [selectedTrashType]);

  useEffect(() => {
    if (selectedWeekday !== '전체 요일' || dateRange) {
      fetchTimePeriodByDay(dateRange, selectedWeekday);
    } else {
      clearTimePeriodByDay();
    }
  }, [selectedWeekday, dateRange, fetchTimePeriodByDay, clearTimePeriodByDay]);

  useEffect(() => {
    // Reset timeline and weekday when areas change
    setSelectedTimeline('전체 시간대');
    setSelectedWeekday('전체 요일');
  }, [selectedAreas]);

  useEffect(() => {
    const shouldSelectAllAreas =
      selectedWeekday !== '전체 요일' ||
      (selectedTrashType &&
        selectedTrashType !== '전체통계' &&
        selectedTrashType !== '성상별');

    if (shouldSelectAllAreas && selectedAreas.length === 0) {
      const allAreas = [
        '쌍문동',
        '쌍문 1동',
        '쌍문 2동',
        '쌍문 3동',
        '쌍문 4동',
        '방학동',
        '방학 1동',
        '방학 3동',
      ];

      handleAreaSelectionChange(allAreas);
    }
  }, [
    selectedWeekday,
    selectedTrashType,
    selectedAreas.length,
    handleAreaSelectionChange,
  ]);

  return {
    // State
    dateRange,
    setDateRange,
    selectedAreas,
    selectedTrashType,
    selectedTimeline,
    selectedWeekday,

    // Data
    transformedData,
    regionData,
    timePeriodByDayData,

    // Loading states
    isLoading,
    regionLoading,
    timePeriodByDayLoading,

    // Error states
    error,
    regionError,
    timePeriodByDayError,

    // Handlers
    handleAreaSelectionChange,
    handleTrashTypeChange,
    getSelectedAreaDisplay,

    // Setters for dropdowns
    setSelectedTimeline,
    setSelectedWeekday,
  };
};
