import React, { useCallback, useEffect, useId, useRef, useState } from 'react';

import {
  type KakaoInfoWindow,
  type KakaoMap,
  type KakaoMarker,
  useKakaoMaps,
} from '../../hooks/useKakaoMaps';
import { getDongInfo } from '../../utils/dongMapping';

interface AdvancedKakaoMapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  isVisible: boolean;
  resetCenter?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onMarkerClick?: (marker: KakaoMarker) => void;
}

const AdvancedKakaoMap: React.FC<AdvancedKakaoMapProps> = ({
  latitude,
  longitude,
  address,
  isVisible,
  resetCenter,
  className = 'w-full rounded-b-lg',
  style = { height: '300px' },
  onMarkerClick,
}) => {
  const mapId = useId();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMap | null>(null);
  const markerInstanceRef = useRef<KakaoMarker | null>(null);
  const infoWindowInstanceRef = useRef<KakaoInfoWindow | null>(null);

  const { isLoaded, isLoading, error, loadSDK } = useKakaoMaps();

  const [dongInfo, setDongInfo] = useState<string>('');
  const [dongInfoLoading, setDongInfoLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Reset hasInitialized when resetCenter changes (new search)
  useEffect(() => {
    if (resetCenter) {
      setHasInitialized(false);
    }
  }, [resetCenter]);

  // Load SDK on mount
  useEffect(() => {
    if (!isLoaded && !isLoading) {
      loadSDK().catch(console.error);
    }
  }, [isLoaded, isLoading, loadSDK]);

  // 동 정보 비동기 추출
  useEffect(() => {
    const fetchDongInfo = async () => {
      if (!address) {
        setDongInfo('');
        return;
      }

      setDongInfoLoading(true);
      try {
        const result = await getDongInfo(address);
        setDongInfo(result);
      } catch (error) {
        console.error('동 정보 추출 실패:', error);
        setDongInfo('');
      } finally {
        setDongInfoLoading(false);
      }
    };

    fetchDongInfo();
  }, [address]);

  // Initialize map when SDK is ready
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !isLoaded) {
      return;
    }

    try {
      // Clean up existing map instance
      if (mapInstanceRef.current && mapRef.current) {
        mapRef.current.innerHTML = '';
      }

      // Use provided coordinates if available, otherwise default center
      let centerLat = 37.6713997467788; // 기본 서울 중심
      let centerLng = 127.04148388606;

      if (latitude && longitude) {
        centerLat = latitude;
        centerLng = longitude;
        // console.log(`🗺️ 지도 초기화: 좌표 사용 (${centerLat}, ${centerLng})`);
      } else {
        console.log(
          `🗺️ 지도 초기화: 기본 좌표 사용 (${centerLat}, ${centerLng})`
        );
      }

      const defaultCenter = new window.kakao.maps.LatLng(centerLat, centerLng);

      const mapOptions = {
        center: defaultCenter,
        level: 3,
      };

      const newMap = new window.kakao.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = newMap;

      // Create info window
      const newInfoWindow = new window.kakao.maps.InfoWindow({
        content: '<div style="padding:10px;min-width:200px;">로딩 중...</div>',
      });
      infoWindowInstanceRef.current = newInfoWindow;

      // If we have coordinates, create marker immediately
      if (latitude && longitude) {
        // console.log(`📍 마커 생성: (${latitude}, ${longitude})`);
        const position = new window.kakao.maps.LatLng(latitude, longitude);
        const marker = new window.kakao.maps.Marker({
          map: newMap,
          position: position,
        }) as KakaoMarker;
        markerInstanceRef.current = marker;

        // Set info window content and open it
        const infoContent = `
        <div style="padding: 10px; min-width: 200px;">
          <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">
            민원 발생 위치${dongInfo ? `: ${dongInfo}` : ''}
          </h3>
          <p style="margin: 0; font-size: 12px; color: #666;">${address || '주소 정보 없음'}</p>
          ${dongInfoLoading ? '<p style="margin: 5px 0 0 0; font-size: 11px; color: #999;">동 정보 로딩 중...</p>' : ''}
        </div>
      `;
        newInfoWindow.setContent(infoContent);
        newInfoWindow.open(newMap, marker);

        // Add click event to marker
        window.kakao.maps.event.addListener(marker, 'click', () => {
          newInfoWindow.open(newMap, marker);
          onMarkerClick?.(marker);
        });

        setHasInitialized(true);
      }
    } catch (error) {
      console.error('❌ 지도 초기화 실패:', error);
    }
  }, [
    isLoaded,
    latitude,
    longitude,
    address,
    dongInfo,
    dongInfoLoading,
    onMarkerClick,
  ]);

  // Update map when coordinates change
  const updateMapWithCoordinates = useCallback(
    (lat: number, lng: number) => {
      const mapInstance = mapInstanceRef.current;
      const infoWindowInstance = infoWindowInstanceRef.current;

      if (!mapInstance || !infoWindowInstance) {
        console.log('❌ 지도 인스턴스 또는 정보창이 없음');
        return;
      }

      try {
        console.log(`🔄 좌표 업데이트: (${lat}, ${lng})`);
        const position = new window.kakao.maps.LatLng(lat, lng);

        // Always center when coordinates change (for new searches)
        if (resetCenter || !hasInitialized) {
          console.log(`🎯 지도 중심 이동: (${lat}, ${lng})`);
          mapInstance.setCenter(position);
          setHasInitialized(true);
        }

        // Remove existing marker
        if (markerInstanceRef.current) {
          markerInstanceRef.current.setMap(null);
          console.log('🗑️ 기존 마커 제거');
        }

        // Create new marker
        const newMarker = new window.kakao.maps.Marker({
          map: mapInstance,
          position: position,
        }) as KakaoMarker;
        markerInstanceRef.current = newMarker;
        console.log(`📍 새 마커 생성: (${lat}, ${lng})`);

        // Update info window content
        const infoContent = `
        <div style="padding: 10px; min-width: 200px;">
          <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">
            민원 발생 위치${dongInfo ? `: ${dongInfo}` : ''}
          </h3>
          <p style="margin: 0; font-size: 12px; color: #666;">${address || '주소 정보 없음'}</p>
          ${dongInfoLoading ? '<p style="margin: 5px 0 0 0; font-size: 11px; color: #999;">동 정보 로딩 중...</p>' : ''}
        </div>
      `;

        infoWindowInstance.setContent(infoContent);
        infoWindowInstance.open(mapInstance, newMarker);
        console.log('💬 정보창 열기');

        // Add click event to marker
        window.kakao.maps.event.addListener(newMarker, 'click', () => {
          if (infoWindowInstance) {
            infoWindowInstance.open(mapInstance, newMarker);
          }
          onMarkerClick?.(newMarker);
        });
      } catch (error) {
        console.error('❌ 좌표 업데이트 실패:', error);
      }
    },
    [
      address,
      dongInfo,
      dongInfoLoading,
      hasInitialized,
      resetCenter,
      onMarkerClick,
    ]
  );

  // Geocode address to coordinates
  const geocodeAddress = useCallback(
    async (address: string) => {
      const mapInstance = mapInstanceRef.current;
      const infoWindowInstance = infoWindowInstanceRef.current;

      if (!mapInstance || !address) {
        return;
      }

      try {
        const geocoder = new window.kakao.maps.services.Geocoder();

        geocoder.addressSearch(address, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(
              parseFloat(result[0].y),
              parseFloat(result[0].x)
            );

            // Only center on first load or when resetting
            if (!hasInitialized || resetCenter) {
              mapInstance.setCenter(coords);
              setHasInitialized(true);
            }

            // Remove existing marker
            if (markerInstanceRef.current) {
              markerInstanceRef.current.setMap(null);
            }

            // Create new marker
            const newMarker = new window.kakao.maps.Marker({
              map: mapInstance,
              position: coords,
            }) as KakaoMarker;
            markerInstanceRef.current = newMarker;

            // Update info window
            if (infoWindowInstance) {
              const infoContent = `
              <div style="padding: 10px; min-width: 200px;">
                <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">
                  검색된 위치${dongInfo ? `: ${dongInfo}` : ''}
                </h3>
                <p style="margin: 0; font-size: 12px; color: #666;">${address}</p>
                ${dongInfoLoading ? '<p style="margin: 5px 0 0 0; font-size: 11px; color: #999;">동 정보 로딩 중...</p>' : ''}
              </div>
            `;
              infoWindowInstance.setContent(infoContent);
              infoWindowInstance.open(mapInstance, newMarker);
            }

            // Add click event
            window.kakao.maps.event.addListener(newMarker, 'click', () => {
              if (infoWindowInstance) {
                infoWindowInstance.open(mapInstance, newMarker);
              }
              onMarkerClick?.(newMarker);
            });
          } else {
            console.warn(`⚠️ 주소 변환 실패: ${status}`);
          }
        });
      } catch (error) {
        console.error('❌ 주소 지오코딩 오류:', error);
      }
    },
    [dongInfo, dongInfoLoading, hasInitialized, resetCenter, onMarkerClick]
  );

  // Initialize map when ready and visible
  useEffect(() => {
    if (isLoaded && isVisible) {
      // Wait for next render cycle to ensure container exists
      setTimeout(() => {
        initializeMap();
      }, 100);
    }
  }, [isLoaded, isVisible]);

  // Handle coordinate updates
  useEffect(() => {
    if (latitude && longitude && mapInstanceRef.current && isLoaded) {
      updateMapWithCoordinates(latitude, longitude);
    }
  }, [latitude, longitude, isLoaded]);

  // Handle address updates
  useEffect(() => {
    if (
      address &&
      mapInstanceRef.current &&
      !latitude &&
      !longitude &&
      isLoaded
    ) {
      geocodeAddress(address);
    }
  }, [address, latitude, longitude, isLoaded]);

  // Handle visibility changes
  useEffect(() => {
    if (!isVisible) {
      // Clean up when hidden
      if (infoWindowInstanceRef.current) {
        infoWindowInstanceRef.current.close();
      }
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setMap(null);
      }
    }
  }, [isVisible]);

  // Cleanup on unmount
  useEffect(() => {
    const currentMapRef = mapRef.current;
    return () => {
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setMap(null);
      }
      if (infoWindowInstanceRef.current) {
        infoWindowInstanceRef.current.close();
      }
      if (currentMapRef) {
        currentMapRef.innerHTML = '';
      }
    };
  }, []);

  if (!isVisible) {
    return null;
  }

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
            <p className="text-xs text-gray-500 mt-1">SDK 초기화 중</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <div
        id={`advanced-map-${mapId}`}
        ref={mapRef}
        className="w-full h-full rounded-b-lg border  border-light-border"
      />
    </div>
  );
};

export default AdvancedKakaoMap;
