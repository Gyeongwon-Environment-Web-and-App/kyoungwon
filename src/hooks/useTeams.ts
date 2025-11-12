import { useCallback, useEffect, useState } from 'react';

import { transportService } from '@/services/transportService';
import type { Team, VehicleDriver } from '@/types/transport';

// Transform API response to Team format
const transformTeamData = (apiTeam: {
  id: number;
  category: string;
  team_nm: string;
  trucks: string[];
  official_regions: string[];
  drivers: Array<{
    id: number;
    name: string;
    phone_no: string;
  }>;
}): Team => {
  // Transform drivers: phone_no → phoneNum
  const transformedDrivers: VehicleDriver[] = apiTeam.drivers.map((driver) => ({
    name: driver.name,
    phoneNum: driver.phone_no,
    category: apiTeam.category,
    teamNum: apiTeam.team_nm,
  }));

  return {
    id: apiTeam.id,
    teamName: apiTeam.team_nm,
    category: apiTeam.category as Team['category'],
    selectedVehicles: apiTeam.trucks,
    regions: apiTeam.official_regions,
    drivers: transformedDrivers,
  };
};

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadTeams = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await transportService.getAllTeams();

      if (response.teams && response.teams.length > 0) {
        // Transform each team from API format to Team format
        const transformedTeams = response.teams.map(transformTeamData);
        setTeams(transformedTeams);
      } else {
        setTeams([]);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '팀 목록을 불러오는데 실패했습니다.';
      setFetchError(errorMessage);
      console.error('useTeams - loadTeams error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  return {
    teams,
    isLoading,
    fetchError,
    refetch: loadTeams,
  };
};
