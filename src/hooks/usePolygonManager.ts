import { useCallback, useEffect, useRef, useState } from 'react';

import {
  fetchPolygonsByCategory,
  getAvailableCategories,
} from '@/services/polygonService';
import type {
  PolygonClickEvent,
  PolygonFeature,
  RegionData,
} from '@/types/map';

import type { KakaoMap } from './useKakaoMaps';

interface UsePolygonManagerProps {
  mapInstance: KakaoMap | null;
  onPolygonClick?: (event: PolygonClickEvent) => void;
  isLoaded: boolean;
}

interface UsePolygonManagerReturn {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  polygonData: RegionData | null;
  isLoadingPolygons: boolean;
  polygonError: string | null;
  showPolygons: boolean;
  setShowPolygons: (show: boolean) => void;
  clearPolygons: () => void;
  handlePolygonToggle: () => void;
  getAvailableCategories: () => string[];
}

const isKakaoPolygon = (
  obj: unknown
): obj is {
  setMap: (map: unknown) => void;
  setOptions: (options: Record<string, unknown>) => void;
} => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'setMap' in obj &&
    'setOptions' in obj &&
    typeof (obj as { setMap: unknown }).setMap === 'function' &&
    typeof (obj as { setOptions: unknown }).setOptions === 'function'
  );
};

export const usePolygonManager = ({
  mapInstance,
  onPolygonClick,
  isLoaded,
}: UsePolygonManagerProps): UsePolygonManagerReturn => {
  const polygonsRef = useRef<unknown[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('음식물');
  const [polygonData, setPolygonData] = useState<RegionData | null>(null);
  const [isLoadingPolygons, setIsLoadingPolygons] = useState(false);
  const [polygonError, setPolygonError] = useState<string | null>(null);
  const [showPolygons, setShowPolygons] = useState(false);

  // Clear existing polygons
  const clearPolygons = useCallback(() => {
    polygonsRef.current.forEach((polygon) => {
      if (isKakaoPolygon(polygon)) {
        polygon.setMap(null);
      }
    });
    polygonsRef.current = [];
  }, []);

  // Create polygon from feature data
  const createPolygon = useCallback(
    (feature: PolygonFeature): unknown => {
      if (!mapInstance || !window.kakao) return null;

      try {
        const coordinates = feature.geometry.coordinates;

        // Validate coordinates structure
        if (
          !coordinates ||
          !Array.isArray(coordinates) ||
          coordinates.length === 0
        ) {
          console.error(
            'Invalid coordinates structure: missing or empty coordinates',
            coordinates
          );
          return null;
        }

        // Determine the ring structure
        // The API might return coordinates in different formats:
        // 1. Standard GeoJSON: [[[lng, lat], [lng, lat], ...]] - coordinates[0] is the ring
        // 2. Simplified: [[lng, lat], [lng, lat], ...] - coordinates itself is the ring
        let ring: number[][];

        // Check the structure of coordinates[0]
        const firstElement = coordinates[0];

        if (
          Array.isArray(firstElement) &&
          firstElement.length === 2 &&
          typeof firstElement[0] === 'number' &&
          typeof firstElement[1] === 'number' &&
          coordinates.length >= 3
        ) {
          // coordinates[0] is [lng, lat] - a single coordinate pair
          // This means coordinates itself is the ring: [[lng, lat], [lng, lat], ...]
          ring = coordinates as unknown as number[][];
        } else if (
          Array.isArray(firstElement) &&
          Array.isArray(firstElement[0]) &&
          firstElement[0].length === 2 &&
          typeof firstElement[0][0] === 'number'
        ) {
          // coordinates[0] is [[lng, lat], [lng, lat], ...] - the ring
          // This is standard GeoJSON format
          ring = coordinates[0];
        } else {
          console.error('❌ Unexpected coordinate structure:', {
            coordinates,
            firstElement,
            firstElementType: Array.isArray(firstElement)
              ? 'array'
              : typeof firstElement,
            firstElementLength: Array.isArray(firstElement)
              ? firstElement.length
              : 'N/A',
            firstElement0: Array.isArray(firstElement)
              ? firstElement[0]
              : 'N/A',
          });
          return null;
        }

        // Validate ring has at least 3 points
        if (!ring || ring.length < 3) {
          console.error(
            '❌ Invalid polygon: ring has less than 3 points',
            ring
          );
          return null;
        }

        // Validate first coordinate pair
        const firstCoord = ring[0];
        if (
          !Array.isArray(firstCoord) ||
          firstCoord.length !== 2 ||
          typeof firstCoord[0] !== 'number'
        ) {
          console.error('❌ Invalid coordinate pair:', firstCoord);
          return null;
        }

        const path = ring
          .map((coord) => {
            if (!Array.isArray(coord) || coord.length < 2) {
              console.error('Invalid coordinate:', coord);
              return null;
            }
            // coord is [lng, lat], convert to LatLng(lat, lng)
            return new window.kakao.maps.LatLng(coord[1], coord[0]);
          })
          .filter(Boolean); // Remove any null coordinates

        if (path.length < 3) {
          console.error(
            'Not enough valid coordinates for polygon:',
            path.length
          );
          return null;
        }

        const polygon = new (
          window.kakao.maps as unknown as {
            Polygon: new (options: Record<string, unknown>) => unknown;
          }
        ).Polygon({
          map: mapInstance,
          path: path,
          strokeWeight: 2,
          strokeColor: '#00BA13',
          strokeOpacity: 0.7,
          fillColor: '#fff',
          fillOpacity: 0.7,
        });

        // Add click event listener
        if (onPolygonClick) {
          (
            window.kakao.maps as unknown as {
              event: {
                addListener: (
                  target: unknown,
                  event: string,
                  handler: () => void
                ) => void;
              };
            }
          ).event.addListener(polygon, 'click', () => {
            onPolygonClick({
              polygon: feature,
              map: mapInstance,
            });
          });
        }

        // Add hover effects
        (
          window.kakao.maps as unknown as {
            event: {
              addListener: (
                target: unknown,
                event: string,
                handler: () => void
              ) => void;
            };
          }
        ).event.addListener(polygon, 'mouseover', function () {
          if (isKakaoPolygon(polygon)) {
            polygon.setOptions({ fillColor: '#C4FFCA', fillOpacity: 0.9, });
          }
        });

        (
          window.kakao.maps as unknown as {
            event: {
              addListener: (
                target: unknown,
                event: string,
                handler: () => void
              ) => void;
            };
          }
        ).event.addListener(polygon, 'mouseout', function () {
          if (isKakaoPolygon(polygon)) {
            polygon.setOptions({ fillColor: '#fff' });
          }
        });

        return polygon;
      } catch (error) {
        console.error('Failed to create polygon:', error);
        console.error('Feature data:', feature);
        return null;
      }
    },
    [onPolygonClick, mapInstance]
  );

  // Fetch polygons from API
  const fetchPolygons = useCallback(async (category: string) => {
    if (!category) return;

    setIsLoadingPolygons(true);
    setPolygonError(null);

    try {
      const data = await fetchPolygonsByCategory(category);

      if (!data || !data.region_areas || !data.region_areas.features) {
        throw new Error('Invalid polygon data received from API');
      }

      if (data.region_areas.features.length === 0) {
        setPolygonError(`${category} 차량 구역 오류`);
      } else {
        setPolygonData(data);
      }
    } catch (error) {
      console.error('Failed to fetch polygons:', error);
      setPolygonError(
        error instanceof Error
          ? error.message
          : '차량구역을 불러오는데 실패했습니다'
      );
      setPolygonData(null);
    } finally {
      setIsLoadingPolygons(false);
    }
  }, []);

  // Render polygons on map
  const renderPolygons = useCallback(() => {
    if (!mapInstance || !isLoaded || !polygonData || !showPolygons) {
      return;
    }

    clearPolygons();

    let successCount = 0;
    polygonData.region_areas.features.forEach((feature) => {
      const polygon = createPolygon(feature);
      if (polygon) {
        polygonsRef.current.push(polygon);
        successCount++;
      }
    });

    if (successCount === 0) {
      setPolygonError(
        'Failed to render any polygons. Check console for details.'
      );
    }
  }, [
    polygonData,
    showPolygons,
    isLoaded,
    clearPolygons,
    createPolygon,
    mapInstance,
  ]);

  // Handle polygon toggle
  const handlePolygonToggle = useCallback(() => {
    if (!showPolygons) {
      // Show polygons - fetch data first
      setShowPolygons(true);
      if (selectedCategory) {
        fetchPolygons(selectedCategory);
      }
    } else {
      // Hide polygons
      setShowPolygons(false);
      clearPolygons();
      setPolygonData(null);
      setPolygonError(null);
    }
  }, [showPolygons, selectedCategory, fetchPolygons, clearPolygons]);

  // Fetch polygons when category changes (only if polygons are shown)
  useEffect(() => {
    if (showPolygons && selectedCategory) {
      fetchPolygons(selectedCategory);
    }
  }, [selectedCategory, showPolygons, fetchPolygons]);

  // Render polygons when data changes
  useEffect(() => {
    renderPolygons();
  }, [renderPolygons]);

  return {
    selectedCategory,
    setSelectedCategory,
    polygonData,
    isLoadingPolygons,
    polygonError,
    showPolygons,
    setShowPolygons,
    clearPolygons,
    handlePolygonToggle,
    getAvailableCategories,
  };
};
