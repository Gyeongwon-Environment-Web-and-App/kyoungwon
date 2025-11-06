import React, { useState } from 'react';

import { ChevronDown, X } from 'lucide-react';
import { useParams } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { vehicles as vehicleList } from '@/data/vehicleData';
import type { TeamFormData } from '@/types/transport';

import { Button } from '../ui/button';

// ! 수정 모드를 위해 interface로 prop 지정 필요

const TeamForm: React.FC = () => {
  const [formData, setFormData] = useState<TeamFormData>({
    category: '',
    teamName: '',
    selectedVehicles: [],
  });
  const { teamId } = useParams();
  const isEditMode = Boolean(teamId);

  const updateFormData = (updates: Partial<TeamFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.category.trim() ||
      !formData.teamName.trim() ||
      formData.selectedVehicles.length < 1
    ) {
      alert('필수 입력창을 모두 입력해주세요.');
      return;
    }

    console.log('팀 정보 전송완료:', formData);
    // Handle form submission logic here
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-lg border border-a5a5a5">
        <div className="flex flex-col md:grid md:grid-cols-[150px_1fr_1fr] gap-x-4 gap-y-3 md:gap-y-7 items-start md:items-center px-5 md:px-10 py-5 md:py-10 text-lg">
          {/* 쓰레기 상성 */}
          <label className="col-span-1 font-bold">
            담당 상성<span className="text-red pr-0"> *</span>
          </label>
          <div
            className={`flex col-span-2 text-sm border border-light-border rounded w-full`}
          >
            {['생활', '음식물', '재활용', '클린', '수송'].map(
              (label, idx, arr) => (
                <button
                  key={label}
                  type="button"
                  className={`
                  flex-1 px-1 md:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${formData.category === label ? 'bg-lighter-green' : ''}
                  ${idx === 0 ? 'rounded-l' : ''}
                  ${idx === arr.length - 1 ? 'rounded-r' : ''}
                `}
                  style={{
                    borderRight:
                      idx !== arr.length - 1 ? '1px solid #ACACAC' : 'none',
                  }}
                  onClick={() => updateFormData({ category: label })}
                >
                  {label}
                </button>
              )
            )}
          </div>

          {/* 팀 명 */}
          <label className="col-span-1 font-bold">
            팀 명<span className="text-red pr-0"> *</span>
          </label>
          <input
            type="text"
            value={formData.teamName}
            onChange={(e) => updateFormData({ teamName: e.target.value })}
            className="col-span-2 rounded border border-light-border text-base px-3 py-1.5 text-left w-full"
            placeholder="예시: 1팀"
          />

          {/* 차량 선택 */}
          <label className="col-span-1 font-bold">
            차량 선택
            <span className="text-red pr-0"> *</span>
          </label>
          <div className="col-span-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="font-bold border border-light-border justify-between w-full md:w-[60%]"
                >
                  <span className="block md:hidden">차량</span>
                  <span className="hidden md:block">차량 선택하기</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {vehicleList.map((v) => (
                  <DropdownMenuItem
                    key={v.vehicleNum}
                    onSelect={(e) => {
                      e.preventDefault();
                      const id = v.vehicleNum;
                      const exists = formData.selectedVehicles.includes(id);
                      updateFormData({
                        selectedVehicles: exists
                          ? formData.selectedVehicles.filter((x) => x !== id)
                          : [...formData.selectedVehicles, id],
                      });
                    }}
                    className="text-base"
                  >
                    <input
                      type="checkbox"
                      className="mr-2 text-base"
                      checked={formData.selectedVehicles.includes(v.vehicleNum)}
                    />
                    {v.vehicleType} - {v.vehicleNum}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="col-span-1"></div>
          <div className="col-span-2 flex flex-wrap items-center">
            {/* 선택된 차량 표시 */}
            {formData.selectedVehicles.map((vehicleNum) => (
              <div key={vehicleNum} className="flex items-center gap-x-2">
                {vehicleNum}
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer p-0 hover:bg-white mr-4"
                  onClick={() =>
                    updateFormData({
                      selectedVehicles: formData.selectedVehicles.filter(
                        (v) => v !== vehicleNum
                      ),
                    })
                  }
                >
                  <X className="h-4 w-4 text-red" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="text-center mt-5 pb-5">
        <button
          type="submit"
          className="bg-light-green hover:bg-green-600 text-white font-semibold px-20 py-2 rounded outline-1"
        >
          {isEditMode ? '수정 완료' : '작성 완료'}
        </button>
      </div>
    </form>
  );
};

export default TeamForm;
