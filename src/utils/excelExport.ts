import * as XLSX from 'xlsx';

import type { BarChartItem } from '@/types/stats';

interface CategoryData {
  total_count: number;
  trucks: Array<{
    truck_no: string;
    count: number;
    drivers: string[];
  }>;
}

interface ExcelExportData {
  rawCategories: Record<string, CategoryData> | null;
  regionPie: Array<{ name: string; value: number }>;
  daysBar: Array<{ time: string; count: number }>;
  posNegPie: Array<{ name: string; value: number }>;
  timeSlotData?: BarChartItem[];
  dateRange?: { from?: Date; to?: Date };
}

export const exportStatisticsToExcel = (data: ExcelExportData) => {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Categories with Trucks (detailed)
  if (data.rawCategories) {
    const categoryRows: Array<Record<string, string | number>> = [];
    Object.entries(data.rawCategories).forEach(([category, catData]) => {
      const trucks = Array.isArray(catData.trucks) ? catData.trucks : [];

      if (trucks.length > 0) {
        trucks.forEach((truck) => {
          categoryRows.push({
            '쓰레기 종류': category,
            '총 건수': catData.total_count,
            '차량 번호': truck.truck_no,
            '차량별 건수': truck.count,
            기사: truck.drivers.join(', ') || '(없음)',
          });
        });
      } else {
        // Category w/ X trucks
        categoryRows.push({
          '쓰레기 종류': category,
          '총 건수': catData.total_count,
          '차량 번호': '(없음)',
          '차량별 건수': 0,
          기사: '(없음)',
        });
      }
    });

    const categorySheet = XLSX.utils.json_to_sheet(categoryRows);
    XLSX.utils.book_append_sheet(workbook, categorySheet, '쓰레기 종류별');
  }

  // Sheet 2: Regions
  if (data.regionPie.length > 0) {
    const regionRows = data.regionPie.map((item) => ({
      지역: item.name,
      '민원 개수': item.value,
    }));
    const regionSheet = XLSX.utils.json_to_sheet(regionRows);
    XLSX.utils.book_append_sheet(workbook, regionSheet, '지역별');
  }

  // Sheet 3: Weekdays
  if (data.daysBar.length > 0) {
    const weekdayRows = data.daysBar.map((item) => ({
      요일: item.time,
      '민원 개수': item.count,
    }));
    const weekdaySheet = XLSX.utils.json_to_sheet(weekdayRows);
    XLSX.utils.book_append_sheet(workbook, weekdaySheet, '요일별');
  }

  // Sheet 4: Complaint Types (Pos/Neg)
  if (data.posNegPie.length > 0) {
    const complaintRows = data.posNegPie.map((item) => ({
      '민원 유형': item.name,
      '민원 개수': item.value,
    }));
    const complaintSheet = XLSX.utils.json_to_sheet(complaintRows);
    XLSX.utils.book_append_sheet(workbook, complaintSheet, '민원 유형별');
  }

  // Sheet 5: Time slots
  if (data.timeSlotData && data.timeSlotData.length > 0) {
    const timeSlotRows = data.timeSlotData.map((item) => {
      const { time, hour, ...counts } = item;
      const total = Object.values(counts).reduce<number>((sum, value) => {
        const numeric = Number(value);
        return sum + (Number.isNaN(numeric) ? 0 : numeric);
      }, 0);
      return {
        시간대: String(time ?? hour ?? ''),
        '민원 개수': total,
      };
    });
    const timeSlotSheet = XLSX.utils.json_to_sheet(timeSlotRows);
    XLSX.utils.book_append_sheet(workbook, timeSlotSheet, '시간대별');
  }

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  let filename = '경원환경개발_민원통계';
  if (data.dateRange?.from && data.dateRange?.to) {
    filename = `민원통계_${formatDate(data.dateRange.from)}_${formatDate(data.dateRange.to)}`;
  }

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
