import React, { useState } from 'react';

import { useParams } from 'react-router-dom';

import type { VehicleFormData } from '@/types/transport';

import attention from '../../assets/icons/common/attention.svg';
import attentionRed from '../../assets/icons/common/attention_red.svg';
import FileAttach from '../forms/FileAttach';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.vehicleType.trim() ||
      !formData.vehicleNum.trim() ||
      !formData.ton.trim() ||
      !formData.vehicleYear.trim() ||
      !formData.vehicleCategory.trim() ||
      formData.vehicleArea.length === 0 ||
      formData.vehicleArea.every((area) => !area.trim()) ||
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
          <label className="col-span-1 font-bold">최대적재량</label>
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

          {/* 파일 첨부 */}
          <label className="col-span-1 font-bold">사진 첨부</label>
          <div className="col-span-2">
            <FileAttach
              formData={{ uploadedFiles: formData.uploadedFiles }}
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

          {/* 고장 체크 */}
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
