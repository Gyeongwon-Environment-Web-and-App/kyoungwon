import { useCallback, useEffect, useState } from 'react';

import { transportService } from '@/services/transportService';
import type { Vehicle } from '@/types/transport';

// Transform API response to Vehicle format
const transformVehicleData = (apiVehicle: {
  id: number;
  truck_no: string;
  brand_nm: string;
  size: string;
  year: string;
  status: string;
  presigned_links?: Array<{
    key: string;
    url: string;
  }>;
  driver_name?: string;
  driver_phone_no?: string;
}): Vehicle => {
  // Extract URL from presigned_links array
  const imageUrl =
    apiVehicle.presigned_links && apiVehicle.presigned_links.length > 0
      ? apiVehicle.presigned_links[0].url
      : undefined;

  return {
    id: apiVehicle.id,
    vehicleType: apiVehicle.brand_nm,
    vehicleNum: apiVehicle.truck_no,
    ton: apiVehicle.size,
    vehicleYear: apiVehicle.year,
    status: apiVehicle.status,
    presignedLink: imageUrl,
    driverName: apiVehicle.driver_name,
    driverPhoneNum: apiVehicle.driver_phone_no,
  };
};

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadVehicles = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await transportService.getAllVehicles();

      if (response.trucks && response.trucks.length > 0) {
        // Transform each vehicle from API format to Vehicle format
        const transformedVehicles = response.trucks.map(transformVehicleData);
        setVehicles(transformedVehicles);
      } else {
        setVehicles([]);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '차량 목록을 불러오는데 실패했습니다.';
      setFetchError(errorMessage);
      console.error('useVehicles - loadVehicles error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  return {
    vehicles,
    isLoading,
    fetchError,
    refetch: loadVehicles,
  };
};
