import React, { useState } from 'react';

import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { vehicles } from '@/data/vehicleData';

import { Button } from '../ui/button';
import VehicleCard from './VehicleCard';

const VehicleInfo: React.FC = () => {
  const [focus, setFocus] = useState('');
  const navigate = useNavigate();

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
                <DropdownMenuItem className="">전체</DropdownMenuItem>
                <DropdownMenuItem className="">운행중</DropdownMenuItem>
                <DropdownMenuItem className="">고장</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
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
          </div>
        </div>
        <button
          className="py-1.5 px-2 md:px-5 rounded-lg bg-light-green hover:bg-[#009d10] font-bold text-white"
          onClick={() => navigate('/transport/vehicle/form')}
        >
          등록하기
        </button>
      </div>
      <div className="md:grid md:grid-cols-[1fr_1fr_1fr] gap-6">
        {vehicles.map((vehicle, index) => (
          <div
            key={vehicle.vehicleNum || index}
            className="col-span-1 mb:mb-0 mb-6"
          >
            <VehicleCard
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
    </>
  );
};

export default VehicleInfo;
