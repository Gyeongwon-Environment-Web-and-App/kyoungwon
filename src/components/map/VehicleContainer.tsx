import React, { useMemo } from 'react';

import { useVehicles } from '@/hooks/useVehicles';

import VehicleCard from './VehicleCard';

interface VehicleContainerProps {
  selectedCategory?: string;
  searchQuery?: string;
}

const VehicleContainer: React.FC<VehicleContainerProps> = ({
  selectedCategory,
  searchQuery,
}) => {
  const { vehicles, isLoading, fetchError } = useVehicles();

  const filterVehicles = useMemo(() => {
    let filtered = vehicles;

    // 카테고리 필터
    if (selectedCategory) {
      filtered = filtered.filter((vehicle) => {
        return vehicle.teams?.category === selectedCategory;
      });
    }

    // 검색 필터
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((vehicle) => {
        // 차량 번호 검색
        const vehicleNumMatch = vehicle.vehicleNum
          ?.toLowerCase()
          .includes(query);

        // 차량 종류, 브랜드 검색
        const vehicleTypeMatch = vehicle.vehicleType
          ?.toLowerCase()
          .includes(query);

        // 기사님 성함 검색
        const driverNameMatch = vehicle.drivers?.some((driver) =>
          driver.name?.toLowerCase().includes(query)
        );

        // 기사님 번호 검색
        const phoneNumMatch = vehicle.drivers?.some((driver) =>
          driver.phoneNum.toLowerCase().includes(query)
        );

        return (
          vehicleNumMatch ||
          vehicleTypeMatch ||
          driverNameMatch ||
          phoneNumMatch
        );
      });
    }

    return filtered;
  }, [vehicles, selectedCategory, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">차량 목록을 불러오는 중...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-red-500">오류가 발생했습니다</p>
      </div>
    );
  }

  if (!filterVehicles || filterVehicles.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">
          {searchQuery && searchQuery.trim()
            ? '검색 결과가 없습니다'
            : '차량 정보가 없습니다'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 xxxs:h-[70vh] xs:h-[76vh] xsm:h-[78vh] overflow-y-auto scrollbar-hide">
      {filterVehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          brandName={vehicle.vehicleType}
          drivers={vehicle.drivers}
          size={vehicle.ton}
          status={vehicle.status}
          teams={vehicle.teams}
          truckNum={vehicle.vehicleNum}
          year={vehicle.vehicleYear}
        />
      ))}
    </div>
  );
};

export default VehicleContainer;
