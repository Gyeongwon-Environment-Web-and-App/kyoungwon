import React, { useEffect, useMemo } from 'react';

import type { DateRange } from 'react-day-picker';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useComplaintCharts } from '@/hooks/useComplaintCharts';
import { useComplaintFilters } from '@/hooks/useComplaintFilters';
import { useInitialStats } from '@/hooks/useInitialStats';
import type { BarChartItem } from '@/types/stats';

import { SimplePieChart } from '../statistics/SimplePieChart';
import { SimpleTimeSlotChart } from '../statistics/SimpleTimeSlotChart';
import { SimpleWeekdayChart } from '../statistics/SimpleWeekdayChart';

interface MapStatsProps {
  dateRange?: DateRange;
  selectedCategory?: string;
  selectedAreas?: string[];
}

// 날짜 포매팅 함수
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}.${month}.${day}`;
};

// 날짜 범위 포매팅 함수
const formatDateRange = (from: Date, to: Date): string => {
  return `${formatDate(from)} - ${formatDate(to)}`;
};

const mapCategoryToTrashType = (category: string): string => {
  const categoryMap: Record<string, string> = {
    all: '전체통계',
    food: '음식물',
    recycle: '재활용',
    general: '생활',
    others: '기타',
  };
  return categoryMap[category] || '전체통계';
};

const MapStats: React.FC<MapStatsProps> = ({
  dateRange: externalDateRange,
  selectedCategory,
  selectedAreas: externalAreas = [],
}) => {
  const mappedTrashType = useMemo(() => {
    // 선택해제
    if (selectedCategory === undefined) {
      return '전체통계';
    }
    return mapCategoryToTrashType(selectedCategory || 'all');
  }, [selectedCategory]);
  const {
    dateRange,
    selectedAreas,
    selectedTrashType: hookSelectedTrashType,
    // selectedTimeline,
    selectedWeekday,
    transformedData,
    regionData,
    timePeriodByDayData,
    isLoading,
    regionLoading,
    timePeriodByDayLoading,
    error,
    regionError,
    timePeriodByDayError,
    handleAreaSelectionChange,
    handleTrashTypeChange,
    // setSelectedTimeline,
  } = useComplaintFilters(externalDateRange);

  // Sync external areas with hook's areas
  useEffect(() => {
    if (externalAreas.length > 0) {
      handleAreaSelectionChange(externalAreas);
    }
  }, [externalAreas, handleAreaSelectionChange]);

  // Sync mapped trash type with hook's trash type
  useEffect(() => {
    if (mappedTrashType !== hookSelectedTrashType) {
      handleTrashTypeChange(mappedTrashType);
    }
  }, [mappedTrashType, hookSelectedTrashType, handleTrashTypeChange]);

  // Use hook's selectedTrashType for consistency
  const selectedTrashType = hookSelectedTrashType;

  const {
    chartData,
    regionPosNegData,
    // regionDaysData,
    regionTimePeriodsData,
    weekdayTimeSlotData,
    trashTypeWeekdayData,
    timeStats,
    // weekdayStats,
    // complaintTypeColors,
    // dongComplaintColors,
    getTrashTypeColor,
    getTrashColor,
    getRegionColor,
    getComplaintColor,
    mapComplaintLabel,
    showFirstPieChart,
    ColorMappings,
  } = useComplaintCharts({
    transformedData,
    regionData,
    selectedAreas,
    selectedTrashType,
    timePeriodByDayData,
    selectedWeekday,
  });

  const hasUserInteracted =
    selectedTrashType !== '성상별' ||
    selectedAreas.length > 0 ||
    selectedWeekday !== '전체 요일' ||
    dateRange !== undefined;

  // Fetch initial pies from server (categories and regions)
  const { categoryPie, regionPie, daysBar, posNegPie, rawCategories } =
    useInitialStats({
      dateRange,
      selectedAreas,
    });

  const displayDaysData = useMemo(() => {
    if (
      trashTypeWeekdayData.length > 0 &&
      selectedTrashType !== '성상별' &&
      selectedTrashType !== '전체통계'
    ) {
      return trashTypeWeekdayData;
    }
    return daysBar;
  }, [trashTypeWeekdayData, daysBar, selectedTrashType]);

  const posNegData = selectedAreas.length > 0 ? regionPosNegData : posNegPie;
  const posNegColors = posNegData.map((item) => getComplaintColor(item.name));

  return (
    <div className="overflow-y-auto h-full pt-2 scrollbar-hide">
      {showFirstPieChart && selectedWeekday === '전체 요일' && (
        <section className="relative mb-6">
          <p className="font-semibold text-lg text-[#8d8d8d]">
            최근{' '}
            {dateRange?.from instanceof Date && dateRange?.to instanceof Date
              ? formatDateRange(dateRange.from, dateRange.to)
              : formatDate(new Date())}
            의 민원 통계
          </p>
          <h1 className="font-bold text-xl mt-1">
            {`총 ${categoryPie.reduce((sum, item) => sum + Number(item.value || 0), 0)}건`}
          </h1>
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1.5 text-center">
                {categoryPie.map((item) => (
                  <span
                    key={item.name}
                    className="px-2 py-0.5 text-sm font-semibold text-white"
                    style={{ backgroundColor: getTrashColor(item.name) }}
                  >
                    {item.name}
                  </span>
                ))}
              </div>
              <div className="flex-1">
                <SimplePieChart
                  data={categoryPie}
                  colors={categoryPie.map((item) => getTrashColor(item.name))}
                />
              </div>
            </div>
            {/* <div className="flex flex-col gap-1.5">
              {categoryPie.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-2 pt-1 pb-1.5 border-b border-[#dcdcdc]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getTrashColor(item.name) }}
                    />
                    <span className="text-base font-semibold">{item.name}</span>
                  </div>
                  <p className="text-base font-semibold">{item.value}건</p>
                </div>
              ))}
            </div> */}
            <div className="flex flex-col gap-1.5 w-full">
              <Accordion type="multiple" className="w-full">
                {categoryPie.map((item) => {
                  const categoryData = rawCategories?.[item.name];
                  const trucks = categoryData?.trucks || [];
                  const hasTrucks = trucks.length > 0;
                  console.log(item.name, 'hasTrucks:', hasTrucks);

                  if (!hasTrucks) {
                    return (
                      <div className="flex items-center justify-between gap-2 pt-2 pb-3 border-b border-[#dcdcdc]">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor: getTrashColor(item.name),
                            }}
                          />
                          <span className="text-md font-semibold">
                            {item.name}
                          </span>
                        </div>
                        <p className="text-md font-semibold">{item.value}건</p>
                      </div>
                    );
                  }

                  return (
                    <AccordionItem
                      key={item.name}
                      value={item.name}
                      className="pt-2 pb-3 border-b border-[#dcdcdc]"
                    >
                      <AccordionTrigger className="">
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor: getTrashColor(item.name),
                            }}
                          />
                          <span className="text-md font-semibold">
                            {item.name}
                          </span>
                        </div>
                        <p className="text-md font-semibold">{item.value}건</p>
                      </AccordionTrigger>
                      <AccordionContent>
                        {trucks.length > 0 ? (
                          <div className="pl-10 flex flex-col gap-2 pt-3 pb-2 text-md font-semibold">
                            {trucks.map((truck, index) => (
                              <>
                                <div key={truck.truck_no || index}>
                                  <div className="flex items-center justify-between ">
                                    <p>{truck.truck_no}</p>
                                    <p>{truck.count}건</p>
                                  </div>
                                </div>
                                {truck.drivers && truck.drivers.length > 0 && (
                                  <div className="flex items-center justify-between pl-10">
                                    <p className="">기사:</p>
                                    <p>{truck.drivers.join(', ')}</p>
                                  </div>
                                )}
                              </>
                            ))}
                          </div>
                        ) : (
                          <></>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </div>
        </section>
      )}

      {/* Region Pie Chart Section - Mobile Optimized */}
      {selectedWeekday === '전체 요일' && (
        <section className="mb-6">
          <p className="text-lg font-semibold text-[#8d8d8d]">
            최근{' '}
            {dateRange?.from instanceof Date && dateRange?.to instanceof Date
              ? formatDateRange(dateRange.from, dateRange.to)
              : formatDate(new Date())}
            의 민원 통계
          </p>
          <h1 className="font-bold text-xl mt-1">
            {`총 ${regionPie.reduce((sum, item) => sum + Number(item.value || 0), 0)}건`}
          </h1>
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1.5">
                {regionPie.map((item) => (
                  <span
                    key={item.name}
                    className="px-2 py-0.5 text-sm font-semibold text-white"
                    style={{ backgroundColor: getRegionColor(item.name) }}
                  >
                    {item.name}
                  </span>
                ))}
              </div>
              <div className="flex-1">
                <SimplePieChart
                  data={regionPie}
                  colors={regionPie.map((item) => getRegionColor(item.name))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {regionPie.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-2 pt-1 pb-1.5 border-b border-[#dcdcdc]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getRegionColor(item.name) }}
                    />
                    <span className="text-base font-semibold">{item.name}</span>
                  </div>
                  <p className="text-base font-semibold">{item.value}건</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pos/Neg Pie Chart Section - Mobile Optimized */}
      {selectedWeekday === '전체 요일' && (
        <section className="mb-6">
          <p className="font-semibold text-lg text-[#8d8d8d]">
            최근{' '}
            {dateRange?.from instanceof Date && dateRange?.to instanceof Date
              ? formatDateRange(dateRange.from, dateRange.to)
              : formatDate(new Date())}
            의 민원 통계
          </p>
          <h1 className="font-bold text-xl mt-1">
            {`총 ${posNegData.reduce((sum, item) => sum + Number(item.value || 0), 0)}건`}
          </h1>
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1.5">
                {posNegData.map((item) => (
                  <span
                    key={item.name}
                    className="px-2 py-0.5 text-sm font-semibold text-white"
                    style={{ backgroundColor: getComplaintColor(item.name) }}
                  >
                    {mapComplaintLabel(item.name)}
                  </span>
                ))}
              </div>
              <div className="flex-1">
                <SimplePieChart data={posNegData} colors={posNegColors} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {posNegData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-2 pt-1 pb-1.5 border-b border-[#dcdcdc]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: getComplaintColor(item.name),
                      }}
                    />
                    <span className="text-base font-semibold">
                      {mapComplaintLabel(item.name)}
                    </span>
                  </div>
                  <p className="text-base font-semibold">{item.value}건</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Time Slot Chart Section - Mobile Optimized */}
      {selectedWeekday === '전체 요일' && hasUserInteracted && (
        <section className="mb-6">
          <p className="font-semibold text-lg text-[#8d8d8d]">
            최근{' '}
            {dateRange?.from instanceof Date && dateRange?.to instanceof Date
              ? formatDateRange(dateRange.from, dateRange.to)
              : formatDate(new Date())}
            의 민원 통계
          </p>
          <h1 className="font-bold text-xl mt-1">
            {`총 ${(() => {
              const data =
                selectedAreas.length > 0
                  ? regionTimePeriodsData
                  : chartData.timeSlotData;
              if (!data || data.length === 0) return 0;
              return data.reduce((sum, item) => {
                if (!item) return sum;
                const totalTimeComplaints = Object.keys(item)
                  .filter((key) => key !== 'time' && key !== 'hour')
                  .reduce((sum, key) => {
                    const value = Number(item[key]);
                    return sum + (isNaN(value) ? 0 : value);
                  }, 0);
                return sum + totalTimeComplaints;
              }, 0);
            })()}건`}
          </h1>
          <div className="mt-3 flex flex-col gap-3">
            <div>
              <SimpleTimeSlotChart
                data={
                  selectedAreas.length > 0
                    ? regionTimePeriodsData
                    : chartData.timeSlotData
                }
                colors={
                  selectedTrashType &&
                  selectedTrashType !== '전체통계' &&
                  selectedTrashType !== '성상별'
                    ? [getTrashColor(selectedTrashType)]
                    : Object.values(ColorMappings.trash)
                }
                mobile={true}
              />
            </div>
            <div className="flex flex-col gap-2 -mt-5">
              <div>
                <p className="text-[#585858] font-semibold text-base">
                  가장 많은 민원이 들어온 시간대
                </p>
                <p className="text-black font-semibold text-lg">
                  {timeStats.maxTime
                    ? `${timeStats.maxTime} (${timeStats.maxComplaints}건)`
                    : 'N/A (0건)'}
                </p>
              </div>
              <div>
                <p className="text-[#585858] font-semibold text-base">
                  가장 적은 민원이 들어온 시간대
                </p>
                <p className="text-black font-semibold text-lg">
                  {timeStats.minTime
                    ? `${timeStats.minTime} (${timeStats.minComplaints}건)`
                    : 'N/A (0건)'}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {selectedWeekday === '전체 요일' && (
        <section className="mb-6">
          <p className="font-semibold text-lg text-[#8d8d8d]">
            최근{' '}
            {dateRange?.from instanceof Date && dateRange?.to instanceof Date
              ? formatDateRange(dateRange.from, dateRange.to)
              : formatDate(new Date())}
            의 민원 통계
          </p>
          <h1 className="font-bold text-xl mt-1">
            {`총 ${displayDaysData.reduce((sum, item) => sum + Number(item.count || 0), 0)}건`}
          </h1>
          <div className="mt-3 flex flex-col gap-3 mb-40">
            <div>
              <SimpleWeekdayChart
                data={displayDaysData}
                colors={
                  selectedTrashType !== '성상별' &&
                  selectedTrashType !== '전체통계'
                    ? [getTrashTypeColor(selectedTrashType)]
                    : ['#59B9FF']
                }
                mobile={true}
              />
            </div>
            <div className="flex flex-col gap-2 mt-5">
              <div>
                <p className="text-[#585858] font-semibold text-base">
                  가장 많은 민원이 들어온 요일
                </p>
                <p className="text-black font-semibold text-lg">
                  {displayDaysData.length > 0
                    ? (() => {
                        const maxItem = displayDaysData.reduce((max, item) =>
                          Number(item.count || 0) > Number(max.count || 0)
                            ? item
                            : max
                        );
                        return `${maxItem.time} (${maxItem.count}건)`;
                      })()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[#585858] font-semibold text-base">
                  가장 적은 민원이 들어온 요일
                </p>
                <p className="text-black font-semibold text-lg">
                  {displayDaysData.length > 0
                    ? (() => {
                        const minItem = displayDaysData.reduce((min, item) =>
                          Number(item.count || 0) < Number(min.count || 0)
                            ? item
                            : min
                        );
                        return `${minItem.time} (${minItem.count}건)`;
                      })()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {selectedWeekday !== '전체 요일' &&
        weekdayTimeSlotData.length > 0 &&
        hasUserInteracted && (
          <section className="mb-6">
            <p className="font-semibold text-base text-[#8d8d8d]">
              {selectedWeekday} 시간대별 민원 통계
            </p>
            <h1 className="font-bold text-lg mt-1">
              {selectedWeekday} 민원 분포
            </h1>
            <div className="my-3 flex flex-col gap-3">
              <div>
                <SimpleTimeSlotChart
                  data={weekdayTimeSlotData}
                  colors={
                    selectedTrashType &&
                    selectedTrashType !== '전체통계' &&
                    selectedTrashType !== '성상별'
                      ? [getTrashTypeColor(selectedTrashType)]
                      : ['#59B9FF']
                  }
                  mobile={true}
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[#585858] font-semibold text-base">
                  {selectedWeekday} 시간대별 민원 현황
                </p>
                <p className="text-black font-semibold text-lg">
                  총{' '}
                  {weekdayTimeSlotData.reduce(
                    (sum: number, item: BarChartItem) =>
                      sum + Number(item.count),
                    0
                  )}
                  건
                </p>
              </div>
            </div>
          </section>
        )}

      {/* Loading State */}
      {(isLoading || regionLoading || timePeriodByDayLoading) && (
        <div className="flex justify-center items-center p-4">
          <div className="text-base text-gray-600">통계를 불러오는 중...</div>
        </div>
      )}

      {/* Error State */}
      {(error || regionError || timePeriodByDayError) && (
        <div className="flex justify-center items-center p-4">
          <div className="text-base text-red-600">
            오류: {error || regionError || timePeriodByDayError}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapStats;
