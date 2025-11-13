import React from 'react';

import { useNavigate } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import three from '../../assets/icons/actions/three.svg';
import phone from '../../assets/icons/map_card/phone.svg';
import driver from '../../assets/icons/transport/sample_driver.svg';
import team from '../../assets/icons/transport/team.svg';

interface DriverCardProps {
  name: string;
  phoneNum: string;
  teamNms: string[];
  driverId: number;
  onDelete: (id: number) => void;
  presignedLink?: string;
}

const DriverCard: React.FC<DriverCardProps> = ({
  name,
  phoneNum,
  teamNms,
  driverId,
  onDelete,
  presignedLink,
}) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/transport/driver/form/${driverId}`);
  };

  const handleDelete = () => {
    if (window.confirm(`"${name}" 기사를 정말 삭제하시겠습니까?`)) {
      onDelete(driverId);
    }
  };
  return (
    <div
      className={`relative text-left flex flex-row md:flex-col items-center gap-1 px-4 py-3 md:py-6 rounded-lg border-2 border-light-green font-semibold cursor-default`}
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
        src={presignedLink || driver}
        alt={name}
        className="w-16 md:w-28 py-0 md:py-5 mr-2 md:mr-0"
      />
      <div className="flex flex-col span-y-1">
        <span className="text-xl">{name} 기사님</span>
        <div className="flex items-center text-base md:text-lg">
          <img src={phone} alt="전화번호" className="mr-1 h-5 w-5" />
          <span className="">{phoneNum}</span>
        </div>
        <div className="flex items-center text-base md:text-lg">
          <img src={team} alt="소속팀" className="mr-1 h-6 w-6" />
          <span className="break-keep break-normal">
            {teamNms.length > 0 ? teamNms.join(', ') : '소속 팀 없음'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DriverCard;
