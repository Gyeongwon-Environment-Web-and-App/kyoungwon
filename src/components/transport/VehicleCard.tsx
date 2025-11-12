import React from 'react';

import { useNavigate } from 'react-router-dom';

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
  vehicleCategory?: string;
  vehicleNum: string;
  ton: string;
  vehicleYear: string;
  selectedMainDriver: string;
  status: boolean | undefined;
  vehicleId: number;
  onDelete: (id: number) => void;
  presignedLink?: string;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicleType,
  vehicleCategory,
  vehicleNum,
  vehicleYear,
  ton,
  selectedMainDriver,
  status,
  vehicleId,
  onDelete,
  presignedLink,
}) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/transport/vehicle/form/${vehicleId}`);
  };

  const handleDelete = () => {
    if (window.confirm(`"${vehicleNum}" 차량을 정말 삭제하시겠습니까?`)) {
      onDelete(vehicleId);
    }
  };
  return (
    <div
      className={`relative text-left px-1 xxs:px-2 md:px-4 py-6 rounded-lg border-2 ${status ? 'border-red' : 'border-light-green'} font-semibold cursor-default flex md:block items-center md:items-start`}
    >
      {/* 오른쪽 위 메뉴 */}
      <div className="absolute right-3 top-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <img src={three} alt="수정/삭제" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuItem onClick={handleEdit}>수정하기</DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>삭제하기</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <img
        src={presignedLink || sample}
        alt={presignedLink ? `${vehicleNum} 차량 사진` : '임시차량사진'}
        className="w-24 h-16 xxs:w-32 xxs:h-20 md:w-full md:h-auto object-cover rounded-lg pb-0 md:pb-4 mr-1 md:mr-0"
        onError={(e) => {
          // Fallback to sample image if presigned link fails to load
          const target = e.target as HTMLImageElement;
          if (target.src !== sample) {
            target.src = sample;
          }
        }}
      />
      <div className="">
        <div className="flex items-center text-base md:text-lg pb-1 md:pb-3">
          {vehicleCategory && (
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
              className="mr-2 md:w-16 w-12"
            />
          )}
          {vehicleNum}
        </div>
        <div className="flex items-center text-sm md:text-base pb-1 md:pb-3 gap-x-1">
          <img src={truck} alt="트럭" className="mr-1 md:h-6 md:w-6 w-4 h-4" />
          <span>{vehicleType}</span>
          {vehicleCategory && <span>{vehicleCategory}</span>}
          <span>
            ({ton}, {vehicleYear})
          </span>
        </div>
        <div className="flex items-center text-sm md:text-base">
          <img src={driver} alt="기사" className="mr-2 md:h-6 md:w-6 w-4 h-4" />
          <span>{selectedMainDriver}</span>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
