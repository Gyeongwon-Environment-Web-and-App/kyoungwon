import React, { useEffect, useState } from 'react';

import { ChevronDown, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDrivers } from '@/hooks/useDrivers';
import { useVehicles } from '@/hooks/useVehicles';
import { transportService } from '@/services/transportService';
import type { TeamFormData } from '@/types/transport';
import { computeDiffWithMapping } from '@/utils/computeDiff';

import { Button } from '../ui/button';

interface TeamFormProps {
  onSubmit?: () => void;
}

const TeamForm: React.FC<TeamFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<TeamFormData>({
    category: '',
    teamName: '',
    regions: [],
    selectedVehicles: [],
    selectedDrivers: [],
  });
  const [originalData, setOriginalData] = useState<TeamFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setSubmitError] = useState<string | null>(null);
  const { teamId } = useParams();
  const isEditMode = Boolean(teamId);
  const navigate = useNavigate();

  const {
    vehicles: vehicleList,
    isLoading: vehiclesLoading,
    fetchError: vehiclesError,
  } = useVehicles();
  const {
    drivers: driverList,
    isLoading: driversLoading,
    fetchError: driversError,
  } = useDrivers();

  // Fetch team data when in edit mode
  useEffect(() => {
    const loadTeamData = async () => {
      if (!teamId) return;

      try {
        setIsLoading(true);
        const response = await transportService.getTeamById(Number(teamId));

        if (response.team && response.team.id) {
          // Map API response to form data
          const loadedData: TeamFormData = {
            category: response.team.category || '',
            teamName: response.team.team_nm || '',
            regions: response.team.official_regions || [],
            selectedVehicles: response.team.trucks || [],
            selectedDrivers: response.team.drivers.map((d) => d.name) || [],
          };
          setFormData(loadedData);
          // Store original data for diff comparison
          setOriginalData(loadedData);
        } else {
          alert(response.message || '팀 정보를 불러올 수 없습니다.');
          navigate('/transport/team/info');
        }
      } catch (error) {
        console.error('팀 정보 불러오기 실패:', error);
        alert('팀 정보를 불러오는 중 오류가 발생했습니다.');
        navigate('/transport/team/info');
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamData();
  }, [teamId, navigate]);

  const updateFormData = (updates: Partial<TeamFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Step 1: Validation
    if (
      !formData.category.trim() ||
      !formData.teamName.trim() ||
      formData.regions.length < 1
    ) {
      alert('필수 입력창을 모두 입력해주세요.');
      return;
    }

    // Step 2: Set loading state
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Step 3: Call the service (create or update based on mode)
      if (isEditMode && teamId && originalData) {
        // Compute diff to only send changed fields
        const fieldMap = {
          category: 'category',
          teamName: 'team_nm',
          regions: 'official_region_nms',
          selectedVehicles: 'truck_nos',
          selectedDrivers: 'driver_nms',
        } as const;

        const changes = computeDiffWithMapping<
          TeamFormData,
          import('@/services/transportService').UpdateTeamApiRequest
        >(originalData, formData, fieldMap);

        // Only proceed if there are changes
        if (Object.keys(changes).length === 0) {
          alert('변경된 내용이 없습니다.');
          setIsSubmitting(false);
          return;
        }

        console.log('🔵 TeamForm - Update Request Payload:', {
          teamId: Number(teamId),
          changes,
        });

        const result = await transportService.updateTeam(
          Number(teamId),
          changes
        );

        // Step 4: Handle success
        if (result.message) {
          console.log('팀 수정 성공:', result.message);

          // Call onSubmit callback if provided (for popup)
          if (onSubmit) {
            onSubmit();
          } else {
            alert(result.message || '팀 수정이 완료되었습니다.');
            navigate('/transport/team/info');
          }
        } else {
          // Step 6: Handle error from service
          setSubmitError(result.message || '팀 수정에 실패했습니다.');
          alert(result.message || '팀 수정에 실패했습니다.');
        }
      } else {
        const result = await transportService.createTeam(formData);

        // Step 4: Handle success
        if (result.team) {
          console.log('팀 등록 성공:', result.team);

          // Step 5: Reset form
          setFormData({
            category: '',
            teamName: '',
            regions: [],
            selectedVehicles: [],
            selectedDrivers: [],
          });

          // Call onSubmit callback if provided (for popup)
          if (onSubmit) {
            onSubmit();
          } else {
            alert(`팀 등록이 완료되었습니다. (팀명: ${result.team.team_nm})`);
            navigate('/transport/team/info');
          }
        } else {
          // Step 7: Handle error from service
          setSubmitError(result.message || '팀 등록에 실패했습니다.');
          alert(result.message || '팀 등록에 실패했습니다.');
        }
      }
    } catch (error) {
      // Step 8: Handle unexpected errors
      console.error(
        isEditMode ? '팀 수정 처리 중 오류:' : '팀 등록 처리 중 오류:',
        error
      );
      const errorMessage =
        error instanceof Error
          ? error.message
          : isEditMode
            ? '팀 수정 중 오류가 발생했습니다.'
            : '팀 등록 중 오류가 발생했습니다.';
      setSubmitError(errorMessage);
      alert(errorMessage);
    } finally {
      // Step 9: Reset loading state
      setIsSubmitting(false);
    }
  };

  const toggleRegions = (area: string) => {
    const isSelected = formData.regions.includes(area);
    updateFormData({
      regions: isSelected
        ? formData.regions.filter((a) => a !== area)
        : [...formData.regions, area],
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">팀 정보를 불러오는 중...</p>
      </div>
    );
  }

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
                    ${formData.regions.includes(label) ? 'bg-lighter-green' : ''}
                    ${idx === 0 ? 'rounded-l' : ''}
                    ${idx === arr.length - 1 ? 'rounded-r' : ''}
                  `}
                    style={{
                      borderRight:
                        idx !== arr.length - 1 ? '1px solid #ACACAC' : 'none',
                    }}
                    onClick={() => toggleRegions(label)}
                  >
                    <input
                      type="checkbox"
                      checked={formData.regions.includes(label)}
                      onChange={() => toggleRegions(label)}
                      className="mr-2 w-4 h-4 cursor-pointer hidden md:block"
                    />
                    {label}
                  </button>
                )
              )}
            </div>
            <div
              className={`flex text-sm border border-light-border rounded w-[50%]`}
            >
              {['방학1동', '방학2동'].map((label, idx, arr) => (
                <button
                  key={label}
                  type="button"
                  className={`
                    flex-1 flex items-center justify-center px-2 md:px-4 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${formData.regions.includes(label) ? 'bg-lighter-green' : ''}
                    ${idx === 0 ? 'rounded-l' : ''}
                    ${idx === arr.length - 1 ? 'rounded-r' : ''}
                  `}
                  style={{
                    borderRight:
                      idx !== arr.length - 1 ? '1px solid #ACACAC' : 'none',
                  }}
                  onClick={() => toggleRegions(label)}
                >
                  <input
                    type="checkbox"
                    checked={formData.regions.includes(label)}
                    onChange={() => toggleRegions(label)}
                    className="mr-2 w-4 h-4 cursor-pointer hidden md:block"
                  />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 차량 선택 */}
          <label className="col-span-1 font-bold">
            차량 선택
            {/* <span className="text-red pr-0"> *</span> */}
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
                {vehiclesLoading ? (
                  <DropdownMenuItem
                    disabled
                    className="text-base text-gray-500"
                  >
                    차량 정보 불러오는 중...
                  </DropdownMenuItem>
                ) : vehiclesError ? (
                  <DropdownMenuItem disabled className="text-base text-red-500">
                    오류가 발생했습니다.
                  </DropdownMenuItem>
                ) : vehicleList.length === 0 ? (
                  <DropdownMenuItem
                    disabled
                    className="text-base text-gray-500"
                  >
                    차량 정보가 없습니다.
                  </DropdownMenuItem>
                ) : (
                  vehicleList.map((v) => (
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
                        checked={formData.selectedVehicles.includes(
                          v.vehicleNum
                        )}
                        onChange={(e) => {
                          e.stopPropagation();
                          const id = v.vehicleNum;
                          const exists = formData.selectedVehicles.includes(id);
                          updateFormData({
                            selectedVehicles: exists
                              ? formData.selectedVehicles.filter(
                                  (x) => x !== id
                                )
                              : [...formData.selectedVehicles, id],
                          });
                        }}
                      />
                      {v.vehicleType} - {v.vehicleNum}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {formData.selectedVehicles.length > 0 && (
            <>
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
            </>
          )}

          {/* 기사 선택 */}
          <label className="col-span-1 font-bold">
            기사 선택
            {/* <span className="text-red pr-0"> *</span> */}
          </label>
          <div className="col-span-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="font-bold border border-light-border justify-between w-full md:w-[60%]"
                >
                  <span className="block md:hidden">기사</span>
                  <span className="hidden md:block">기사 선택하기</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {driversLoading ? (
                  <DropdownMenuItem
                    disabled
                    className="text-base text-gray-500"
                  >
                    기사 정보 불러오는 중...
                  </DropdownMenuItem>
                ) : driversError ? (
                  <DropdownMenuItem disabled className="text-base text-red-500">
                    오류가 발생했습니다.
                  </DropdownMenuItem>
                ) : driverList.length === 0 ? (
                  <DropdownMenuItem
                    disabled
                    className="text-base text-gray-500"
                  >
                    기사 정보가 없습니다.
                  </DropdownMenuItem>
                ) : (
                  driverList.map((d) => (
                    <DropdownMenuItem
                      key={d.name}
                      onSelect={(e) => {
                        e.preventDefault();
                        const driverName = d.name;
                        setFormData((prev) => ({
                          ...prev,
                          selectedDrivers: prev.selectedDrivers.includes(d.name)
                            ? prev.selectedDrivers.filter(
                                (d) => d !== driverName
                              )
                            : [...prev.selectedDrivers, driverName],
                        }));
                      }}
                      className="text-base"
                    >
                      <input
                        type="checkbox"
                        className="mr-2 text-base"
                        checked={formData.selectedDrivers.includes(`${d.name}`)}
                        onChange={(e) => {
                          e.stopPropagation();
                          const driverName = d.name;
                          setFormData((prev) => ({
                            ...prev,
                            selectedDrivers: prev.selectedDrivers.includes(
                              d.name
                            )
                              ? prev.selectedDrivers.filter(
                                  (d) => d !== driverName
                                )
                              : [...prev.selectedDrivers, driverName],
                          }));
                        }}
                      />
                      {`${d.name}`}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {formData.selectedDrivers.length > 0 && (
            <>
              <div className="col-span-1"></div>
              <div className="col-span-2 flex flex-wrap items-center">
                {/* 선택된 기사 표시 */}
                {formData.selectedDrivers.map((driver) => (
                  <div key={driver} className="flex items-center gap-x-2">
                    {driver}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer p-0 hover:bg-white mr-4"
                      onClick={() => {
                        updateFormData({
                          selectedDrivers: formData.selectedDrivers.filter(
                            (d) => d !== driver
                          ),
                        });
                      }}
                    >
                      <X className="h-4 w-4 text-red" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
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

export default TeamForm;
