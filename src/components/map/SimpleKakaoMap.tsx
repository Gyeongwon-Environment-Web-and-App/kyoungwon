import React, { forwardRef, useEffect, useId, useRef, useState } from 'react';

import { usePinManager } from '@/hooks/usePinManager';
import { usePolygonManager } from '@/hooks/usePolygonManager';
import type { PinClickEvent, PinData, PolygonClickEvent } from '@/types/map';

import { type KakaoMap, useKakaoMaps } from '../../hooks/useKakaoMaps';
import PolygonTooltip from './PolygonTooltip';

interface SimpleKakaoMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
  pins?: PinData[];
  onPinClick?: (event: PinClickEvent) => void;
  onPolygonClick?: (event: PolygonClickEvent) => void;
  showPolygonControls?: boolean;
}

const SimpleKakaoMap = forwardRef<HTMLDivElement, SimpleKakaoMapProps>(
  (
    {
      center = { lat: 37.657463236, lng: 127.035542772 },
      zoom = 5,
      className = 'w-full h-full',
      style,
      pins = [],
      onPinClick,
      onPolygonClick,
      showPolygonControls = true,
    },
    ref
  ) => {
    // Combine dummy pins with provided pins
    const allPins = [...pins];
    const mapId = useId();
    const [mapInstance, setMapInstance] = useState<KakaoMap | null>(null);
    const mapInstanceRef = useRef<KakaoMap | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { isLoaded, isLoading, error, loadSDK } = useKakaoMaps();

    // Initialize map when SDK is ready (only once)
    useEffect(() => {
      if (!isLoaded || !containerRef.current || mapInstanceRef.current) return;

      try {
        // Create new map instance with interaction controls
        const options = {
          center: new window.kakao.maps.LatLng(center.lat, center.lng),
          level: zoom,
          // Enable map controls for interaction
          draggable: true,
          scrollwheel: true,
          disableDoubleClick: false,
          disableDoubleClickZoom: false,
          keyboardShortcuts: true,
        };

        const newMapInstance = new window.kakao.maps.Map(
          containerRef.current,
          options
        );
        mapInstanceRef.current = newMapInstance;
        setMapInstance(newMapInstance);

        // Set ref for parent component
        if (
          ref &&
          typeof ref === 'object' &&
          ref.current !== undefined &&
          containerRef.current
        ) {
          (ref as React.RefObject<HTMLDivElement>).current =
            containerRef.current;
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded]);

    // Update map center and zoom when props change (without re-initializing)
    useEffect(() => {
      if (!mapInstance || !isLoaded) return;

      try {
        const newCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
        mapInstance.setCenter(newCenter);
        mapInstance.setLevel(zoom);
      } catch (error) {
        console.error('Failed to update map:', error);
      }
    }, [center.lat, center.lng, zoom, isLoaded, mapInstance]);

    const { isGeocoding, clearMarkers } = usePinManager({
      mapInstance: mapInstance,
      pins: allPins,
      onPinClick,
      isLoaded,
    });

    const {
      selectedCategory,
      setSelectedCategory,
      isLoadingPolygons,
      polygonError,
      showPolygons,
      clearPolygons,
      handlePolygonToggle,
      getAvailableCategories,
      hoveredPolygon,
      hoveredPolygonPosition,
    } = usePolygonManager({
      mapInstance: mapInstance,
      onPolygonClick,
      isLoaded,
    });

    // Load SDK on mount
    useEffect(() => {
      if (!isLoaded && !isLoading) {
        loadSDK().catch(console.error);
      }
    }, [isLoaded, isLoading, loadSDK]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        clearMarkers();
        clearPolygons();
        if (mapInstanceRef.current && containerRef.current) {
          containerRef.current.innerHTML = '';
          mapInstanceRef.current = null;
        }
        setMapInstance(null);
      };
    }, [clearMarkers, clearPolygons]);

    if (error) {
      return (
        <div className={className} style={style}>
          <div className="w-full h-full flex items-center justify-center bg-red-50">
            <div className="text-center">
              <p className="text-sm text-red-600">지도 로딩 실패</p>
              <p className="text-xs text-red-500 mt-1">{error}</p>
            </div>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className={className} style={style}>
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm">카카오맵 로딩 중...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="relative"
        style={{ height: style?.height || '100%', minHeight: '400px' }}
      >
        <div
          id={`simple-map-${mapId}`}
          ref={(node) => {
            containerRef.current = node;
            if (
              ref &&
              typeof ref === 'object' &&
              ref.current !== undefined &&
              node
            ) {
              (ref as React.RefObject<HTMLDivElement>).current = node;
            }
          }}
          className={className}
          style={{
            ...style,
            height: style?.height || '100%',
            minHeight: '100vh',
            pointerEvents: 'auto',
            touchAction: 'none',
            userSelect: 'none',
          }}
        />

        {/* Geocoding loading overlay */}
        {isGeocoding && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">핀 위치 확인 중...</p>
            </div>
          </div>
        )}

        {/* Polygon Controls */}
        {showPolygonControls && (
          <div className="absolute top-16 sm:top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-20">
            <div className="flex flex-col gap-2">
              {/* Category Selector */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoadingPolygons}
              >
                {getAvailableCategories().map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Toggle Button */}
              <button
                onClick={handlePolygonToggle}
                disabled={isLoadingPolygons}
                className="px-3 py-1 rounded text-sm font-medium transition-colors bg-light-green text-white hover:bg-lighter-green disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingPolygons ? (
                  <div className="flex items-center gap-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                    로딩...
                  </div>
                ) : showPolygons ? (
                  '차량구역 숨기기'
                ) : (
                  '차량구역 표시'
                )}
              </button>

              {/* Error Message */}
              {polygonError && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {polygonError}
                </div>
              )}
            </div>
          </div>
        )}

        {hoveredPolygon && hoveredPolygonPosition && containerRef.current && (
          <PolygonTooltip
            feature={hoveredPolygon}
            position={hoveredPolygonPosition}
            mapContainerRef={containerRef}
          />
        )}
      </div>
    );
  }
);

SimpleKakaoMap.displayName = 'SimpleKakaoMap';
export default SimpleKakaoMap;
