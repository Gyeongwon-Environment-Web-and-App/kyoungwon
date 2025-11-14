import React from 'react';

import { useVehicles } from '@/hooks/useVehicles';

import VehicleCard from './VehicleCard';

const VehicleContainer: React.FC = () => {
  const { vehicles, isLoading, fetchError } = useVehicles();

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

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">차량 정보가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {vehicles.map((vehicle) => (
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
