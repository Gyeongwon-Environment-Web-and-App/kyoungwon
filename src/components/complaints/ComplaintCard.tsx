import React, { useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { formatDateToYYMMDD } from '@/utils/formatDate';

import food from '../../assets/icons/categories/tags/food.svg';
import general from '../../assets/icons/categories/tags/general.svg';
import other from '../../assets/icons/categories/tags/other.svg';
import recycle from '../../assets/icons/categories/tags/recycle.svg';
import attentionRed from '../../assets/icons/common/attention_red.svg';
import type { Complaint } from '../../types/complaint';
import Popup from '../forms/Popup';

interface ComplaintCardProps {
  complaint: Complaint;
  onStatusChange?: (complaintId: number) => void;
  isSelected?: boolean;
  onSelectChange?: (complaintId: number, selected: boolean) => void;
  onCardClick?: (id: number) => void;
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onStatusChange,
  isSelected = false,
  onSelectChange,
  onCardClick,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const bad = complaint.source?.bad || false;

  const handleStatusClick = () => {
    setIsPopupOpen(true);
  };

  const handleConfirmStatusChange = () => {
    onStatusChange?.(complaint.id);
    setIsPopupOpen(false);
  };

  const handleCancelStatusChange = () => {
    setIsPopupOpen(false);
  };

  const getPopupMessage = () => {
    if (!complaint.status) {
      return (
        <>
          <p className="pb-2">
            처리결과를 <span className="text-darker-green">완료</span>로
          </p>
          <p>수정하시겠습니까?</p>
        </>
      );
    } else if (complaint.status) {
      return (
        <>
          <p className="pb-2">
            처리결과를 <span className="text-[#8E8E8E]">처리중</span>으로
          </p>
          <p>되돌리시겠습니까?</p>
        </>
      );
    }
    return '';
  };

  const truncateString = (str: string, maxLength: number) => {
    if (str.length <= maxLength) {
      return str;
    } else {
      return str.slice(0, maxLength - 3) + '...';
    }
  };

  return (
    <div
      className="bg-white border border-[#A2A2A2] rounded-lg flex justify-between cursor-pointer hover:bg-gray-50"
      onClick={(e) => {
        // Prevent card click when clicking on checkboxes or status buttons
        if (e.target instanceof HTMLElement) {
          const isInteractive = e.target.closest(
            'input[type="checkbox"], button, [role="button"]'
          );
          if (!isInteractive && onCardClick) {
            onCardClick(complaint.id);
          }
        }
      }}
    >
      <div className="flex flex-col justify-around p-3">
        <div className="flex items-center gap-2 mb-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(value) => onSelectChange?.(complaint.id, !!value)}
          />
          <span className="font-medium">{complaint.id}</span>
          <Separator orientation="vertical" className="h-4" />
          {formatDateToYYMMDD(complaint.datetime)}
          <Separator orientation="vertical" className="h-4" />
          {complaint.user.name}
          {bad && (
            <img src={attentionRed} alt="악성민원 태그" className="w-5" />
          )}
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 max-w-[6.5rem] xs:max-w-48 flex-wrap h-full flex-shrink-0">
            {complaint.teams.map((team, index) => {
              const getCategoryIcon = (category: string) => {
                switch (category) {
                  case '재활용':
                    return recycle;
                  case '음식물':
                    return food;
                  case '기타':
                    return other;
                  default:
                    return general;
                }
              };

              return (
                <img
                  key={index}
                  src={getCategoryIcon(team.category)}
                  alt={`${team.category} 태그`}
                  className="w-12"
                />
              );
            })}
          </div>
          <div className="flex font-bold text-lg ml-1">
            {complaint.content
              ? truncateString(complaint.content, 12)
              : truncateString(complaint.address?.address?.slice(7), 14)}
          </div>
        </div>
      </div>
      <div
        className={`flex items-center font-semibold justify-center text-center text-white cursor-pointer w-16 text-base rounded-r ${
          complaint.status ? 'bg-light-green' : 'bg-[#B1B1B1]'
        }`}
        onClick={handleStatusClick}
      >
        {complaint.status ? '완료' : '처리중'}
      </div>

      {isPopupOpen && (
        <Popup
          message={getPopupMessage()}
          yesNo={true}
          onFirstClick={handleConfirmStatusChange}
          onSecondClick={handleCancelStatusChange}
          toHome={false}
        />
      )}
    </div>
  );
};

export default ComplaintCard;
