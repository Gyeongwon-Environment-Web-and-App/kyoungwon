import React from 'react';

import type { DateRange } from 'react-day-picker';

import attention from '../../assets/icons/categories/map_categories/attention.svg';
import att_white from '../../assets/icons/categories/map_categories/attention_white.svg';
import food from '../../assets/icons/categories/map_categories/food.svg';
import food_white from '../../assets/icons/categories/map_categories/food_white.svg';
import general from '../../assets/icons/categories/map_categories/general.svg';
import gen_white from '../../assets/icons/categories/map_categories/general_white.svg';
import allComp from '../../assets/icons/categories/map_categories/location.svg';
import allComp_white from '../../assets/icons/categories/map_categories/location_white.svg';
import others from '../../assets/icons/categories/map_categories/others.svg';
import oth_white from '../../assets/icons/categories/map_categories/others_white.svg';
import recycle from '../../assets/icons/categories/map_categories/recycle.svg';
import rec_white from '../../assets/icons/categories/map_categories/recycle_white.svg';
import DateRangePicker from '../common/DateRangePicker';

interface MapFiltersProps {
  sidebarOpen: boolean;
  dateRange?: DateRange;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
  // onFilterChange: (filter: FilterOptions) => void;
  // isLoading?: boolean;
  selectedCategory?: string;
  onCategoryChange?: (category: string | undefined) => void;
}

// interface FilterOptions {
//   category?: 'food' | 'recycle' | 'general' | 'other';
//   dateRange?: {
//     start: Date;
//     end: Date;
//   };
//   area?: string;
//   status?: 'active' | 'resolved' | 'pending';
// }

const filterOptions = [
  {
    id: 'all',
    label: '전체 민원 표시',
    icon: allComp,
    iconWhite: allComp_white,
  },
  { id: 'general', label: '생활', icon: general, iconWhite: gen_white },
  { id: 'recycle', label: '재활용', icon: recycle, iconWhite: rec_white },
  { id: 'food', label: '음식물', icon: food, iconWhite: food_white },
  { id: 'others', label: '기타', icon: others, iconWhite: oth_white },
  { id: 'bad', label: '반복민원', icon: attention, iconWhite: att_white },
];

const MapFilters: React.FC<MapFiltersProps> = ({
  sidebarOpen,
  dateRange,
  onDateRangeChange,
  selectedCategory = 'all',
  onCategoryChange,
}) => {
  const handleFilterClick = (categoryId: string) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  return (
    <div
      className={`fixed top-4 z-50 ${sidebarOpen ? 'left-[36rem]' : 'left-16 md:left-24'}`}
    >
      <div className="flex gap-2 mb-2">
        {filterOptions.map((option) => (
          <button
            key={option.id}
            className={`flex gap-x-2 border border-d9d9d9 rounded-full shadow-md px-2 sm:px-3 py-2 ${selectedCategory === option.id ? 'bg-darker-green text-white' : 'bg-white'}`}
            onClick={() => handleFilterClick(option.id)}
          >
            <img
              src={
                selectedCategory === option.id ? option.iconWhite : option.icon
              }
              alt={`${option.label} 필터`}
            />
            <span className="hidden xl:block text-sm xl:text-base pt-0.5 xl:pt-0 font-semibold ">
              {option.label}
            </span>
          </button>
        ))}
      </div>
      <DateRangePicker
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        containerClassName="border border-d9d9d9 rounded-full px-4 py-1 bg-white shadow-md"
      />
    </div>
  );
};

export default MapFilters;
