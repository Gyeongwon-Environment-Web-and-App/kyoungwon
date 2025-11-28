import React from 'react';

import { useNavigate } from 'react-router-dom';

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
import pin from '../../assets/icons/map_card/location_pin.svg';
import truck from '../../assets/icons/map_card/truck.svg';
import team from '../../assets/icons/transport/team.png';

interface TeamCardProps {
  teamName: string;
  category: string;
  selectedVehicles: string[];
  regions: string[];
  drivers: VehicleDriver[];
  teamId: number;
  onDelete: (id: number) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({
  teamName,
  category,
  selectedVehicles,
  regions,
  drivers,
  teamId,
  onDelete,
}) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/transport/team/form/${teamId}`);
  };

  const handleDelete = () => {
    if (window.confirm(`"${teamName}" 팀을 정말 삭제하시겠습니까?`)) {
      onDelete(teamId);
    }
  };
  return (
    <div
      className={`relative text-left flex flex-row md:flex-col items-center md:items-start gap-1 px-4 py-3 md:py-6 rounded-lg border-2 border-light-green  cursor-default font-medium`}
    >
      {/* 오른쪽 위 메뉴 */}
      <div className="absolute right-3 top-3 cursor-pointer">
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

      <div className="flex flex-col span-y-1 font-normal">
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
          <span className="">{regions.join(', ')}</span>
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
            <span className="p-0 break-keep break-normal">
              {drivers.map((d) => `${d.name} (${d.phoneNum})`).join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamCard;
