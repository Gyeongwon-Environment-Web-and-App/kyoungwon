import React, { memo, useMemo, useState } from 'react';

import type { BarChartProps } from '@/types/stats';

interface SimpleTimeSlotChartProps extends BarChartProps {
  className?: string;
  mobile?: boolean;
}

const SimpleTimeSlotChartComponent: React.FC<SimpleTimeSlotChartProps> = ({
  data,
  colors,
  className = '',
  mobile = false,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);

  const ticks = useMemo(
    () => [
      '8:30',
      '9:30',
      '10:30',
      '11:30',
      '12:30',
      '13:30',
      '14:30',
      '15:30',
      '16:30',
      '17:30',
    ],
    []
  );

  // Function to calculate time range (e.g., "8:30" -> "8:30-9:30")
  const getTimeRange = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const nextHour = hours + 1;
    return `${time}-${nextHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // 차트 데이터 계산
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        categories: [],
        maxValue: 0,
        bars: [],
      };
    }

    const categories = Object.keys(data[0] || {}).filter(
      (key) => key !== 'time' && key !== 'hour'
    );

    if (categories.length === 0) {
      return {
        categories: [],
        maxValue: 0,
        bars: [],
      };
    }

    // Calculate exact position for each bar based on time
    const getBarPosition = (time: string) => {
      const tickIndex = ticks.indexOf(time);
      return tickIndex >= 0 ? tickIndex : -1;
    };

    // Filter out data with invalid time positions and calculate max value
    const validData = data.filter((item) => {
      const time = String(item.hour || item.time);
      return getBarPosition(time) >= 0;
    });

    const maxValue = Math.max(
      ...validData.map((item) =>
        categories.reduce(
          (sum, category) => sum + Number(item[category] || 0),
          0
        )
      )
    );

    return {
      categories,
      maxValue,
      bars: validData.map((item) => {
        const time = String(item.hour || item.time);
        const tickIndex = getBarPosition(time);
        return {
          ...item,
          tickIndex,
          totalValue: categories.reduce(
            (sum, category) => sum + Number(item[category] || 0),
            0
          ),
          segments: categories.map((category, catIndex) => ({
            category,
            value: Number(item[category] || 0),
            color: colors[catIndex % colors.length],
            percentage:
              maxValue > 0 ? (Number(item[category] || 0) / maxValue) * 100 : 0,
          })),
        };
      }),
    };
  }, [data, colors, ticks]);

  // 데이터 유효성 검사
  if (!data || data.length === 0) {
    return (
      <div
        className={`h-96 ${mobile ? '' : 'w-[600px]'} flex items-center justify-center ${className}`}
      >
        <div className="text-gray-500">표시할 데이터가 없습니다.</div>
      </div>
    );
  }

  // 현재 호버된 데이터
  const currentData = chartData.bars[hoveredIndex] || chartData.bars[0];

  return (
    <div
      className={`flex justify-center ${mobile ? 'flex-col scale-90 h-80' : 'flex-row w-[670px] h-96'} ${className}`}
    >
      <div
        className={`flex-1 flex items-center ${mobile ? '' : 'md:w-[400px] md:ml-5'}`}
      >
        <div className="w-full h-56 flex flex-col justify-end">
          {/* Y축 라벨 */}
          <div className="relative w-full h-full pb-8">
            {chartData.bars.map((bar, index) => (
              <div
                key={index}
                className="absolute flex flex-col items-center cursor-pointer group"
                style={{
                  left: `${(bar.tickIndex / (ticks.length - 1)) * 100}%`,
                  transform: 'translateX(-50%)',
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(0)}
              >
                {/* 바 차트 */}
                <div
                  className={`${mobile ? 'w-6' : 'w-8'} h-48 flex flex-col justify-end mb-2`}
                >
                  <div className="w-full h-full flex flex-col justify-end">
                    {bar.segments.map((segment, segIndex) => (
                      <div
                        key={segIndex}
                        className="w-full transition-all duration-200 ml-5"
                        style={{
                          height: `${segment.percentage}%`,
                          backgroundColor: segment.color,
                          minHeight: segment.value > 0 ? '2px' : '0px',
                        }}
                        title={`${segment.category}: ${segment.value}건`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* X축 틱 - 바 사이에 위치 */}
          <div className="relative w-full -mt-8">
            {ticks.map((tick, idx) => (
              <div
                key={idx}
                className={`${mobile ? 'text-[10px]' : 'text-xs'} text-gray-600 text-center absolute`}
                style={{
                  left: `${(idx / (ticks.length - 1)) * 100}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                {tick}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 툴팁 */}
      {currentData && (
        <div
          className={`flex items-center ${mobile ? 'justify-center' : 'justify-start'} px-4 pt-10 md:pt-0 print-color`}
        >
          <div className="bg-white border border-[#757575] rounded-lg p-4 w-48 text-center">
            <div className="font-semibold text-lg text-gray-600 mb-2">
              {currentData?.time ? getTimeRange(String(currentData.time)) : ''}
            </div>
            <div className="space-y-1">
              {currentData?.segments.map((segment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span>{segment.category}</span>
                  </div>
                  <span className="font-semibold">{segment.value}건</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoized component to prevent infinite loops
export const SimpleTimeSlotChart = memo(SimpleTimeSlotChartComponent);

export default SimpleTimeSlotChart;
