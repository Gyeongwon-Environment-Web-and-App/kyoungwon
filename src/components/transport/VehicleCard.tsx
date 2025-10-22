import React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import sample from '../../assets/background/sample_car.png';
import three from '../../assets/icons/actions/three.svg';
import food from '../../assets/icons/categories/tags/food.svg';
import general from '../../assets/icons/categories/tags/general.svg';
import other from '../../assets/icons/categories/tags/other.svg';
import recycle from '../../assets/icons/categories/tags/recycle.svg';
import driver from '../../assets/icons/map_card/driver.svg';
import truck from '../../assets/icons/map_card/truck.svg';

interface VehicleCardProps {
  vehicleType: string;
  vehicleCategory: string;
  vehicleNum: string;
  ton: string;
  maxTon?: string;
  selectedMainDriver: string;
  status: boolean | undefined;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicleType,
  vehicleCategory,
  vehicleNum,
  ton,
  maxTon,
  selectedMainDriver,
  status,
}) => {
  return (
    <div
      className={`relative text-left px-4 py-6 rounded-lg border-2 ${status ? 'border-red' : 'border-light-green'} font-semibold cursor-default`}
    >
      {/* 오른쪽 위 메뉴 */}
      <div className="absolute right-3 top-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <img src={three} alt="수정/삭제" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuItem>수정하기</DropdownMenuItem>
            <DropdownMenuItem>삭제하기</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <img src={sample} alt="임시차량사진" className="py-2 pb-3" />
      <div className="flex items-center text-lg pb-3">
        <img
          src={
            vehicleCategory === '생활'
              ? general
              : vehicleCategory === '재활용'
                ? recycle
                : vehicleCategory === '음식물'
                  ? food
                  : other
          }
          alt="쓰레기 상성"
          className="mr-2"
        />
        {vehicleNum}
      </div>
      <div className="flex items-center text-base pb-3 gap-x-1">
        <img src={truck} alt="트럭" className="mr-1 h-6 w-6" />
        <span>{vehicleType}</span>
        <span>{maxTon ? maxTon : ton}</span>
        <span>{vehicleCategory}</span>
        <span>({ton})</span>
      </div>
      <div className="flex items-center">
        <img src={driver} alt="기사" className="mr-2 h-6 w-6" />
        <span>{selectedMainDriver}</span>
      </div>
    </div>
  );
};

export default VehicleCard;
