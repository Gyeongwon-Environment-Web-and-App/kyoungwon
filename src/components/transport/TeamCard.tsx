import React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { VehicleDriver } from '@/types/transport';

import three from '../../assets/icons/actions/three.svg';
import food from '../../assets/icons/categories/tags/food.svg';
import general from '../../assets/icons/categories/tags/general.svg';
import other from '../../assets/icons/categories/tags/other.svg';
import recycle from '../../assets/icons/categories/tags/recycle.svg';
// import teamIcon from '../../assets/icons/common/team.svg';
import pin from '../../assets/icons/map_card/location_pin.svg';
import truck from '../../assets/icons/map_card/truck.svg';
import team from '../../assets/icons/transport/team.svg';

interface DriverCardProps {
  teamName: string;
  category: string;
  selectedVehicles: string[];
  region: string;
  drivers: VehicleDriver[];
}

const TeamCard: React.FC<DriverCardProps> = ({
  teamName,
  category,
  selectedVehicles,
  region,
  drivers,
}) => {
  return (
    <div
      className={`relative text-left flex flex-row md:flex-col items-center gap-1 px-4 py-3 md:py-6 rounded-lg border-2 border-light-green  cursor-default font-medium`}
    >
      {/* 오른쪽 위 메뉴 */}
      <div className="absolute right-3 top-3 cursor-pointer">
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

      <div className="flex flex-col span-y-1">
        <div className="flex items-center mb-2 text-xl font-semibold">
          <img
            src={
              category === '생활'
                ? general
                : category === '재활용'
                  ? recycle
                  : category === '음식물'
                    ? food
                    : other
            }
            alt="쓰레기 상성"
            className="mr-2 md:w-14 w-10"
          />
          {teamName}
        </div>
        <div className="flex items-center text-base md:text-lg">
          <img src={pin} alt="핀 아이콘" className="w-5 h-5 mr-1" />
          <span className="">{region}</span>
        </div>
        {selectedVehicles.length > 0 && (
          <div className="flex items-start text-base md:text-lg">
            <img src={truck} alt="트럭 아이콘" className="w-5 h-5 mr-1 mt-1" />
            <span className="break-keep break-normal">
              {selectedVehicles.join(', ')}
            </span>
          </div>
        )}
        {drivers.length > 0 && (
          <div className="flex items-start text-base md:text-lg">
            <img src={team} alt="소속팀" className="mr-1 h-6 w-6 mt-0.5" />
            <span className="p-0">
              {drivers.map((d) => `${d.name} (${d.phoneNum})`).join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamCard;
