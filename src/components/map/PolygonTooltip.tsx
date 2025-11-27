import React from 'react';

import type { PolygonFeature } from '@/types/map';

interface PolygonTooltipProps {
  feature: PolygonFeature;
  position: { x: number; y: number };
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
}

const PolygonTooltip: React.FC<PolygonTooltipProps> = ({
  feature,
  position,
  mapContainerRef,
}) => {
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = React.useState(position);

  // Adjust position to keep tooltip within viewport
  React.useEffect(() => {
    if (!tooltipRef.current || !mapContainerRef.current) return;

    const tooltip = tooltipRef.current;
    const mapContainer = mapContainerRef.current;
    const rect = mapContainer.getBoundingClientRect();

    // Convert screen coordinates to container-relative coordinates
    // position.x and position.y are screen coordinates (clientX, clientY)
    let x = position.x - rect.left;
    let y = position.y - rect.top;

    // Offset to position tooltip above the cursor
    const offsetX = 10;
    const offsetY = -10;

    // Check boundaries
    if (x + tooltip.offsetWidth + offsetX > rect.width) {
      x = rect.width - tooltip.offsetWidth - offsetX;
    }
    if (x < 0) x = offsetX;

    if (y - tooltip.offsetHeight + offsetY < 0) {
      y = tooltip.offsetHeight + offsetY;
    }
    if (y > rect.height) {
      y = rect.height - tooltip.offsetHeight - offsetY;
    }

    setAdjustedPosition({ x: x + offsetX, y: y + offsetY });
  }, [position, mapContainerRef]);

  const truckNo = feature.properties.truck.truck_no;
  const teamName = feature.properties.team.team_nm;

  return (
    <div
      ref={tooltipRef}
      className="absolute bg-white rounded-lg shadow-lg p-3 z-30 pointer-events-none border border-gray-200"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
        transform: 'translateY(-100%)',
      }}
    >
      <div className="text-sm font-semibold text-gray-800">차량번호</div>
      <div className="text-base font-bold text-light-green mt-1">{truckNo}</div>
      {teamName && (
        <div className="text-xs text-gray-500 mt-1">팀: {teamName}</div>
      )}
    </div>
  );
};

export default PolygonTooltip;
