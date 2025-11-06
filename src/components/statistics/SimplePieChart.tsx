import React, { memo, useMemo } from 'react';

import type { PieChartProps } from '../../types/stats';

interface SimplePieChartProps extends PieChartProps {
  className?: string;
}

const SimplePieChartComponent: React.FC<SimplePieChartProps> = ({
  data,
  colors,
  className = '',
}) => {
  // 파이 차트 계산
  const pieData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
      return [];
    }

    // Filter out zero-value items to avoid invalid SVG paths
    const nonZeroData = data.filter((item) => item.value > 0);

    if (nonZeroData.length === 0) {
      return [];
    }

    // Recalculate total with only non-zero values
    const nonZeroTotal = nonZeroData.reduce((sum, item) => sum + item.value, 0);

    if (nonZeroTotal === 0) {
      return [];
    }

    let currentAngle = 0;

    // Handle single data point case - create a full circle
    if (nonZeroData.length === 1) {
      const item = nonZeroData[0];
      const originalIndex = data.findIndex((d) => d.name === item.name);
      const colorIndex = originalIndex % (colors?.length || 1);
      const color =
        colors && colors.length > 0 ? colors[colorIndex] : '#59B9FF';
      return [
        {
          ...item,
          percentage: 100,
          angle: 360,
          startAngle: 0,
          endAngle: 360,
          color,
          pathData: createFullCirclePath(110, 60),
        },
      ];
    }

    const result = nonZeroData.map((item) => {
      const percentage = (item.value / nonZeroTotal) * 100;
      const angle = (item.value / nonZeroTotal) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      currentAngle += angle;

      // Find original index in data array for correct color mapping
      const originalIndex = data.findIndex((d) => d.name === item.name);
      const colorIndex = originalIndex % (colors?.length || 1);
      const color =
        colors && colors.length > 0 ? colors[colorIndex] : '#59B9FF';

      return {
        ...item,
        percentage,
        angle,
        startAngle,
        endAngle,
        color,
        pathData: createPieSlicePath(startAngle, endAngle, 110, 60),
      };
    });

    return result;
  }, [data, colors]);

  // 데이터 유효성 검사
  if (!data || data.length === 0) {
    return (
      <div
        className={`w-full h-80 flex items-center justify-center ${className}`}
      >
        <div className="text-gray-500">표시할 데이터가 없습니다.</div>
      </div>
    );
  }

  // 데이터가 있지만 모든 값이 0인 경우
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return (
      <div
        className={`w-full h-80 flex items-center justify-center ${className}`}
      >
        <div className="text-gray-500">데이터 값이 모두 0입니다.</div>
      </div>
    );
  }

  // Safety check: If pieData is empty but data has values, show error
  if (pieData.length === 0 && total > 0) {
    return (
      <div
        className={`w-full h-80 flex items-center justify-center ${className}`}
      >
        <div className="text-red-500">차트 렌더링 오류 (데이터 확인 필요)</div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative w-64 h-64">
        {/* SVG 파이 차트 */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 220 220"
          className="transform -rotate-90"
        >
          {pieData.map((slice, index) => (
            <g key={index}>
              <path
                d={slice.pathData}
                fill={slice.color}
                stroke="white"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity duration-200"
              />
            </g>
          ))}
        </svg>

        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{total}건</div>
            <div className="text-sm text-gray-600">총 민원</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 파이 슬라이스 경로 생성 함수
function createPieSlicePath(
  startAngle: number,
  endAngle: number,
  outerRadius: number,
  innerRadius: number
): string {
  const centerX = 110;
  const centerY = 110;

  const startAngleRad = (startAngle * Math.PI) / 180;
  const endAngleRad = (endAngle * Math.PI) / 180;

  const x1 = centerX + outerRadius * Math.cos(startAngleRad);
  const y1 = centerY + outerRadius * Math.sin(startAngleRad);
  const x2 = centerX + outerRadius * Math.cos(endAngleRad);
  const y2 = centerY + outerRadius * Math.sin(endAngleRad);

  const x3 = centerX + innerRadius * Math.cos(endAngleRad);
  const y3 = centerY + innerRadius * Math.sin(endAngleRad);
  const x4 = centerX + innerRadius * Math.cos(startAngleRad);
  const y4 = centerY + innerRadius * Math.sin(startAngleRad);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${x1} ${y1}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
    'Z',
  ].join(' ');
}

// 전체 원 경로 생성 함수 (단일 데이터 포인트용)
function createFullCirclePath(
  outerRadius: number,
  innerRadius: number
): string {
  const centerX = 110;
  const centerY = 110;

  // Create outer circle (clockwise)
  const outerCircle = [
    `M ${centerX + outerRadius} ${centerY}`,
    `A ${outerRadius} ${outerRadius} 0 1 1 ${centerX - outerRadius} ${centerY}`,
    `A ${outerRadius} ${outerRadius} 0 1 1 ${centerX + outerRadius} ${centerY}`,
  ].join(' ');

  // Create inner circle (counter-clockwise to create hole)
  const innerCircle = [
    `M ${centerX + innerRadius} ${centerY}`,
    `A ${innerRadius} ${innerRadius} 0 1 0 ${centerX - innerRadius} ${centerY}`,
    `A ${innerRadius} ${innerRadius} 0 1 0 ${centerX + innerRadius} ${centerY}`,
  ].join(' ');

  return `${outerCircle} ${innerCircle} Z`;
}

// Memoized component with custom comparison to ensure updates when data changes
export const SimplePieChart = memo(
  SimplePieChartComponent,
  (prevProps, nextProps) => {
    // Handle empty arrays
    if (prevProps.data.length === 0 && nextProps.data.length === 0) {
      // Both empty, compare colors and className
      if (prevProps.colors.length !== nextProps.colors.length) {
        return false;
      }
      return prevProps.className === nextProps.className;
    }

    // If data length changed, need to re-render
    if (prevProps.data.length !== nextProps.data.length) {
      return false; // Re-render
    }

    // If colors length changed, need to re-render
    if (prevProps.colors.length !== nextProps.colors.length) {
      return false; // Re-render
    }

    // Compare data array contents (name and value)
    const dataEqual = prevProps.data.every((item, i) => {
      const nextItem = nextProps.data[i];
      if (!nextItem) return false;
      return item.name === nextItem.name && item.value === nextItem.value;
    });

    if (!dataEqual) {
      return false; // Re-render if data changed
    }

    // Compare colors array
    const colorsEqual = prevProps.colors.every(
      (color, i) => color === nextProps.colors[i]
    );

    if (!colorsEqual) {
      return false; // Re-render if colors changed
    }

    // Compare className
    if (prevProps.className !== nextProps.className) {
      return false; // Re-render
    }

    // All props are equal, skip re-render
    return true;
  }
);

export default SimplePieChart;
