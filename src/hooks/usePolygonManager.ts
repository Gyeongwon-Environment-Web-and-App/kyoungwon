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
  hoveredPolygon: PolygonFeature | null;
  hoveredPolygonPosition: { x: number; y: number } | null;
  setHoveredPolygon: (
    feature: PolygonFeature | null,
    position?: { x: number; y: number }
  ) => void;
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
  const [hoveredPolygon, setHoveredPolygonState] =
    useState<PolygonFeature | null>(null);
  const [hoveredPolygonPosition, setHoveredPolygonPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const mousePositionRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const isTouchInteractionRef = useRef<boolean>(false);

  // Create setter function that also calculates position:
  const setHoveredPolygon = useCallback(
    (feature: PolygonFeature | null, position?: { x: number; y: number }) => {
      setHoveredPolygonState(feature);
      // Use provided position or current mouse position
      setHoveredPolygonPosition(
        position || mousePositionRef.current || { x: 0, y: 0 }
      );
    },
    []
  );

  // Track mouse position globally for tooltip positioning
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
      // Update tooltip position if polygon is hovered (only for mouse, not touch)
      if (
        hoveredPolygon &&
        mousePositionRef.current &&
        !isTouchInteractionRef.current
      ) {
        setHoveredPolygonPosition(mousePositionRef.current);
      }
    };

    if (hoveredPolygon) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [hoveredPolygon]);

  // Handle clicking outside polygons to close tooltip on mobile
  useEffect(() => {
    const handleMapClick = (e: MouseEvent | TouchEvent) => {
      // Only handle if it's a touch interaction and tooltip is shown
      if (isTouchInteractionRef.current && hoveredPolygon) {
        // Check if click is outside any polygon (this is handled by polygon click events)
        // This is a fallback for clicks on the map itself
        const target = e.target as HTMLElement;
        // If clicking on map container (not a polygon), close tooltip
        if (target && target.classList.contains('map-container')) {
          setHoveredPolygon(null);
        }
      }
    };

    if (isTouchInteractionRef.current) {
      window.addEventListener('click', handleMapClick, true);
      window.addEventListener('touchend', handleMapClick, true);
      return () => {
        window.removeEventListener('click', handleMapClick, true);
        window.removeEventListener('touchend', handleMapClick, true);
      };
    }
  }, [hoveredPolygon, setHoveredPolygon]);

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

        // Helper function to extract position from event
        const getEventPosition = (
          event?: unknown
        ): { x: number; y: number } | null => {
          const browserEvent =
            (event as { originalEvent?: MouseEvent | TouchEvent })
              ?.originalEvent || (event as MouseEvent | TouchEvent);

          if (browserEvent) {
            // Handle touch events
            if ('touches' in browserEvent && browserEvent.touches.length > 0) {
              const touch = browserEvent.touches[0];
              return { x: touch.clientX, y: touch.clientY };
            }
            // Handle mouse events
            if ('clientX' in browserEvent && 'clientY' in browserEvent) {
              return { x: browserEvent.clientX, y: browserEvent.clientY };
            }
          }
          return null;
        };

        // Add click event listener for polygon click callback
        if (onPolygonClick) {
          (
            window.kakao.maps as unknown as {
              event: {
                addListener: (
                  target: unknown,
                  event: string,
                  handler: (event?: unknown) => void
                ) => void;
              };
            }
          ).event.addListener(polygon, 'click', (event?: unknown) => {
            // Show tooltip on click (for mobile devices)
            const position = getEventPosition(event);
            if (position) {
              mousePositionRef.current = position;
              setHoveredPolygon(feature, position);
            }

            // Call the original click handler
            onPolygonClick({
              polygon: feature,
              map: mapInstance,
            });
          });
        } else {
          // If no onPolygonClick handler, still show tooltip on click
          (
            window.kakao.maps as unknown as {
              event: {
                addListener: (
                  target: unknown,
                  event: string,
                  handler: (event?: unknown) => void
                ) => void;
              };
            }
          ).event.addListener(polygon, 'click', (event?: unknown) => {
            const position = getEventPosition(event);
            if (position) {
              mousePositionRef.current = position;
              setHoveredPolygon(feature, position);
            }
          });
        }

        // Add touch event listeners for mobile devices
        (
          window.kakao.maps as unknown as {
            event: {
              addListener: (
                target: unknown,
                event: string,
                handler: (event?: unknown) => void
              ) => void;
            };
          }
        ).event.addListener(polygon, 'touchstart', (event?: unknown) => {
          isTouchInteractionRef.current = true;
          touchStartTimeRef.current = Date.now();

          if (isKakaoPolygon(polygon)) {
            polygon.setOptions({ fillColor: '#C4FFCA', fillOpacity: 0.9 });
          }

          const position = getEventPosition(event);
          if (position) {
            mousePositionRef.current = position;
            setHoveredPolygon(feature, position);
          }

          // Reset touch flag after a delay to allow mouse events to work again
          setTimeout(() => {
            isTouchInteractionRef.current = false;
          }, 500);
        });

        (
          window.kakao.maps as unknown as {
            event: {
              addListener: (
                target: unknown,
                event: string,
                handler: (event?: unknown) => void
              ) => void;
            };
          }
        ).event.addListener(polygon, 'touchend', (event?: unknown) => {
          // Keep tooltip shown on touch end
          const position = getEventPosition(event);
          if (position) {
            mousePositionRef.current = position;
            setHoveredPolygon(feature, position);
          }
        });

        // Add hover effects (for desktop mouse interactions)
        (
          window.kakao.maps as unknown as {
            event: {
              addListener: (
                target: unknown,
                event: string,
                handler: (mouseEvent?: unknown) => void
              ) => void;
            };
          }
        ).event.addListener(
          polygon,
          'mouseover',
          function (mouseEvent?: unknown) {
            // Skip if this is a touch interaction
            if (isTouchInteractionRef.current) return;

            if (isKakaoPolygon(polygon)) {
              polygon.setOptions({ fillColor: '#C4FFCA', fillOpacity: 0.9 });

              // Get mouse position from browser event
              // Kakao Maps events may wrap the original browser event
              const browserEvent =
                (mouseEvent as { originalEvent?: MouseEvent })?.originalEvent ||
                (mouseEvent as MouseEvent);

              if (
                browserEvent &&
                'clientX' in browserEvent &&
                'clientY' in browserEvent
              ) {
                // Store current mouse position and set hovered polygon
                mousePositionRef.current = {
                  x: browserEvent.clientX,
                  y: browserEvent.clientY,
                };
                setHoveredPolygon(feature, mousePositionRef.current);
              } else {
                // Fallback: set feature without specific position (will use mousemove tracking)
                setHoveredPolygon(feature);
              }
            }
          }
        );

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
          // Only handle mouseout for non-touch interactions
          if (isTouchInteractionRef.current) return;

          if (isKakaoPolygon(polygon)) {
            polygon.setOptions({ fillColor: '#fff' });
            setHoveredPolygon(null);
          }
        });

        // Reset touch interaction flag after a delay
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
        ).event.addListener(polygon, 'touchcancel', function () {
          isTouchInteractionRef.current = false;
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
    [onPolygonClick, mapInstance, setHoveredPolygon]
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
    hoveredPolygon,
    hoveredPolygonPosition,
    setHoveredPolygon,
  };
};
