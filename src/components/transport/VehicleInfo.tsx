import React from 'react';
import VehicleCard from './VehicleCard';
import { vehicles } from '@/data/vehicleData';

const VehicleInfo: React.FC = () => {
  return (
    <div className='grid grid-cols-[1fr_1fr_1fr] gap-6'>
      {vehicles.map((vehicle, index) => (
        <div className='col-span-1'>
          <VehicleCard
            key={index}
            vehicleType={vehicle.vehicleType}
            vehicleCategory={vehicle.vehicleCategory}
            vehicleNum={vehicle.vehicleNum}
            ton={vehicle.ton}
            maxTon={vehicle.maxTon}
            selectedMainDriver={vehicle.selectedMainDriver?.name || '미지정'}
            status={vehicle.broken}
          />
        </div>
      ))}
    </div>
  );
};

export default VehicleInfo;
