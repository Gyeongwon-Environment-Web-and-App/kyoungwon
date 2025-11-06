import type { BarChartItem, ChartDataItem } from '../types/stats';

// 더미 데이터
export const complaintTypeData: ChartDataItem[] = [
  { name: '재활용', value: 12 },
  { name: '생활', value: 20 },
  { name: '기타', value: 8 },
  { name: '음식물', value: 17 },
];

export const dongComplaintData: ChartDataItem[] = [
  { name: '쌍문 1동', value: 11 },
  { name: '쌍문 2동', value: 9 },
  { name: '쌍문 3동', value: 12 },
  { name: '쌍문 4동', value: 8 },
  { name: '방학 1동', value: 13 },
  { name: '방학 3동', value: 4 },
];

export const complaintData: ChartDataItem[] = [
  { name: '반복 민원', value: 3 },
  { name: '생활 민원', value: 54 },
];

export const timeSlotData: BarChartItem[] = [
  { time: '8:30~9:30', 재활용: 2, 생활: 4, 기타: 1, 음식물: 1 },
  { time: '9:30~10:30', 재활용: 1, 생활: 1, 기타: 1, 음식물: 1 },
  { time: '10:30~11:30', 재활용: 2, 생활: 2, 기타: 1, 음식물: 1 },
  { time: '11:30~12:30', 재활용: 3, 생활: 2, 기타: 1, 음식물: 2 },
  { time: '12:30~1:30', 재활용: 0, 생활: 0, 기타: 0, 음식물: 0 },
  { time: '1:30~2:30', 재활용: 2, 생활: 4, 기타: 1, 음식물: 1 },
  { time: '2:30~3:30', 재활용: 3, 생활: 5, 기타: 1, 음식물: 1 },
  { time: '3:30~4:30', 재활용: 3, 생활: 4, 기타: 1, 음식물: 1 },
  { time: '4:30~5:30', 재활용: 0, 생활: 2, 기타: 0, 음식물: 2 },
];

export const weekdayData: BarChartItem[] = [
  { time: '월요일', 재활용: 2, 생활: 3, 기타: 3, 음식물: 4 },
  { time: '화요일', 재활용: 1, 생활: 2, 기타: 0, 음식물: 3 },
  { time: '수요일', 재활용: 2, 생활: 3, 기타: 3, 음식물: 4 },
  { time: '목요일', 재활용: 4, 생활: 2, 기타: 3, 음식물: 6 },
  { time: '금요일', 재활용: 2, 생활: 4, 기타: 3, 음식물: 3 },
];
