import React, { useState } from 'react';

import { ChevronDown, X } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { drivers } from '@/data/vehicleData';
import type { VehicleFormData } from '@/types/transport';

import attention from '../../assets/icons/common/attention.svg';
import attentionRed from '../../assets/icons/common/attention_red.svg';
import GenericFileAttach from '../forms/GenericFileAttach';

// ! 수정 모드를 위해 interface로 prop 지정 필요

const VehicleForm: React.FC = () => {
  const [formData, setFormData] = useState<VehicleFormData>({
    vehicleType: '',
    vehicleNum: '',
    ton: '',
    maxTon: '',
    vehicleYear: '',
    vehicleCategory: '',
    uploadedFiles: [],
    drivers: [],
    selectedMainDriver: null,
    selectedTeamMembers: [],
    vehicleArea: [],
    broken: false,
  });
  const { vehicleId } = useParams();
  const isEditMode = Boolean(vehicleId);

  // const handleFileUpdate = (fileUpdates: { uploadedFiles: Array<{name: string, url: string, type: string, size: number}> }) => {
  //   updateFormData({ uploadedFiles: fileUpdates.uploadedFiles });
  // };

  const updateFormData = (updates: Partial<VehicleFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const toggleVehicleArea = (area: string) => {
    const isSelected = formData.vehicleArea.includes(area);
    updateFormData({
      vehicleArea: isSelected
        ? formData.vehicleArea.filter((a) => a !== area)
        : [...formData.vehicleArea, area],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.vehicleType.trim() ||
      !formData.vehicleNum.trim() ||
      !formData.ton.trim() ||
      !formData.vehicleYear.trim() ||
      !formData.vehicleCategory.trim() ||
      formData.vehicleArea.length === 0 || formData.vehicleArea.every(area => !area.trim()) ||
      !formData.selectedMainDriver
    ) {
      alert('필수 입력창을 모두 입력해주세요.');
      return;
    }

    console.log('차량정보 전송완료:', formData);
    // Handle form submission logic here
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-lg border border-a5a5a5">
        <div className="flex flex-col md:grid md:grid-cols-[150px_1fr_1fr] gap-x-4 gap-y-3 md:gap-y-7 items-start md:items-center px-5 md:px-10 py-5 md:py-10 text-lg">
          {/* 차 종 */}
          <label className="col-span-1 font-bold">
            차 종<span className="text-red pr-0"> *</span>
          </label>
          <input
            type="text"
            value={formData.vehicleType}
            onChange={(e) => updateFormData({ vehicleType: e.target.value })}
            className="col-span-2 rounded border border-light-border px-3 py-1.5 text-left text-base w-full"
            placeholder="예시: 봉고, 동양, AM 등"
          />

          {/* 차량번호*/}
          <label className="col-span-1 font-bold">
            차량 번호
            <span className="text-red pr-0"> *</span>
          </label>
          <input
            type="text"
            value={formData.vehicleNum}
            onChange={(e) => updateFormData({ vehicleNum: e.target.value })}
            className="col-span-2 rounded border border-light-border px-3 py-1.5 text-left text-base w-full"
            placeholder="예시: 12다 3456"
          />

          {/* 톤 수 */}
          <label className="col-span-1 font-bold">
            톤 수<span className="text-red pr-0"> *</span>
          </label>
          <div
            className={`flex col-span-2 text-sm border border-light-border rounded w-full`}
          >
            {['1T', '3.5T', '5T', '25T'].map((label, idx, arr) => (
              <button
                key={label}
                type="button"
                className={`
                  flex-1 px-4 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${formData.ton === label ? 'bg-lighter-green' : ''}
                  ${idx === 0 ? 'rounded-l' : ''}
                  ${idx === arr.length - 1 ? 'rounded-r' : ''}
                `}
                style={{
                  borderRight:
                    idx !== arr.length - 1 ? '1px solid #ACACAC' : 'none',
                }}
                onClick={() => updateFormData({ ton: label })}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 최대적재량 */}
          <label className="col-span-1 font-bold">
            최대적재량
          </label>
          <input
            type="text"
            value={formData.maxTon}
            onChange={(e) => updateFormData({ maxTon: e.target.value })}
            className="col-span-2 rounded border border-light-border px-3 py-1.5 text-left text-base w-full"
            placeholder="예시: 0.7T"
          />

          {/* 연식 */}
          <label className="col-span-1 font-bold">
            연식
            <span className="text-red pr-0"> *</span>
          </label>
          <input
            type="text"
            value={formData.vehicleYear}
            onChange={(e) => updateFormData({ vehicleYear: e.target.value })}
            className="col-span-2 rounded border border-light-border px-3 py-1.5 mb-0 text-left text-base w-full"
            placeholder="예시: 2013년형"
          />

          {/* 수거 종류 */}
          <label className="col-span-1 font-bold">
            수거 종류
            <span className="text-red pr-0"> *</span>
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
                  ${formData.vehicleCategory === label ? 'bg-lighter-green' : ''}
                  ${idx === 0 ? 'rounded-l' : ''}
                  ${idx === arr.length - 1 ? 'rounded-r' : ''}
                `}
                  style={{
                    borderRight:
                      idx !== arr.length - 1 ? '1px solid #ACACAC' : 'none',
                  }}
                  onClick={() => updateFormData({ vehicleCategory: label })}
                >
                  {label}
                </button>
              )
            )}
          </div>

          {/* 파일 첨부 */}
          <label className="col-span-1 font-bold">사진 첨부</label>
          <div className="col-span-2">
            <GenericFileAttach
              formData={{ uploadedFiles: formData.uploadedFiles}}
              // ! 여기 나중에 수정필요
              setFormData={(updates) => {
                if (typeof updates === 'function') {
                  updateFormData(updates(formData)); // Using stale formData
                } else {
                  updateFormData(updates);
                }
              }}
            />
          </div>

          {/* 기사님 선택 */}
          <label className="col-span-1 font-bold">
            기사님 선택
            <span className="text-red pr-0"> *</span>
          </label>
          <div className='flex items-center gap-x-2 md:block'>
            <div className="col-span-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="font-bold border border-light-border justify-between w-full md:w-[80%]"
                  >
                    <span className='block md:hidden'>담당기사</span>
                    <span className='hidden md:block'>담당기사 선택하기</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuRadioGroup
                    value={formData.selectedMainDriver?.phoneNum || ''}
                    onValueChange={(phoneNum) => {
                      const driver = drivers.find((d) => d.phoneNum === phoneNum);
                      updateFormData({ selectedMainDriver: driver || null });
                    }}
                  >
                    {drivers.map((driver) => (
                      <DropdownMenuRadioItem
                        key={driver.phoneNum}
                        value={driver.phoneNum}
                        className="text-base"
                      >
                        {driver.name} ({driver.phoneNum})
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
  
            <div className="col-span-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="font-bold border border-light-border justify-between w-full md:w-[80%]"
                  >
                    <span className='block md:hidden'>팀원</span>
                    <span className='hidden md:block'>팀원 선택하기</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {drivers
                    .filter(
                      (driver) =>
                        driver.phoneNum !== formData.selectedMainDriver?.phoneNum
                    )
                    .map((driver) => (
                      <DropdownMenuItem
                        key={driver.phoneNum}
                        onSelect={(e) => {
                          e.preventDefault();
                          const isSelected = formData.selectedTeamMembers.some(
                            (d) => d.phoneNum === driver.phoneNum
                          );
                          if (isSelected) {
                            updateFormData({
                              selectedTeamMembers:
                                formData.selectedTeamMembers.filter(
                                  (d) => d.phoneNum !== driver.phoneNum
                                ),
                            });
                          } else {
                            updateFormData({
                              selectedTeamMembers: [
                                ...formData.selectedTeamMembers,
                                driver,
                              ],
                            });
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.selectedTeamMembers.some(
                            (d) => d.phoneNum === driver.phoneNum
                          )}
                          className="mr-2 text-base"
                        />
                        {driver.name} ({driver.phoneNum})
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {(formData.selectedMainDriver ||
            formData.selectedTeamMembers.length > 0) && (
            <div className="col-span-3 flex flex-wrap">
              {formData.selectedMainDriver && (
                <div className="flex items-center mr-4">
                  <span className="text-base font-medium p-0 mr-2">
                    담당기사: {formData.selectedMainDriver.name} (
                    {formData.selectedMainDriver.phoneNum})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer hover:bg-white p-0"
                    onClick={() => updateFormData({ selectedMainDriver: null })}
                  >
                    <X className="h-4 w-4 text-red" />
                  </Button>
                </div>
              )}
              {formData.selectedTeamMembers.map((driver) => (
                <div key={driver.phoneNum} className="flex items-center mr-4">
                  <span className="text-base mr-2">
                    팀원: {driver.name} ({driver.phoneNum})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer hover:bg-white p-0"
                    onClick={() =>
                      updateFormData({
                        selectedTeamMembers:
                          formData.selectedTeamMembers.filter(
                            (d) => d.phoneNum !== driver.phoneNum
                          ),
                      })
                    }
                  >
                    <X className="h-4 w-4 text-red" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* 담당 구역 */}
          <label className="col-span-1 font-bold">
            담당 구역
            <span className="text-red pr-0"> *</span>
          </label>
          <div className="col-span-2 w-full">
            <div
              className={`flex text-sm border border-light-border rounded mb-2`}
            >
              {['쌍문1동', '쌍문2동', '쌍문3동', '쌍문4동'].map(
                (label, idx, arr) => (
                  <button
                    key={label}
                    type="button"
                    className={`
                    flex-1 flex items-center justify-center px-2 md:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${formData.vehicleArea.includes(label) ? 'bg-lighter-green' : ''}
                    ${idx === 0 ? 'rounded-l' : ''}
                    ${idx === arr.length - 1 ? 'rounded-r' : ''}
                  `}
                    style={{
                      borderRight:
                        idx !== arr.length - 1 ? '1px solid #ACACAC' : 'none',
                    }}
                    onClick={() => toggleVehicleArea(label)}
                  >
                    <input
                      type="checkbox"
                      checked={formData.vehicleArea.includes(label)}
                      className="mr-2 w-4 h-4 cursor-pointer hidden md:block"
                    />
                    {label}
                  </button>
                )
              )}
            </div>
            <div className={`flex text-sm border border-light-border rounded w-[50%]`}>
              {['방학1동', '방학2동'].map((label, idx, arr) => (
                <button
                  key={label}
                  type="button"
                  className={`
                    flex-1 flex items-center justify-center px-2 md:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${formData.vehicleArea.includes(label) ? 'bg-lighter-green' : ''}
                    ${idx === 0 ? 'rounded-l' : ''}
                    ${idx === arr.length - 1 ? 'rounded-r' : ''}
                  `}
                  style={{
                    borderRight:
                      idx !== arr.length - 1 ? '1px solid #ACACAC' : 'none',
                  }}
                  onClick={() => toggleVehicleArea(label)}
                >
                  <input
                    type="checkbox"
                    checked={formData.vehicleArea.includes(label)}
                    className="mr-2 w-4 h-4 cursor-pointer hidden md:block"
                  />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 악성 민원 체크 */}
          <div className="col-span-1"></div>
          <div className="col-span-1 flex items-center">
            <input
              tabIndex={15}
              type="checkbox"
              id="malicious"
              className="w-5 h-5 accent-red mr-2"
              checked={formData.broken}
              onChange={(e) =>
                updateFormData({
                  broken: e.target.checked,
                })
              }
            />
            <label
              htmlFor="malicious"
              className={`flex items-center text-[1rem] ${formData.broken ? 'text-red' : ''}`}
            >
              <img
                src={formData.broken ? attentionRed : attention}
                alt="느낌표"
                className="w-6 h-6 mr-1"
              />
              고장
            </label>
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

export default VehicleForm;
