import { useMemo } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AreaDropdown } from '@/components/ui/AreaDropdown';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useComplaintCharts } from '@/hooks/useComplaintCharts';
import { useComplaintFilters } from '@/hooks/useComplaintFilters';
import { useInitialStats } from '@/hooks/useInitialStats';
import { Download, Printer } from '@/lib/icons';
import type { BarChartItem } from '@/types/stats';

import triangle from '../../assets/icons/actions/triangle.svg';
import DateRangePicker from '../common/DateRangePicker';
import { SimplePieChart } from './SimplePieChart';
import { SimpleTimeSlotChart } from './SimpleTimeSlotChart';
import { SimpleWeekdayChart } from './SimpleWeekdayChart';

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

const ComplaintStats = () => {
  const {
    dateRange,
    setDateRange,
    selectedAreas,
    selectedTrashType,
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
    getSelectedAreaDisplay,
    // setSelectedTimeline,
    setSelectedWeekday,
  } = useComplaintFilters();

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
    selectedTrashType !== '쓰레기 종류' ||
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
      selectedTrashType !== '쓰레기 종류' &&
      selectedTrashType !== '전체통계'
    ) {
      return trashTypeWeekdayData;
    }
    return daysBar;
  }, [trashTypeWeekdayData, daysBar, selectedTrashType]);

  return (
    <div className="w-[100%] h-screen">
      <div className="pb-28 md:pb-20 overflow-hidden">
        <header className="flex flex-wrap-reverse md:flex-nowrap justify-between md:items-end border-b border-under pt-0 pb-3 mb-5 mt-3 md:mt-0">
          <div className="flex mt-12 md:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  style={{
                    color: getTrashTypeColor(selectedTrashType),
                  }}
                  className="flex items-center shadow-none !outline-none border-[#575757] focus:border-[#575757] mr-2"
                >
                  <span className="text-sm font-semibold">
                    {selectedTrashType}
                  </span>
                  <img src={triangle} alt="쓰레기 종류 선택" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="[&>*]:justify-center !min-w-[110px]"
              >
                <DropdownMenuItem
                  onClick={() => {
                    handleTrashTypeChange('전체통계');
                  }}
                  className="text-[#333333]"
                >
                  전체통계
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleTrashTypeChange('음식물');
                  }}
                  className="text-[#F5694A]"
                >
                  음식물
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleTrashTypeChange('재활용');
                  }}
                  className="text-[#58CC02]"
                >
                  재활용
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleTrashTypeChange('생활');
                  }}
                  className="text-[#59B9FF]"
                >
                  생활
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleTrashTypeChange('기타');
                  }}
                  className="text-[#AF8AFF]"
                >
                  기타
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center shadow-none outline-none border-[#575757] focus:border-[#575757] mr-2"
                >
                  <span className="text-sm">{selectedTimeline}</span>
                  <img src={triangle} alt="시간대 선택" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="[&>*]:justify-center !min-w-[80px]"
              >
                <DropdownMenuItem
                  onClick={async () => {
                    setSelectedTimeline('전체 시간대');
                  }}
                >
                  전체 시간대
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedTimeline('8:30-9:30')}
                >
                  8:30-9:30
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedTimeline('9:30-10:30')}
                >
                  9:30-10:30
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedTimeline('10:30-11:30')}
                >
                  10:30-11:30
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedTimeline('11:30-12:30')}
                >
                  11:30-12:30
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedTimeline('12:30-13:30')}
                >
                  12:30-13:30
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedTimeline('13:30-14:30')}
                >
                  13:30-14:30
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedTimeline('14:30-15:30')}
                >
                  14:30-15:30
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedTimeline('15:30-16:30')}
                >
                  15:30-16:30
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedTimeline('16:30-17:30')}
                >
                  16:30-17:30
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center shadow-none outline-none border-[#575757] focus:border-[#575757] mr-2"
                >
                  <span className="text-sm">{selectedWeekday}</span>
                  <img src={triangle} alt="요일별 선택" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="[&>*]:justify-center !min-w-[80px]"
              >
                <DropdownMenuItem
                  onClick={() => setSelectedWeekday('전체 요일')}
                >
                  전체 요일
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedWeekday('월요일')}>
                  월요일
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedWeekday('화요일')}>
                  화요일
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedWeekday('수요일')}>
                  수요일
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedWeekday('목요일')}>
                  목요일
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedWeekday('금요일')}>
                  금요일
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center gap-2">
              <AreaDropdown
                selectedAreas={selectedAreas}
                onSelectedAreasChange={handleAreaSelectionChange}
                onSelectionChange={handleAreaSelectionChange}
                buttonText="구역 선택"
                buttonClassName="flex items-center shadow-none outline-none border-[#575757] focus:border-[#575757] mr-2"
                contentClassName="w-28 !p-0"
                childItemClassName="pl-10 bg-f0f0f0 rounded-none"
                triangleIcon={triangle}
              />
            </div>
          </div>
          <div className="flex absolute md:static top-[9rem] right-5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center shadow-none outline-none border-[#575757] focus:border-[#575757] mr-2 px-[6px] md:px-3"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden md:block text-sm">다운로드</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => {}}>PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>Excel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center shadow-none bg-[#646464] text-white border-none outline-none hover:bg-under hover:text-white text-sm px-2 md:px-3"
            >
              <Printer className="w-4 h-4" />
              <span className="text-sm hidden md:block">인쇄</span>
            </Button>
          </div>
        </header>
        <div className="mb-4 rounded-lg flex justify-between">
          <div>
            <p className="text-base text-gray-600 mb-1">
              현재 조회 중인 지역은
            </p>
            <h3 className="text-xl font-semibold text-gray-800">
              도봉구 {getSelectedAreaDisplay(selectedAreas)}
            </h3>
          </div>
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            containerClassName="border border-[#575757] rounded-3xl px-4 py-0"
          />
        </div>
        {showFirstPieChart && selectedWeekday === '전체 요일' && (
          <section className="relative">
            <p className="font-semibold text-8d8d8d">
              최근{' '}
              {dateRange?.from instanceof Date && dateRange?.to instanceof Date
                ? formatDateRange(dateRange.from, dateRange.to)
                : formatDate(new Date())}
              의 민원 통계
            </p>
            <h1 className="font-bold text-xl md:text-3xl mt-1">{`총 ${categoryPie.reduce((sum, item) => sum + Number(item.value || 0), 0)}건`}</h1>
            <div className="flex flex-wrap md:flex-nowrap items-center gap-4 mt-2 w-full">
              <div className="md:w-[60%] w-[100%] flex">
                <div className="text-center w-20 px-0 flex flex-col gap-2 mr-2 mt-2 md:mr-10 md:mt-4">
                  {categoryPie.map((item) => (
                    <span
                      key={item.name}
                      className="px-3 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: getTrashColor(item.name) }}
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
                <SimplePieChart
                  data={categoryPie}
                  colors={categoryPie.map((item) => getTrashColor(item.name))}
                />
              </div>
              <div className="flex flex-col gap-2 md:w-[40%] w-full">
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
                          <p className="text-md font-semibold">
                            {item.value}건
                          </p>
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
                          <p className="text-md font-semibold">
                            {item.value}건
                          </p>
                        </AccordionTrigger>
                        <AccordionContent>
                          {trucks.length > 0 ? (
                            <div className="pl-10 flex flex-col gap-2 pt-3 pb-2text-md font-semibold">
                              {trucks.map((truck, index) => (
                                <>
                                  <div key={truck.truck_no || index}>
                                    <div className="flex items-center justify-between ">
                                      <p>{truck.truck_no}</p>
                                      <p>{truck.count}건</p>
                                    </div>
                                  </div>
                                  {truck.drivers &&
                                    truck.drivers.length > 0 && (
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
        {selectedWeekday === '전체 요일' && (
          <section className="mt-10">
            <p className="text-base font-semibold text-8d8d8d">
              최근{' '}
              {dateRange?.from instanceof Date && dateRange?.to instanceof Date
                ? formatDateRange(dateRange.from, dateRange.to)
                : formatDate(new Date())}
              의 민원 통계
            </p>
            <h1 className="font-bold text-xl md:text-3xl mt-1">{`총 ${regionPie.reduce((sum, item) => sum + Number(item.value || 0), 0)}건`}</h1>
            <div className="flex flex-wrap md:flex-no-wrap items-center mt-2 w-full">
              <div className="md:w-[60%] w-[100%] flex">
                <div className="flex flex-col w-20 text-center gap-2 mr-2 mt-2 md:mr-10 md:mt-4">
                  {(selectedAreas.length > 0 ? regionPie : regionPie).map(
                    (item) => (
                      <span
                        key={item.name}
                        className="px-2 md:px-3 py-1 text-xs font-semibold text-white"
                        style={{ backgroundColor: getRegionColor(item.name) }}
                      >
                        {item.name}
                      </span>
                    )
                  )}
                </div>
                <SimplePieChart
                  data={regionPie}
                  colors={regionPie.map((item) => getRegionColor(item.name))}
                />
              </div>
              <div className="flex flex-col gap-2 md:w-[40%] w-[100%]">
                {(selectedAreas.length > 0 ? regionPie : regionPie).map(
                  (item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-2 pt-1 pb-2 border-b border-[#dcdcdc]"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: getRegionColor(item.name) }}
                        />
                        <span className="text-md font-semibold">
                          {item.name}
                        </span>
                      </div>
                      <p className="text-md font-semibold">{item.value}건</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>
        )}
        {selectedWeekday === '전체 요일' && (
          <section className="mt-10">
            <p className="font-semibold text-8d8d8d">
              최근{' '}
              {dateRange?.from instanceof Date && dateRange?.to instanceof Date
                ? formatDateRange(dateRange.from, dateRange.to)
                : formatDate(new Date())}
              의 민원 통계
            </p>
            {(() => {
              // Determine the correct data source
              let posNegData;
              if (selectedAreas.length > 0) {
                posNegData = regionPosNegData;
              } else if (
                selectedTrashType &&
                selectedTrashType !== '전체통계' &&
                selectedTrashType !== '쓰레기 종류' &&
                chartData.complaintData.length > 0
              ) {
                // Use category-specific data when a specific trash type is selected
                posNegData = chartData.complaintData;
              } else {
                // Use overall stats (전체통계)
                posNegData = posNegPie;
              }

              // Compute colors based on the selected data source
              const posNegColors = posNegData.map((item) =>
                getComplaintColor(item.name)
              );

              return (
                <>
                  <h1 className="font-bold text-xl md:text-3xl mt-1">{`총 ${posNegData.reduce((sum, item) => sum + Number(item.value || 0), 0)}건`}</h1>
                  <div className="flex flex-wrap md:flex-nowrap items-center gap-4 mt-2 w-full">
                    <div className="md:w-[60%] w-[100%] flex">
                      <div className="inline-flex flex-col gap-2 w-20  md:mr-10 text-center mt-4">
                        {posNegData.map((item) => (
                          <span
                            key={item.name}
                            className="px-2 md:px-3 py-1 text-xs font-semibold text-white"
                            style={{
                              backgroundColor: getComplaintColor(item.name),
                            }}
                          >
                            {mapComplaintLabel(item.name)}
                          </span>
                        ))}
                      </div>
                      <SimplePieChart data={posNegData} colors={posNegColors} />
                    </div>
                    <div className="flex flex-col gap-2 md:w-[40%] w-[100%]">
                      {posNegData.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between gap-2 pt-1 pb-2 border-b border-[#dcdcdc]"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor: getComplaintColor(item.name),
                              }}
                            />
                            <span className="text-md font-semibold">
                              {mapComplaintLabel(item.name)}
                            </span>
                          </div>
                          <p className="text-md font-semibold">
                            {item.value}건
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </section>
        )}
        {selectedWeekday === '전체 요일' && hasUserInteracted && (
          <section className="mt-10">
            <p className="font-semibold text-8d8d8d">
              최근{' '}
              {dateRange?.from instanceof Date && dateRange?.to instanceof Date
                ? formatDateRange(dateRange.from, dateRange.to)
                : formatDate(new Date())}
              의 민원 통계
            </p>
            <h1 className="font-bold text-xl md:text-3xl mt-1">{`총 ${(selectedAreas.length >
            0
              ? regionTimePeriodsData
              : chartData.timeSlotData
            ).reduce((sum, item) => {
              const totalTimeComplaints = Object.keys(item)
                .filter((key) => key !== 'time')
                .reduce((sum, key) => sum + Number(item[key]), 0);
              return sum + totalTimeComplaints;
            }, 0)}건`}</h1>
            <div className="mt-5 flex flex-wrap md:flex-nowrap items-center md:justify-between justify-center">
              <div className="mb-10 md:mb-5">
                <SimpleTimeSlotChart
                  data={
                    selectedAreas.length > 0
                      ? regionTimePeriodsData
                      : chartData.timeSlotData
                  }
                  colors={
                    selectedTrashType &&
                    selectedTrashType !== '전체통계' &&
                    selectedTrashType !== '쓰레기 종류'
                      ? [getTrashColor(selectedTrashType)]
                      : Object.values(ColorMappings.trash)
                  }
                />
              </div>
              <div className="flex flex-col items-center md:gap-y-3 w-[95%] ">
                <div className="flex justify-between md:inline">
                  <p className="text-[#585858] font-semibold text-sm md:text-xl mr-4 md:mr-0">
                    가장 많은 민원이 들어온 시간대
                  </p>
                  <p className="text-black font-semibold text-sm md:text-3xl md:mb-10 mb-3">
                    {timeStats.maxTime} ({timeStats.maxComplaints}건)
                  </p>
                </div>
                <div className="flex justify-between md:inline">
                  <p className="text-[#585858] font-semibold text-sm md:text-xl mr-4 md:mr-0">
                    가장 적은 민원이 들어온 시간대
                  </p>
                  <p className="text-black font-semibold text-sm md:text-3xl">
                    {timeStats.minTime} ({timeStats.minComplaints}건)
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
        {selectedWeekday === '전체 요일' && (
          <section className="mt-7 md:mt-10">
            <p className="font-semibold text-8d8d8d">
              최근{' '}
              {dateRange?.from instanceof Date && dateRange?.to instanceof Date
                ? formatDateRange(dateRange.from, dateRange.to)
                : formatDate(new Date())}
              의 민원 통계
            </p>
            <h1 className="font-bold text-xl md:text-3xl mt-1">{`총 ${displayDaysData.reduce((sum, item) => sum + Number(item.count || 0), 0)}건`}</h1>
            <div className="w-full md:-mt-20 flex flex-wrap md:flex-nowrap items-center md:justify-between justify-center">
              <div className="md:mb-0 mb-5">
                <SimpleWeekdayChart
                  data={displayDaysData}
                  colors={
                    selectedTrashType !== '쓰레기 종류' &&
                    selectedTrashType !== '전체통계'
                      ? [getTrashTypeColor(selectedTrashType)]
                      : ['#59B9FF']
                  }
                />
              </div>
              <div className="flex flex-col items-center md:gap-y-3 w-[95%] md:ml-5 mt-10 md:mt-0">
                <div className="flex justify-between md:inline">
                  <p className="text-[#585858] font-semibold text-sm md:text-xl mr-4 md:mr-0">
                    가장 많은 민원이 들어온 요일
                  </p>
                  <p className="text-black font-semibold text-sm md:text-3xl mb-3">
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
                <div className="flex justify-between md:inline">
                  <p className="text-[#585858] font-semibold text-sm md:text-xl mr-4 md:mr-0">
                    가장 적은 민원이 들어온 요일
                  </p>
                  <p className="text-black font-semibold text-sm md:text-3xl">
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
            <section className="mt-10">
              <p className="font-semibold text-8d8d8d">
                {selectedWeekday} 시간대별 민원 통계
              </p>
              <h1 className="font-bold text-xl md:text-3xl mt-1">
                {selectedWeekday} 민원 분포
              </h1>
              <div className="mt-5 flex flex-wrap md:flex-nowrap items-center md:justify-between justify-center">
                <div className="mb-10 md:mb-5">
                  <SimpleTimeSlotChart
                    data={weekdayTimeSlotData}
                    colors={
                      selectedTrashType &&
                      selectedTrashType !== '전체통계' &&
                      selectedTrashType !== '쓰레기 종류'
                        ? [getTrashTypeColor(selectedTrashType)]
                        : ['#59B9FF'] // Default blue color
                    }
                  />
                </div>
                <div className="flex flex-col items-center md:gap-y-3 w-[95%]">
                  <div className="flex justify-between md:inline">
                    <p className="text-[#585858] font-semibold text-sm md:text-xl mr-4 md:mr-0">
                      {selectedWeekday} 시간대별 민원 현황
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-black font-semibold text-sm md:text-lg">
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
              </div>
            </section>
          )}

        {(isLoading || regionLoading || timePeriodByDayLoading) && (
          <div className="flex justify-center items-center p-2">
            <div className="text-sm text-gray-600">'통계를 불러오는 중...'</div>
          </div>
        )}

        {(error || regionError || timePeriodByDayError) && (
          <div className="flex justify-center items-center p-4">
            <div className="text-sm text-red-600">
              오류: {error || regionError}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintStats;
