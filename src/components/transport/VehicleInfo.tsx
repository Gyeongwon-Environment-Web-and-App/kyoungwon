import React, { useState } from 'react';

import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useVehicles } from '@/hooks/useVehicles';
import { transportService } from '@/services/transportService';

import { Button } from '../ui/button';
import VehicleCard from './VehicleCard';

const VehicleInfo: React.FC = () => {
  const [focus, setFocus] = useState('');
  const navigate = useNavigate();
  const { vehicles, isLoading, fetchError, refetch } = useVehicles();

  const handleDeleteVehicle = async (id: number) => {
    try {
      const response = await transportService.deleteVehicle(id);

      if (response.message) {
        alert(response.message);
        // Refetch vehicles after successful deletion
        refetch();
      }
    } catch (error) {
      console.error('차량 삭제 실패:', error);
      alert('차량 삭제 중 오류가 발생했습니다.');
    }
  };

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

  if (!isLoading && !fetchError && vehicles.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">차량 정보가 없습니다</p>
      </div>
    );
  }

  // Filter vehicles based on status filter
  const filteredVehicles = vehicles.filter((vehicle) => {
    if (focus === '운행중') {
      return vehicle.status !== 'broken';
    } else if (focus === '고장') {
      return vehicle.status === 'broken';
    }
    return true; // '전체' or no filter
  });

  return (
    <>
      <div className="flex justify-between items-center my-6">
        <div className="flex items-center gap-2 md:gap-4">
          <div
            className={`hidden md:flex col-span-2 text-sm border border-light-border rounded`}
          >
            {['전체', '운행중', '고장'].map((label, idx, arr) => (
              <button
                key={label}
                type="button"
                className={`
                  flex-1 w-20 px-4 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${focus === label ? 'bg-lighter-green' : ''}
                  ${idx === 0 ? 'rounded-l' : ''}
                  ${idx === arr.length - 1 ? 'rounded-r' : ''}
                `}
                style={{
                  borderRight:
                    idx !== arr.length - 1 ? '1px solid #ACACAC' : 'none',
                }}
                onClick={() => setFocus(label)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="block md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="font-bold border border-light-border justify-between"
                >
                  차량 상태
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full text-center">
                <DropdownMenuItem onClick={() => setFocus('전체')}>
                  전체
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFocus('운행중')}>
                  운행중
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFocus('고장')}>
                  고장
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="font-bold border border-light-border justify-between"
                >
                  수거 종류
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full text-center">
                <DropdownMenuItem className="">재활용</DropdownMenuItem>
                <DropdownMenuItem className="">생활</DropdownMenuItem>
                <DropdownMenuItem className="">음식물</DropdownMenuItem>
                <DropdownMenuItem className="">클린 / 수송</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div> */}
        </div>
        <button
          className="py-1.5 px-2 md:px-5 rounded-lg bg-light-green hover:bg-[#009d10] font-bold text-white"
          onClick={() => navigate('/transport/vehicle/form')}
        >
          등록하기
        </button>
      </div>
      <div className="md:grid md:grid-cols-[1fr_1fr_1fr] gap-6">
        {filteredVehicles.map((vehicle, index) => (
          <div
            key={vehicle.id || vehicle.vehicleNum || index}
            className="col-span-1 mb:mb-0 mb-6"
          >
            <VehicleCard
              vehicleType={vehicle.vehicleType}
              vehicleNum={vehicle.vehicleNum}
              vehicleYear={vehicle.vehicleYear}
              ton={vehicle.ton}
              selectedMainDriver={
                vehicle.drivers && vehicle.drivers.length > 0
                  ? vehicle.drivers[0].name
                  : '미지정'
              }
              status={vehicle.status === 'broken'}
              vehicleId={vehicle.id}
              onDelete={handleDeleteVehicle}
              presignedLink={vehicle.presignedLink}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default VehicleInfo;
