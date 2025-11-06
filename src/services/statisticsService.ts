import type { DateRange } from 'react-day-picker';

import apiClient from '@/lib/api';
import {
  type AllByDaysResponse,
  type CategoriesDaysRequest,
  type CategoriesDaysResponse,
  type CategoriesPosNegRequest,
  type CategoriesPosNegResponse,
  type CategoriesRegionsRequest,
  type CategoriesRegionsResponse,
  type CategoriesTimePeriodsRequest,
  type CategoriesTimePeriodsResponse,
  type StatisticsData,
  type TimePeriodByDayResponse,
  type TimerPeriodByDayRequest,
} from '@/types/statistics';

const getDefaultDateRange = (): { startDate: string; endDate: string } => {
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);

  return {
    startDate: oneMonthAgo.toISOString(),
    endDate: today.toISOString(),
  };
};

const getDateRangeFromPicker = (
  dateRange?: DateRange
): { startDate: string; endDate: string } => {
  if (dateRange?.from && dateRange?.to) {
    return {
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.to.toISOString(),
    };
  }
  return getDefaultDateRange();
};

export const statisticsService = {
  async getAllByCategories(
    categories: string[],
    dateRange?: DateRange
  ): Promise<{ message: string; data: Record<string, { count: number }> }> {
    try {
      const { startDate, endDate } = getDateRangeFromPicker(dateRange);
      const response = await apiClient.post<{
        message: string;
        data: Record<string, { count: number }>;
      }>(`/stat/all_by_categories`, {
        startDate,
        endDate,
        categories,
      });
      console.log('statsService-getAllByCategories:', response.data);
      return response.data;
    } catch (error) {
      console.error('카테고리 전체 통계 불러오기 실패', error);
      throw error;
    }
  },

  async getAllByRegions(
    regions: string[],
    dateRange?: DateRange
  ): Promise<{ message: string; data: Record<string, { count: number }> }> {
    try {
      const { startDate, endDate } = getDateRangeFromPicker(dateRange);
      const response = await apiClient.post<{
        message: string;
        data: Record<string, { count: number }>;
      }>(`/stat/all_by_regions`, {
        startDate,
        endDate,
        regions,
      });

      console.log('statsService-getAllByRegions:', response.data);
      return response.data;
    } catch (error) {
      console.error('지역 전체 통계 불러오기 실패', error);
      throw error;
    }
  },
  async getCategoriesPosNeg(
    categories: string[],
    dateRange?: DateRange
  ): Promise<CategoriesPosNegResponse> {
    try {
      const { startDate, endDate } = getDateRangeFromPicker(dateRange);
      const requestBody: CategoriesPosNegRequest = {
        startDate,
        endDate,
        categories,
      };
      const response = await apiClient.post<CategoriesPosNegResponse>(
        '/stat/categories_positive_negatives',
        requestBody
      );
      return response.data;
    } catch (error) {
      console.error('반복민원 통계 불러오기 실패', error);
      throw error;
    }
  },

  async getCategoriesDays(
    categories: string[],
    dateRange?: DateRange
  ): Promise<CategoriesDaysResponse> {
    try {
      const { startDate, endDate } = getDateRangeFromPicker(dateRange);
      const requestBody: CategoriesDaysRequest = {
        startDate,
        endDate,
        categories,
        days: [1, 2, 3, 4, 5],
      };

      const response = await apiClient.post<CategoriesDaysResponse>(
        '/stat/categories_days',
        requestBody
      );

      return response.data;
    } catch (error) {
      console.error('요일별 통계 불러오기 실패', error);
      throw error;
    }
  },

  async getCategoriesTimePeriods(
    categories: string[],
    dateRange?: DateRange
  ): Promise<CategoriesTimePeriodsResponse> {
    try {
      const { startDate, endDate } = getDateRangeFromPicker(dateRange);
      const requestBody: CategoriesTimePeriodsRequest = {
        startDate,
        endDate,
        categories,
        startTime: '9:30',
        endTime: '17:30',
      };

      const response = await apiClient.post<CategoriesTimePeriodsResponse>(
        '/stat/categories_time_periods',
        requestBody
      );

      return response.data;
    } catch (error) {
      console.error('시간대별 통계 불러오기 실패', error);
      throw error;
    }
  },

  async getCategoriesRegions(
    categories: string[],
    dateRange?: DateRange
  ): Promise<CategoriesRegionsResponse> {
    try {
      const { startDate, endDate } = getDateRangeFromPicker(dateRange);
      const requestBody: CategoriesRegionsRequest = {
        startDate,
        endDate,
        categories,
      };

      const response = await apiClient.post<CategoriesRegionsResponse>(
        '/stat/categories_regions',
        requestBody
      );

      return response.data;
    } catch (error) {
      console.error('동별 통계 불러오기 실패', error);
      throw error;
    }
  },

  async getAllStatistics(
    categories: string[],
    dateRange?: DateRange
  ): Promise<StatisticsData> {
    try {
      console.log(`🌐 ${categories.join(' ')}의 통계 정보 불러오기`);
      const [positiveNegatives, days, timePeriods, regions] = await Promise.all(
        [
          this.getCategoriesPosNeg(categories, dateRange),
          this.getCategoriesDays(categories, dateRange),
          this.getCategoriesTimePeriods(categories, dateRange),
          this.getCategoriesRegions(categories, dateRange),
        ]
      );

      const result: StatisticsData = {
        positiveNegatives,
        days,
        timePeriods,
        regions,
      };
      console.log(`✅ 모든 통계 fetch 성공:`, result);
      return result;
    } catch (error) {
      console.log(
        `😈 ${categories.join(' ')}의 통계 정보 불러오기 실패: ${error}`
      );
      throw error;
    }
  },

  async getTimePeriodByDay(
    dateRange?: DateRange,
    selectedWeekDay?: string
  ): Promise<TimePeriodByDayResponse> {
    try {
      const { startDate, endDate } = getDateRangeFromPicker(dateRange);
      const weekdayMap: Record<string, number> = {
        월요일: 1,
        화요일: 2,
        수요일: 3,
        목요일: 4,
        금요일: 5,
        토요일: 6,
        일요일: 7,
      };
      const days =
        selectedWeekDay && selectedWeekDay !== '전체 요일'
          ? [weekdayMap[selectedWeekDay]]
          : [1, 2, 3, 4, 5, 6, 7];
      const requestBody: TimerPeriodByDayRequest = {
        startDate,
        endDate,
        startTime: '8:30',
        endTime: '17:30',
        days,
      };
      const response = await apiClient.post<TimePeriodByDayResponse>(
        '/stat/time_period_by_day',
        requestBody
      );

      return response.data;
    } catch (error) {
      console.log('statService-getTimePeriodByDay:', error);
      throw error;
    }
  },

  async getAllByDays(dateRange?: DateRange): Promise<AllByDaysResponse> {
    try {
      const { startDate, endDate } = getDateRangeFromPicker(dateRange);
      const response = await apiClient.post<AllByDaysResponse>(
        '/stat/all_by_days',
        {
          startDate,
          endDate,
          days: [1, 2, 3, 4, 5],
        }
      );
      console.log('statsService-getAllByDays:', response.data);
      return response.data;
    } catch (error) {
      console.error('요일별 전체 통계 불러오기 실패', error);
      throw error;
    }
  },

  async getAllByPosNeg(
    dateRange?: DateRange
  ): Promise<{ pos: number; neg: number }> {
    try {
      const { startDate, endDate } = getDateRangeFromPicker(dateRange);
      const response = await apiClient.post<{
        message: string;
        data: { pos: number; neg: number };
      }>('/stat/all_by_positives_negatives', {
        startDate,
        endDate,
      });
      console.log('statsService-getAllByPosNeg:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('statsService-getAllByPosNeg:', error);
      throw error;
    }
  },
};
