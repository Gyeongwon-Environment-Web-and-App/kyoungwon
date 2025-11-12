import { useCallback, useEffect, useState } from 'react';

import { transportService } from '@/services/transportService';
import type { Driver } from '@/types/transport';

// Transform API response to Driver format
const transformDriverData = (apiDriver: {
  id: number;
  name: string;
  phone_no: string;
  team_nms: string[];
  presigned_links: Array<{
    key: string;
    url: string;
  }>;
}): Driver => {
  return {
    id: apiDriver.id,
    name: apiDriver.name,
    phoneNum: apiDriver.phone_no,
    teamNms: apiDriver.team_nms,
    presignedLink: apiDriver.presigned_links[0]?.url,
  };
};

export const useDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadDrivers = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await transportService.getAllDrivers();

      if (response.drivers_extended && response.drivers_extended.length > 0) {
        // Transform each driver from API format to Driver format
        const transformedDrivers =
          response.drivers_extended.map(transformDriverData);
        setDrivers(transformedDrivers);
      } else {
        setDrivers([]);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '기사 목록을 불러오는데 실패했습니다.';
      setFetchError(errorMessage);
      console.error('useDrivers - loadDrivers error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  return {
    drivers,
    isLoading,
    fetchError,
    refetch: loadDrivers,
  };
};
