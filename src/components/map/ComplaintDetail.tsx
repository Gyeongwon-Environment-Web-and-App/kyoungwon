import React, { useEffect, useState } from 'react';

import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useComplaints } from '@/hooks/useComplaints';
import apiClient from '@/lib/api';
import { createStatusChangeHandler } from '@/lib/popupHandlers';
import { complaintService } from '@/services/complaintService';
import { useComplaintTableStore } from '@/stores/complaintTableStore';
import { useMapOverviewStore } from '@/stores/mapOverviewStore';
import type { Complaint } from '@/types/complaint';

import sample from '../../assets/background/sample.jpg';
import food from '../../assets/icons/categories/tags/food.svg';
import general from '../../assets/icons/categories/tags/general.svg';
import other from '../../assets/icons/categories/tags/other.svg';
import recycle from '../../assets/icons/categories/tags/recycle.svg';
import bad from '../../assets/icons/categories/tags/repeat.svg';
import attentionRed from '../../assets/icons/common/attention_red.svg';
import pen from '../../assets/icons/common/pen.png';
import greenCircle from '../../assets/icons/map_card/green_circle.svg';
import pin from '../../assets/icons/map_card/location_pin.svg';
import phone from '../../assets/icons/map_card/phone.svg';
import truck from '../../assets/icons/map_card/truck.svg';
import yellowCircle from '../../assets/icons/map_card/yellow_circle.svg';
import leftArrow from '../../assets/icons/navigation/arrows/gray_arrow_left.svg';
import rightArrow from '../../assets/icons/navigation/arrows/gray_arrow_right.svg';
import Popup from '../forms/Popup';

// Helper function to safely access nested properties
const getPhoneNumber = (complaint: Complaint | null): string | null => {
  return complaint?.source?.phone_no || null;
};

const getFirstUsername = (complaint: Complaint | null): string | null => {
  return complaint?.notify?.usernames?.[0] || null;
};

// Helper function to get category icon
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

const ComplaintDetail: React.FC = () => {
  const { complaintId } = useParams<{ complaintId: string }>();
  const [searchParams] = useSearchParams();
  const [addressFrequency, setAddressFrequency] = useState<number | null>(null);
  const [phoneFrequency, setPhoneFrequency] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  const {
    isPopupOpen,
    selectedComplaintStatus,
    setSelectedComplaintStatus,
    setIsPopupOpen,
    setSelectedComplaintId,
    updateComplaint,
  } = useComplaintTableStore();
  const { selectedComplaintId, selectedComplaint, setSelectedComplaint } =
    useMapOverviewStore();
  const { getComplaintById, isLoading, fetchError } = useComplaints();

  const fetchAddressFrequency = async (address: string) => {
    try {
      const response = await apiClient.post(
        '/complaint/getFrequencyByAddress',
        {
          address: address,
        }
      );
      setAddressFrequency(response.data.count);
    } catch (error) {
      console.log('Complaint Detail 주소 빈도 조회 실패:', error);
      setAddressFrequency(null);
    }
  };

  const fetchPhoneFrequency = async (phoneNo: string) => {
    if (!phoneNo) return;
    try {
      const response = await apiClient.post('/complaint/getFrequencyByPhone', {
        phone_no: phoneNo,
      });
      setPhoneFrequency(response.data.count);
    } catch (error) {
      console.log('Complaint Detail 전화번호 빈도 조회 실패:', error);
      setPhoneFrequency(null);
    }
  };

  const statusChangeHandler = createStatusChangeHandler(
    selectedComplaintId,
    selectedComplaintStatus,
    (id: string, updates: Partial<Complaint>) => {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        console.error('Invalid complaint ID:', id);
        return;
      }
      updateComplaint(numericId, updates);
    },
    () => {
      setIsPopupOpen(false);
      setSelectedComplaintId(null);
      setSelectedComplaintStatus(null);
    },
    async (id: number, status: boolean) => {
      if (selectedComplaint) {
        try {
          // Prepare original complaint data for comparison
          const originalData = {
            phone_no: selectedComplaint.source?.phone_no || '',
            content: selectedComplaint.content || '',
            type: selectedComplaint.type || '',
            route: selectedComplaint.route || '',
            status: selectedComplaint.status,
            presigned_links: selectedComplaint.presigned_links || [],
          };

          await complaintService.updateComplaint(
            id,
            {
              phone_no: selectedComplaint.source?.phone_no || '',
              content: selectedComplaint.content,
              type: selectedComplaint.type,
              route: selectedComplaint.route,
              status: status,
            },
            originalData
          );

          // Force refresh the complaint data immediately after successful update
          const updatedComplaint = await getComplaintById(id.toString());
          setSelectedComplaint(updatedComplaint);
          console.log('상태 업데이트 완료:', updatedComplaint.status);
        } catch (error) {
          console.error(`${id}번 민원 업데이트 실패:`, error);
          throw error;
        }
      }
    }
  );

  // Get the complaint ID from URL params
  const currentComplaintId = complaintId;
  // Get refresh parameter to force refetch after edit
  const refreshParam = searchParams.get('refresh');

  // Fetch complaint data when ID changes or refresh parameter changes
  useEffect(() => {
    if (!currentComplaintId) {
      setSelectedComplaint(null);
      return;
    }

    const fetchComplaint = async () => {
      try {
        // Clear any cached data first
        setSelectedComplaint(null);
        const complaint = await getComplaintById(currentComplaintId);
        console.log('ComplaintDetail - Fetched complaint data:', complaint);
        setSelectedComplaint(complaint);

        // Remove refresh parameter from URL after successful fetch
        if (refreshParam) {
          navigate(`/map/overview/complaints/${currentComplaintId}`, {
            replace: true,
          });
        }
      } catch (error) {
        console.error('Failed to fetch complaint:', error);
      }
    };

    // Always fetch fresh data, don't rely on cached data
    fetchComplaint();
  }, [
    currentComplaintId,
    refreshParam,
    getComplaintById,
    navigate,
    setSelectedComplaint,
  ]);

  useEffect(() => {
    if (!isPopupOpen && currentComplaintId) {
      console.log('팝업이 닫혔습니다. 민원 데이터를 새로고침합니다.');
      const refreshComplaint = async () => {
        try {
          const updatedComplaint = await getComplaintById(currentComplaintId);
          setSelectedComplaint(updatedComplaint);
        } catch (error) {
          console.error('민원 상태 업데이트&새로고침 실패:', error);
        }
      };
      refreshComplaint();
    }
  }, [isPopupOpen, currentComplaintId, getComplaintById, setSelectedComplaint]);

  useEffect(() => {
    if (selectedComplaint) {
      // setFrequencyLoading(true);
      fetchAddressFrequency(selectedComplaint.address.address);

      const phoneNo = selectedComplaint.source?.phone_no;
      if (phoneNo) {
        fetchPhoneFrequency(phoneNo);
      }

      // Reset image index when complaint changes
      setCurrentImageIndex(0);

      // setFrequencyLoading(false);
    }
  }, [selectedComplaint]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-600">로딩 중...</span>
        </div>
      </div>
    );
  }

  if (fetchError) {
    console.log('Complaint Detail Error: ', fetchError);

    return (
      <div className="">
        <header className="w-full flex items-center">
          <button
            className="flex text-xl font-semibold text-gray-900 px-2 gap-1"
            onClick={() => navigate('/map/overview/complaints')}
          >
            <img src={leftArrow} alt="왼쪽 화살표" />
            민원 목록
          </button>
        </header>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 text-sm">{fetchError}</div>
          </div>
        </div>
        <footer className="absolute bottom-2 right-1 w-full flex justify-end items-center">
          <button
            className="flex text-lg font-semibold text-gray-900 px-2 gap-1"
            onClick={() => navigate('/complaints/table')}
          >
            민원 내역 / 관리로 돌아가기
            <img src={rightArrow} alt="오른쪽 화살표" />
          </button>
        </footer>
      </div>
    );
  }

  if (!selectedComplaint) {
    console.log('no selected complaint');
  }

  return (
    <div className="w-full">
      {/* Status Change Popup */}
      {isPopupOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsPopupOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
            <Popup
              message={statusChangeHandler.getMessage()}
              yesNo={true}
              onFirstClick={statusChangeHandler.onConfirm}
              onSecondClick={statusChangeHandler.onCancel}
              toHome={false}
            />
          </div>
        </div>
      )}
      {/* Header */}
      <header className="w-full flex items-center">
        <button
          className="flex text-xl font-semibold text-gray-900 px-0 md:px-2 gap-1"
          onClick={() => navigate('/map/overview/complaints')}
        >
          <img src={leftArrow} alt="왼쪽 화살표" />
          민원 목록
        </button>
      </header>

      {/* Complaint Details */}
      <div className="p-2 py-0 md:p-4 md:py-2">
        <div className="relative mb-3 md:mb-6">
          <img
            src={
              selectedComplaint?.presigned_links &&
              selectedComplaint.presigned_links.length > 0
                ? selectedComplaint.presigned_links[currentImageIndex]?.url ||
                  sample
                : sample
            }
            alt="민원 이미지"
            className="rounded-sm w-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const presignedUrl =
                selectedComplaint?.presigned_links?.[currentImageIndex]?.url;
              const currentSrc = target.src;

              if (presignedUrl && currentSrc === presignedUrl) {
                target.src = sample;
              }
            }}
          />
          {selectedComplaint?.presigned_links &&
            selectedComplaint.presigned_links.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-1.5 md:p-2 transition-all"
                  onClick={() => {
                    setCurrentImageIndex((prev) =>
                      prev > 0
                        ? prev - 1
                        : selectedComplaint.presigned_links.length - 1
                    );
                  }}
                  aria-label="이전 이미지"
                >
                  <img
                    src={leftArrow}
                    alt="이전 이미지"
                    className="w-4 h-4 md:w-5 md:h-5"
                  />
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-1.5 md:p-2 transition-all"
                  onClick={() => {
                    setCurrentImageIndex((prev) =>
                      prev < selectedComplaint.presigned_links.length - 1
                        ? prev + 1
                        : 0
                    );
                  }}
                  aria-label="다음 이미지"
                >
                  <img
                    src={rightArrow}
                    alt="다음 이미지"
                    className="w-4 h-4 md:w-5 md:h-5"
                  />
                </button>
              </>
            )}
        </div>
        <div className="space-y-1 md:space-y-2">
          <div className="flex gap-2 items-center">
            <div className="flex gap-1">
              {(() => {
                // Get all unique categories from teams
                const teamCategories =
                  selectedComplaint?.teams
                    ?.map((team) => team.category)
                    ?.filter(
                      (category, index, array) =>
                        array.indexOf(category) === index
                    ) // Remove duplicates
                    ?.filter((category) => category !== 'manager') || [];

                return teamCategories?.map((category, index) => {
                  return (
                    <img
                      key={index}
                      src={getCategoryIcon(category)}
                      alt={`${category} 카테고리`}
                      className="w-14 h-6"
                    />
                  );
                });
              })()}
              {selectedComplaint?.source.bad ? (
                <img src={bad} alt="반복민원 태그" className="w-14 md:w-16" />
              ) : (
                ''
              )}
            </div>
            <p className="text-xl font-semibold truncate">
              {selectedComplaint?.content ||
                `${selectedComplaint?.address?.address?.slice(7)} 민원`}
            </p>
            <button
              className="flex p-0 w-[3.2rem]"
              onClick={() => {
                if (selectedComplaint) {
                  navigate(`/complaints/edit/${selectedComplaint.id}`);
                }
              }}
            >
              <img src={pen} alt="수정버튼" />
            </button>
          </div>
          <p className="text-sm md:text-base text-[#7C7C7C] font-semibold">
            {selectedComplaint?.datetime
              ? new Date(selectedComplaint.datetime).toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              : '날짜 정보 없음'}
          </p>

          <div className="flex gap-1 md:gap-2 items-center">
            <img src={pin} alt="주소 핀" className="w-4 md:w-5 h-4 md:h-5" />
            <label className="text-base md:text-lg font-semibold">
              {selectedComplaint?.address?.address || '주소 정보 없음'}
            </label>
          </div>

          {addressFrequency !== null && addressFrequency > 0 && (
            <div className="pt-0">
              <div className="flex items-center gap-2">
                <img src={attentionRed} alt="경고 아이콘" className="w-4 h-4" />
                <label className="text-sm md:text-base font-semibold text-red">
                  최근 한 달간 이 주소에서 민원이 {addressFrequency}번
                  들어왔습니다.
                </label>
              </div>
            </div>
          )}

          <div className="flex gap-1 md:gap-2 items-center">
            <img src={phone} alt="전화" className="w-4 md:w-5 h-4 md:h-5" />
            <label className="text-base md:text-lg font-semibold">
              {selectedComplaint?.teams[0]?.team_nm || '담당부서'} (
              {selectedComplaint?.user.phone_no ||
                getPhoneNumber(selectedComplaint) ||
                '연락처 없음'}
              )
            </label>
          </div>

          {phoneFrequency !== null && phoneFrequency > 0 && (
            <div className="pt-0">
              <div className="flex items-center gap-2">
                <img src={attentionRed} alt="경고 아이콘" className="w-4 h-4" />
                <label className="text-sm md:text-base font-semibold text-red">
                  최근 한 달간 이 전화번호에서 민원이 {phoneFrequency}번
                  들어왔습니다.
                </label>
              </div>
            </div>
          )}

          <div className="flex gap-1 md:gap-2 items-center">
            <img
              src={selectedComplaint?.status ? greenCircle : yellowCircle}
              alt="상태"
              className="w-3 h-3 md:w-4 md:h-4 mx-0.5"
            />
            <label className="text-base md:text-lg font-semibold">
              {selectedComplaint?.status === true
                ? '민원 처리 완료'
                : '민원 처리 중'}
            </label>
            <button
              className="text-[#0009FF] p-0 ml-1 text-sm md:text-base"
              onClick={() => {
                if (selectedComplaint) {
                  setSelectedComplaintId(selectedComplaint.id.toString());
                  setSelectedComplaintStatus(selectedComplaint.status);
                  setIsPopupOpen(true);
                }
              }}
            >
              상태수정
            </button>
          </div>

          <div className="flex gap-1 md:gap-2 items-center">
            <img src={truck} alt="차량" className="w-4 md:w-5 h-4 md:h-5" />
            <label className="text-base md:text-lg font-semibold">
              {selectedComplaint?.teams[0]?.drivers[0]?.name ||
                getFirstUsername(selectedComplaint) ||
                '담당자 정보 없음'}
            </label>
            <p className="text-sm md:text-base font-semibold text-[#7C7C7C]">
              {selectedComplaint?.status ? '수거 완료' : '차량 수거 중'}
            </p>
            <button
              className="text-[#0009FF] p-0 text-sm md:text-base"
              onClick={() => window.alert('아직 개발 중입니다!')}
            >
              동선 조회
            </button>
          </div>

          <div className="pt-2 md:pt-5">
            <label className="text-base md:text-lg font-semibold">
              민원 내용
            </label>
            <div className="mt-2 p-3 rounded-lg bg-ebebeb h-32 xs:h-48 md:h-40">
              <p className="text-sm whitespace-pre-wrap">
                {selectedComplaint?.content || '민원 내용이 없습니다.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
