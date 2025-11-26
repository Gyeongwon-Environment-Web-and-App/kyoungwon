import React from 'react';

import food from '../../assets/icons/categories/tags/food.svg';
import general from '../../assets/icons/categories/tags/general.svg';
import other from '../../assets/icons/categories/tags/other.svg';
import recycle from '../../assets/icons/categories/tags/recycle.svg';
import team from '../../assets/icons/transport/team.svg';
import phone from '../../assets/icons/map_card/phone.svg';
import clean1 from '../../assets/icons/trucks/clean1.svg';
import clean25 from '../../assets/icons/trucks/clean25.svg';
import food1 from '../../assets/icons/trucks/food1.svg';
import food35 from '../../assets/icons/trucks/food3.5.svg';
import food5 from '../../assets/icons/trucks/food5.svg';
import general1 from '../../assets/icons/trucks/general1.svg';
import general35 from '../../assets/icons/trucks/general3.5.svg';
import general5 from '../../assets/icons/trucks/general5.svg';
import none1 from '../../assets/icons/trucks/none1.svg';
import none35 from '../../assets/icons/trucks/none3.5.svg';
import none5 from '../../assets/icons/trucks/none5.svg';
import recycle1 from '../../assets/icons/trucks/recycle1.svg';

interface VehicleCardProps {
  brandName: string;
  drivers: {
    name: string;
    phoneNum: string;
  }[];
  size: string;
  status: string;
  teams?: {
    teamName: string;
    category: string;
  };
  truckNum: string;
  year: string;
}

const getCategoryIcon = (category: string): string => {
  switch (category) {
    case '재활용':
      return recycle;
    case '음식물':
      return food;
    case '생활':
      return general;
    case '기타':
      return other;
    default:
      return recycle; // Default fallback
  }
};

const getTruckIcon = (
  category: string | null | undefined,
  size: string
): string => {
  switch (category) {
    case '재활용':
      return recycle1;
    case '음식물':
      switch (size) {
        case '1T':
          return food1;
        case '3.5T':
          return food35;
        case '5T':
          return food5;
      }
      return food1;
    case '생활':
      switch (size) {
        case '1T':
          return general1;
        case '3.5T':
          return general35;
        case '5T':
          return general5;
      }
      return general1;
    case '기타':
    case '수송':
    case '클린':
      switch (size) {
        case '1T':
          return clean1;
        case '25T':
          return clean25;
      }
      return clean25;
    default:
      switch (size) {
        case '1T':
          return none1;
        case '3.5T':
          return none35;
        case '5T':
          return none5;
        default:
          return none1;
      }
  }
};

const VehicleCard: React.FC<VehicleCardProps> = ({
  brandName,
  drivers,
  size,
  status,
  teams,
  truckNum,
}) => {
  return (
    <div className={`border ${status === 'broken' ? 'border-red' : 'border-d9d9d9'} rounded-lg flex py-3 md:py-6 px-2 md:px-4`}>
      <div className='flex flex-col justify-center'>
        <div className="flex items-start gap-2">
          <img
            src={getCategoryIcon(teams?.category || '')}
            alt={teams?.category || '카테고리 없음'}
            className='w-10 md:w-16 mt-1 md:mt-0'
          />
          <span className='font-semibold md:font-bold text-sm md:text-base'>{brandName} {size}</span>
        </div>
        <img src={getTruckIcon(teams?.category, size)} alt="트럭 아이콘" className='p-2 md:p-4 max-w-28 md:max-w-48' />
      </div>
      <div className="flex items-center text-sm md:text-base">
        <div className={`border-l pr-2 md:px-2 py-16 ${status === 'broken' ? 'border-red' : 'border-d9d9d9'}`}></div>
        <div className="flex flex-col gap-2">
          <p className="text-base md:text-xl font-bold">{truckNum}</p>
          <div className="flex items-start gap-1">
            <img src={team} alt="기사 아이콘" className='w-4 md:w-6 h-4 md:h-6 mt-0.5'/>
            <p className="break-keep break-normal">
              {teams?.category}{' '}{teams?.teamName || ''}
            </p>
          </div>
          <div className="flex items-start gap-1">
            <img src={phone} alt="" className='w-3 md:w-5 h-3 md:h-5 mt-1' />
            <p className="break-keep break-normal">{drivers.map((driver) => (`${driver.name} ${driver.phoneNum}`)).join(', ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
