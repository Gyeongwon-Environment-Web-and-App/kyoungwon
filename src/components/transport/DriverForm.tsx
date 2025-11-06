import React, { useState } from 'react';

import { useParams } from 'react-router-dom';

import type { DriverFormData } from '@/types/transport';

import { validatePhoneNumber } from '../../utils/validateDash';
import GenericFileAttach from '../forms/GenericFileAttach';

// ! 수정 모드를 위해 interface로 prop 지정 필요

const DriverForm: React.FC = () => {
  const [formData, setFormData] = useState<DriverFormData>({
    name: '',
    phoneNum: '',
    category: '',
    teamNum: '',
    uploadedFiles: [],
  });
  const { driverId } = useParams();
  const isEditMode = Boolean(driverId);

  const updateFormData = (updates: Partial<DriverFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.phoneNum.trim() ||
      !formData.category.trim() ||
      !formData.teamNum.trim()
    ) {
      alert('필수 입력창을 모두 입력해주세요.');
      return;
    }

    // Validate phone number for dashes
    const phoneValidation = validatePhoneNumber(formData.phoneNum);
    if (!phoneValidation.isValid) {
      alert(phoneValidation.message || '전화번호 형식이 올바르지 않습니다.');
      return;
    }

    console.log('기사정보 전송완료:', formData);
    // Handle form submission logic here
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-lg border border-a5a5a5">
        <div className="flex flex-col md:grid md:grid-cols-[150px_1fr_1fr] gap-x-4 gap-y-3 md:gap-y-7 items-start md:items-center px-5 md:px-10 py-5 md:py-10 text-lg">
          {/* 이름 */}
          <label className="col-span-1 font-bold">
            이름
            <span className="text-red pr-0"> *</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            className="col-span-2 rounded border border-light-border text-base px-3 py-1.5 text-left w-full"
            placeholder="예시: 홍길동"
          />

          {/* 전화번호 */}
          <label className="col-span-1 font-bold">
            전화번호
            <span className="text-red pr-0"> *</span>
          </label>
          <input
            type="text"
            value={formData.phoneNum}
            onChange={(e) => updateFormData({ phoneNum: e.target.value })}
            className="col-span-2 rounded border border-light-border text-base px-3 py-1.5 text-left  w-full"
            placeholder={`'-'를 빼고 입력하세요`}
          />

          {/* 담당 팀 */}
          <label className="col-span-1 font-bold">
            담당 팀<span className="text-red pr-0"> *</span>
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

          {/* 조 */}
          <label className="col-span-1 font-bold">
            조<span className="text-red pr-0"> *</span>
          </label>
          <input
            type="text"
            value={formData.teamNum}
            onChange={(e) => updateFormData({ teamNum: e.target.value })}
            className="col-span-2 rounded border border-light-border text-base px-3 py-1.5 text-left  w-full"
            placeholder="예시: 1조"
          />

          {/* 파일 첨부 */}
          <label className="col-span-1 font-bold">사진 첨부</label>
          <div className="col-span-2">
            <GenericFileAttach
              formData={formData}
              setFormData={(updates) => {
                if (typeof updates === 'function') {
                  updateFormData(updates(formData));
                } else {
                  updateFormData(updates);
                }
              }}
            />
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

export default DriverForm;
