import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { usePinManager } from '@/hooks/usePinManager';
import {
  fetchPolygonsByCategory,
  getAvailableCategories,
} from '@/services/polygonService';
import type {
  PinClickEvent,
  PinData,
  PolygonClickEvent,
  PolygonFeature,
  RegionData,
} from '@/types/map';

import { type KakaoMap, useKakaoMaps } from '../../hooks/useKakaoMaps';

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
    const mapInstanceRef = useRef<KakaoMap | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const polygonsRef = useRef<unknown[]>([]);
    const { isLoaded, isLoading, error, loadSDK } = useKakaoMaps();

    // Polygon state
    const [selectedCategory, setSelectedCategory] = useState<string>('음식물');
    const [polygonData, setPolygonData] = useState<RegionData | null>(null);
    const [isLoadingPolygons, setIsLoadingPolygons] = useState(false);
    const [polygonError, setPolygonError] = useState<string | null>(null);
    const [showPolygons, setShowPolygons] = useState(false);

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
        if (!mapInstanceRef.current || !window.kakao) return null;

        try {
          const coordinates = feature.geometry.coordinates[0][0];

          if (!coordinates || coordinates.length < 3) {
            console.error('Invalid polygon coordinates:', coordinates);
            return null;
          }

          const path = coordinates
            .map((coord) => {
              if (!Array.isArray(coord) || coord.length < 2) {
                console.error('Invalid coordinate:', coord);
                return null;
              }
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
            map: mapInstanceRef.current,
            path: path,
            strokeWeight: 2,
            strokeColor: '#004c80',
            strokeOpacity: 0.8,
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
                map: mapInstanceRef.current,
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
              polygon.setOptions({ fillColor: '#09f' });
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
      [onPolygonClick]
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
          setPolygonError(`No polygons found for ${category}`);
        } else {
          setPolygonData(data);
        }
      } catch (error) {
        console.error('Failed to fetch polygons:', error);
        setPolygonError(
          error instanceof Error ? error.message : 'Failed to load polygons'
        );
        setPolygonData(null);
      } finally {
        setIsLoadingPolygons(false);
      }
    }, []);

    // Render polygons on map
    const renderPolygons = useCallback(() => {
      if (
        !mapInstanceRef.current ||
        !isLoaded ||
        !polygonData ||
        !showPolygons
      ) {
        return;
      }

      clearPolygons();

      let successCount = 0;
      polygonData.region_areas.features.forEach((feature, index) => {
        console.log(
          `Creating polygon ${index + 1}/${polygonData.region_areas.features.length}`
        );
        const polygon = createPolygon(feature);
        if (polygon) {
          polygonsRef.current.push(polygon);
          successCount++;
        }
      });

      console.log(
        `Successfully created ${successCount}/${polygonData.region_areas.features.length} polygons`
      );

      if (successCount === 0) {
        setPolygonError(
          'Failed to render any polygons. Check console for details.'
        );
      }
    }, [polygonData, showPolygons, isLoaded, clearPolygons, createPolygon]);

    // Initialize map when SDK is ready
    useEffect(() => {
      if (!isLoaded || !containerRef.current) return;

      try {
        // Clean up existing map instance
        if (mapInstanceRef.current) {
          // Kakao Maps doesn't have a direct destroy method, but we can clear the container
          const container = containerRef.current;
          if (container) {
            container.innerHTML = '';
          }
        }

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

        const mapInstance = new window.kakao.maps.Map(
          containerRef.current,
          options
        );
        mapInstanceRef.current = mapInstance;

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
    }, [isLoaded, center.lat, center.lng, zoom]);

    // Update map center and zoom when props change
    useEffect(() => {
      if (!mapInstanceRef.current || !isLoaded) return;

      try {
        const newCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
        mapInstanceRef.current.setCenter(newCenter);
        mapInstanceRef.current.setLevel(zoom);
      } catch (error) {
        console.error('Failed to update map:', error);
      }
    }, [center.lat, center.lng, zoom, isLoaded]);

    const { isGeocoding, clearMarkers } = usePinManager({
      mapInstance: mapInstanceRef.current,
      pins: allPins,
      onPinClick,
      isLoaded,
    });

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
    }, [selectedCategory, showPolygons]);

    // Render polygons when data changes
    useEffect(() => {
      renderPolygons();
    }, [polygonData, showPolygons, isLoaded]);

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
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-20">
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
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  showPolygons
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoadingPolygons ? (
                  <div className="flex items-center gap-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                    로딩...
                  </div>
                ) : showPolygons ? (
                  '폴리곤 숨기기'
                ) : (
                  '폴리곤 표시'
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
      </div>
    );
  }
);

SimpleKakaoMap.displayName = 'SimpleKakaoMap';
export default SimpleKakaoMap;
