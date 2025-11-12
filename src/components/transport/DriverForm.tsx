import React, { useState } from 'react';

import { ChevronDown, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { teams as teamList } from '@/data/vehicleData';
import { transportService } from '@/services/transportService';
import type { DriverFormData } from '@/types/transport';

import { validatePhoneNumber } from '../../utils/validateDash';
import FileAttach from '../forms/FileAttach';
import { Button } from '../ui/button';

// ! 수정 모드를 위해 interface로 prop 지정 필요

const DriverForm: React.FC = () => {
  const [formData, setFormData] = useState<DriverFormData>({
    name: '',
    phoneNum: '',
    selectedTeam: [],
    uploadedFiles: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setSubmitError] = useState<string | null>(null);
  const { driverId } = useParams();
  const isEditMode = Boolean(driverId);
  const navigate = useNavigate();

  const updateFormData = (updates: Partial<DriverFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Step 1: Validation
    if (!formData.name.trim() || !formData.phoneNum.trim()) {
      alert('필수 입력창을 모두 입력해주세요.');
      return;
    }

    // Step 2: Validate phone number
    const phoneValidation = validatePhoneNumber(formData.phoneNum);
    if (!phoneValidation.isValid) {
      alert(phoneValidation.message || '전화번호 형식이 올바르지 않습니다.');
      return;
    }

    // Step 3: Set loading state
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Step 4: Call the service
      const result = await transportService.createDriver(formData);

      // Step 5: Handle success
      if (result.driver) {
        console.log('기사 등록 성공:', result.driver);
        alert(`기사 등록이 완료되었습니다. (이름: ${result.driver.name})`);

        // Step 6: Reset form
        setFormData({
          name: '',
          phoneNum: '',
          selectedTeam: [],
          uploadedFiles: [],
        });

        // Step 7: Navigate (optional - adjust route as needed)
        navigate('/transport/driver/info');
      } else {
        // Step 8: Handle error from service
        setSubmitError(result.message || '기사 등록에 실패했습니다.');
        alert(result.message || '기사 등록에 실패했습니다.');
      }
    } catch (error) {
      // Step 9: Handle unexpected errors
      console.error('기사 등록 처리 중 오류:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '기사 등록 중 오류가 발생했습니다.';
      setSubmitError(errorMessage);
      alert(errorMessage);
    } finally {
      // Step 10: Reset loading state
      setIsSubmitting(false);
    }
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

          {/* 파일 첨부 */}
          <FileAttach
            showLabel={true}
            className1="col-span-1"
            className2="col-span-2"
            formData={formData}
            setFormData={(updates) => {
              if (typeof updates === 'function') {
                updateFormData(updates(formData));
              } else {
                updateFormData(updates);
              }
            }}
            objectCategory="driver"
          />

          {/* 팀 선택 */}
          <label className="col-span-1 font-bold">
            팀 선택
            {/* <span className="text-red pr-0"> *</span> */}
          </label>
          <div className="col-span-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="font-bold border border-light-border justify-between w-full md:w-[60%]"
                >
                  <span className="block md:hidden">팀 선택</span>
                  <span className="hidden md:block">팀 선택하기</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {teamList.map((t) => (
                  <DropdownMenuItem
                    key={t.teamName}
                    onSelect={(e) => {
                      e.preventDefault();
                      const teamValue = `${t.category} ${t.teamName}`;
                      setFormData((prev) => ({
                        ...prev,
                        selectedTeam: prev.selectedTeam.includes(teamValue)
                          ? prev.selectedTeam.filter((t) => t !== teamValue)
                          : [...prev.selectedTeam, teamValue],
                      }));
                    }}
                    className="text-base"
                  >
                    <input
                      type="checkbox"
                      className="mr-2 text-base"
                      checked={formData.selectedTeam.includes(
                        `${t.category} ${t.teamName}`
                      )}
                      onChange={(e) => {
                        e.stopPropagation(); // Prevent triggering onSelect
                        const teamValue = `${t.category} ${t.teamName}`;
                        setFormData((prev) => ({
                          ...prev,
                          selectedTeam: prev.selectedTeam.includes(teamValue)
                            ? prev.selectedTeam.filter((t) => t !== teamValue)
                            : [...prev.selectedTeam, teamValue],
                        }));
                      }}
                    />
                    {`${t.category} ${t.teamName}`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="col-span-1"></div>
          <div className="col-span-2 flex flex-wrap items-center">
            {/* 선택된 기사 표시 */}
            {formData.selectedTeam.map((team) => (
              <div key={team} className="flex items-center gap-x-2">
                {team}
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer p-0 hover:bg-white mr-4"
                  onClick={() => {
                    updateFormData({
                      selectedTeam: formData.selectedTeam.filter(
                        (v) => v !== team
                      ),
                    });
                  }}
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
          disabled={isSubmitting}
          className={`bg-light-green hover:bg-green-600 text-white font-semibold px-20 py-2 rounded outline-1 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? '전송 중...' : isEditMode ? '수정 완료' : '작성 완료'}
        </button>
      </div>
    </form>
  );
};

export default DriverForm;
