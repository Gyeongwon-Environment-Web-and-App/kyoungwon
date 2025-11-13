import React, { useEffect, useRef, useState } from 'react';

import attention from '../../assets/icons/common/attention.svg';
import attentionRed from '../../assets/icons/common/attention_red.svg';
import underArrow from '../../assets/icons/navigation/arrows/under_arrow.svg';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../lib/api';
import { AddressService } from '../../services/addressService';
import { useComplaintFormStore } from '../../stores/complaintFormStore';
import { useComplaintFormUIStore } from '../../stores/complaintFormUIStore';
import FileAttach from '../forms/FileAttach';
import AdvancedKakaoMap from '../map/AdvancedKakaoMap';

interface ComplaintFormProps {
  dateTimeBox: React.ReactNode;
  onSubmit: () => void;
}

export default function ComplaintForm({
  dateTimeBox,
  onSubmit,
}: ComplaintFormProps) {
  // Get state and actions from Zustand store
  const {
    formData,
    showAddressSearch,
    addresses,
    loading,
    error,
    tempAddress,
    updateFormData,
    fetchDriverData,
    setShowAddressSearch,
    setAddresses,
    setLoading,
    setError,
    setTempAddress,
  } = useComplaintFormStore();

  // Local state for frequency data
  const [addressFrequencyInfo, setAddressFrequencyInfo] = useState<
    number | null
  >(null);
  const [phoneFrequencyInfo, setPhoneFrequencyInfo] = useState<number | null>(
    null
  );

  // Get UI state and actions from Zustand store
  const {
    focus,
    showMap,
    mapCoordinates,
    resetMapCenter,
    setFocus,
    setShowMap,
    setMapCoordinates,
    setResetMapCenter,
  } = useComplaintFormUIStore();

  // Local timeout management for frequency fetching
  const [frequencyTimeout, setFrequencyTimeout] =
    useState<NodeJS.Timeout | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const mapDropdownRef = useRef<HTMLDivElement>(null);

  // Ensure formData.categories is initialized
  useEffect(() => {
    if (!formData.categories) {
      updateFormData({ categories: [] });
    }
  }, [formData.categories]);

  // formData.address가 변경될 때 tempAddress 동기화
  useEffect(() => {
    setTempAddress(formData.address);
  }, [formData.address]);

  // 드라이버 데이터 가져오기 - 주소와 카테고리가 모두 있을 때
  useEffect(() => {
    const shouldFetchDriverData =
      formData.address && formData.categories && formData.categories.length > 0;

    if (shouldFetchDriverData) {
      fetchDriverData(formData.address, formData.categories);
    }
  }, [formData.address, formData.categories]);

  // Reset map center flag after it's been used (simplified)
  useEffect(() => {
    if (resetMapCenter) {
      // Reset the flag after a short delay to allow MapComponent to process it
      const timer = setTimeout(() => {
        setResetMapCenter(false);
      }, 200); // Longer delay to prevent conflicts
      return () => clearTimeout(timer);
    }
  }, [resetMapCenter, setResetMapCenter]);

  // 주소 검색 기능
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 주소 검색 드롭다운 외부 클릭 처리
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // 로딩 중이거나 에러가 있을 때는 드롭다운을 유지
        if (!loading && !error) {
          setShowAddressSearch(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [loading, error, setShowAddressSearch]);

  // 주소 검색 함수
  const searchAddresses = async () => {
    if (!tempAddress.trim() || tempAddress.length < 2) {
      setAddresses([]);
      setError('주소를 2글자 이상 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setShowAddressSearch(true);

    try {
      // 주소와 장소명을 모두 검색하는 통합 메서드 사용
      const results = await AddressService.searchAddressAndPlace(tempAddress);
      setAddresses(results);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '주소 검색에 실패했습니다.';

      // 더 친화적인 에러 메시지로 변환
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes('검색 시간이 초과되었습니다')) {
        userFriendlyMessage = '검색 시간이 초과되었습니다. 다시 시도해주세요.';
      } else if (errorMessage.includes('API 키가 유효하지 않습니다')) {
        userFriendlyMessage =
          'API 설정에 문제가 있습니다. 관리자에게 문의해주세요.';
      } else if (errorMessage.includes('API 호출 한도를 초과했습니다')) {
        userFriendlyMessage =
          '일일 검색 한도를 초과했습니다. 내일 다시 시도해주세요.';
      } else if (errorMessage.includes('잘못된 요청입니다')) {
        userFriendlyMessage = '검색어를 확인해주세요. (예: 시루봉로200길)';
      }

      setError(userFriendlyMessage);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  // useAuth 훅 사용 (인증 상태 확인용)
  useAuth();

  const handleAddressSelect = (address: {
    roadAddress: string;
    jibunAddress: string;
    englishAddress: string;
    x: string;
    y: string;
    name?: string;
  }) => {
    const selectedAddress = address.roadAddress || address.jibunAddress;
    updateFormData({ address: selectedAddress });

    // Reset map center for new address
    setResetMapCenter(true);

    if (frequencyTimeout) {
      clearTimeout(frequencyTimeout);
    }

    const newTimeout = setTimeout(async () => {
      try {
        // First try path parameter
        const response = await apiClient.post(
          `/complaint/getFrequencyByAddress`,
          { address: selectedAddress }
        );
        setAddressFrequencyInfo(response.data.count);
        console.log('주소 빈도 정보: ', response.data);
      } catch (error) {
        console.log('주소 빈도 정보 조회 실패: ', error);
        setAddressFrequencyInfo(null);
      }
    }, 1000);

    setFrequencyTimeout(newTimeout);
  };

  const handlePhoneClick = (phone_no: string) => {
    setTimeout(async () => {
      try {
        const response = await apiClient.post(
          `/complaint/getFrequencyByPhone`,
          { phone: phone_no }
        );
        setPhoneFrequencyInfo(response.data.count);
        console.log('전화번호 빈도 정보: ', response.data);
      } catch (error) {
        console.log('전화번호 빈도 정보 조회 실패: ', error);
        setPhoneFrequencyInfo(null);
      }
    }, 1000);
  };

  // 지도 토글 함수
  const toggleMap = async () => {
    // 지도가 열려있으면 닫기
    if (showMap) {
      setShowMap(false);
      return;
    }

    // 지도가 닫혀있으면 열기
    if (!formData.address.trim()) {
      alert('먼저 주소를 입력해주세요.');
      return;
    }

    // 이미 좌표 정보가 있으면 바로 지도 표시
    if (formData.coordinates) {
      setMapCoordinates(formData.coordinates);
      setShowMap(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await AddressService.searchAddress(formData.address);

      if (results && results.length > 0) {
        const firstResult = results[0];
        const latitude = parseFloat(firstResult.y);
        const longitude = parseFloat(firstResult.x);

        if (!isNaN(latitude) && !isNaN(longitude)) {
          const coordinates = { latitude, longitude };
          setMapCoordinates(coordinates);
          updateFormData({ coordinates });
          setShowMap(true);
        } else {
          setError('주소의 좌표 정보를 가져올 수 없습니다.');
        }
      } else {
        setError('입력한 주소를 찾을 수 없습니다. 주소를 다시 확인해주세요.');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '주소 검색에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.address.trim() ||
      !formData.route.trim() ||
      !formData.categories ||
      formData.categories.length === 0
    ) {
      window.alert(
        '필수 입력 정보를 작성해주세요. (민원 발생 주소, 민원 접수 경로, 민원 종류)'
      );
      return;
    }
    onSubmit();
  };

  const getSourceData = () => {
    if (!formData.source) {
      return { phone_no: '', bad: false };
    }
    return formData.source;
  };

  return (
    <div className="overflow-y-auto overflow-x-hidden max-w-screen w-full">
      <form className="md:border md:border-light-border rounded-[15px]">
        <div className="mt-0">{dateTimeBox}</div>
        <div className="max-w-4xl md:mx-10 md:my-10 my-2 grid grid-cols-3 md:grid-cols-[150px_1fr_1fr_1fr_150px] gap-x-1 md:gap-x-4 gap-y-3 md:gap-y-0 items-start md:items-center text-sm">
          {/* 민원 발생 주소 */}
          <label
            htmlFor="address"
            className="md:col-span-1 col-span-3 font-bold md:text-[1rem] text-base md:mb-1 -mb-3"
          >
            민원 발생 주소
            <span className="text-red pr-0"> *</span>
          </label>
          <div className="block md:hidden col-span-2"></div>

          <div className="col-span-2 md:col-span-3 relative">
            <input
              tabIndex={1}
              type="text"
              id="address"
              autoComplete="off"
              className={`border px-3 py-2 rounded w-full ${
                error ? 'border-red-500' : 'border-light-border'
              }`}
              value={tempAddress}
              onChange={(e) => {
                setTempAddress(e.target.value);
                // 입력 시 에러 상태 초기화
                if (error) setError(null);
                // 드롭다운 숨기기
                setShowAddressSearch(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // 임시 주소를 실제 주소로 업데이트
                  updateFormData({ address: tempAddress });
                  searchAddresses();
                }
              }}
              onBlur={() => {
                // 포커스를 잃을 때도 임시 주소를 실제 주소로 업데이트
                updateFormData({ address: tempAddress });
              }}
              placeholder="주소 또는 장소명을 입력하세요"
            />

            {/* 주소 검색 드롭다운 */}
            {showAddressSearch && (
              <div
                ref={dropdownRef}
                className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                style={{ top: '100%', left: 0 }}
              >
                {loading && (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mx-auto mb-2"></div>
                    검색 중... (최대 3초)
                  </div>
                )}

                {!loading && !error && addresses.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    <svg
                      className="w-5 h-5 mx-auto mb-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                    검색 결과가 없습니다.
                    <br />
                    <span className="text-xs">다른 키워드로 검색해보세요.</span>
                  </div>
                )}

                {!loading &&
                  !error &&
                  addresses.length > 0 &&
                  addresses.map((address, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                      onClick={() => {
                        handleAddressSelect(address);

                        // 좌표 정보도 저장
                        const latitude = parseFloat(address.y);
                        const longitude = parseFloat(address.x);
                        if (!isNaN(latitude) && !isNaN(longitude)) {
                          setMapCoordinates({ latitude, longitude });
                          updateFormData({
                            coordinates: { latitude, longitude },
                          });
                        }

                        setShowAddressSearch(false);
                      }}
                    >
                      <div className="font-medium text-sm text-gray-900">
                        {address.roadAddress || address.jibunAddress}
                      </div>
                      {address.jibunAddress &&
                        address.roadAddress !== address.jibunAddress && (
                          <div className="text-xs text-gray-500 mt-1">
                            {address.jibunAddress}
                          </div>
                        )}
                      {address.name && (
                        <div className="text-xs text-blue-600 mt-1 font-medium">
                          📍 {address.name}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
          <button
            type="button"
            className="col-span-1 border border-light-border px-4 py-2 rounded w-full font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onClick={searchAddresses}
            tabIndex={2}
          >
            주소 찾기
          </button>

          {/* 지도 확인 */}
          <div className="hidden md:block md:col-span-1"></div>
          <div
            className="md:col-span-4 col-span-3 relative"
            ref={mapDropdownRef}
          >
            <button
              type="button"
              className={`w-full text-left font-bold ${showMap ? 'bg-white border-light-border rounded-t border-b-0' : 'bg-lighter-green border-light-green rounded'} border px-4 -mt-1 md:mt-2 flex`}
              onClick={toggleMap}
              disabled={loading}
              tabIndex={3}
            >
              {loading
                ? '위치 확인 중...'
                : showMap
                  ? '클릭해서 지도 접기'
                  : '지도에서 민원 위치 확인하기'}
              <img
                src={underArrow}
                alt="아래방향 화살표"
                className={`pl-2 w-6 h-5 transition-transform ${showMap ? 'rotate-180 ml-2' : ''}`}
              />
            </button>

            {/* 드롭다운 지도 컴포넌트 */}
            <AdvancedKakaoMap
              latitude={mapCoordinates?.latitude}
              longitude={mapCoordinates?.longitude}
              address={formData.address}
              isVisible={showMap}
              resetCenter={resetMapCenter}
              className="w-full rounded-b-lg"
              style={{ height: '300px' }}
            />
          </div>

          {addressFrequencyInfo !== null && addressFrequencyInfo > 0 && (
            <>
              <div className="col-span-1"></div>
              <div className="text-red col-span-2 flex justify-start items-center md:mt-2 md:mb-2">
                최근 한 달간 이 주소에서 민원이 {addressFrequencyInfo}번
                들어왔습니다.
              </div>
              <div className="col-span-2"></div>
            </>
          )}

          {!loading && error && (
            <>
              <div className="hidden md:block md:col-span-1"></div>
              <div className="text-red col-span-2 flex justify-start items-center md:mt-2 md:mb-2">
                <img
                  src={attentionRed}
                  alt="경고 아이콘"
                  className="w-5 h-5 mr-1"
                />
                {error}
              </div>
              <div className="md:col-span-2"></div>
            </>
          )}

          {/* 민원 접수 경로 */}
          <label
            className={`md:col-span-1 col-span-3 font-bold text-[1rem] pt-5 ${formData.route !== '경원환경' ? 'md:mb-5' : ''}`}
          >
            민원 접수 경로
            <span className="text-red pr-0"> *</span>
          </label>
          <div
            className={`flex col-span-3 md:mt-5 text-[0.73rem] md:text-sm border border-light-border rounded ${formData.route !== '경원환경' ? 'md:mb-5' : ''}`}
          >
            {['경원환경', '120', '구청', '주민센터'].map((label, idx, arr) => (
              <button
                tabIndex={idx + 4}
                key={label}
                type="button"
                className={`
                  flex-1 px-4 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${formData.route === label ? 'bg-lighter-green' : ''}
                  ${idx === 0 ? 'rounded-l' : ''}
                  ${idx === arr.length - 1 ? 'rounded-r' : ''}
                `}
                style={{
                  borderRight:
                    idx !== arr.length - 1 ? '1px solid #ACACAC' : 'none',
                }}
                onClick={() => updateFormData({ route: label })}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder={focus.routeInput ? '' : '직접 입력'}
            className={`md:col-span-1 col-span-3 border border-light-border px-3 py-2 mb-3 md:mb-0 md:mt-5 rounded w-full md:text-center text-left font-bold ${formData.route !== '경원환경' ? 'md:mb-5' : ''}`}
            value={
              !['경원환경', '다산콜(120)', '구청', '주민센터'].includes(
                formData.route
              )
                ? formData.route
                : ''
            }
            onChange={(e) => updateFormData({ route: e.target.value })}
            onFocus={() => setFocus({ routeInput: true })}
            onBlur={() => setFocus({ routeInput: false })}
            onClick={() => updateFormData({ route: '' })}
          />

          {/* 직접 전화번호 입력 - 데스크톱에서만 표시 */}
          {formData.route === '경원환경' && (
            <>
              <div className="hidden md:block md:col-span-1"></div>
              <input
                tabIndex={8}
                id="경원환경 직접 전화번호 입력"
                type="text"
                value={formData.source.phone_no}
                className="hidden md:block md:col-span-4 w-full text-left font-bold border border-light-border px-4 md:py-2 md:mt-2 md:mb-5 rounded"
                placeholder="전화번호 입력 (숫자만)"
                onChange={(e) =>
                  updateFormData({
                    source: { ...formData.source, phone_no: e.target.value },
                  })
                }
                onClick={() => {
                  handlePhoneClick(formData.source.phone_no);
                }}
              />
            </>
          )}

          {phoneFrequencyInfo !== null && phoneFrequencyInfo > 0 && (
            <>
              <div className="col-span-1"></div>
              <div className="text-red col-span-2 flex justify-start items-center -mt-3 mb-1">
                최근 한 달간 이 전화번호에서 민원이 {phoneFrequencyInfo}번
                들어왔습니다.
              </div>
              <div className="col-span-2"></div>
            </>
          )}

          {/* 민원 종류 선택 */}
          <label className="md:col-span-1 col-span-3 font-bold text-[1rem] md:py-5 py-0">
            민원 종류 선택
            <span className="text-red pr-0"> *</span>
          </label>
          <div
            className={`flex col-span-3 md:my-5 text-[0.73rem] md:text-sm border border-light-border rounded`}
          >
            {['재활용', '생활', '음식물', '기타'].map((label, idx, arr) => (
              <button
                tabIndex={idx + 9}
                key={label}
                type="button"
                className={`
                  flex-1 px-4 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${formData.categories && formData.categories.includes(label) ? 'bg-lighter-green' : ''}
                  ${idx === 0 ? 'rounded-l' : ''}
                  ${idx === arr.length - 1 ? 'rounded-r' : ''}
                `}
                style={{
                  borderRight:
                    idx !== arr.length - 1 ? '1px solid #ACACAC' : 'none',
                }}
                onClick={() => {
                  const currentCategories = formData.categories || [];
                  const newCategories = currentCategories.includes(label)
                    ? currentCategories.filter((cat) => cat !== label)
                    : [...currentCategories, label];
                  updateFormData({ categories: newCategories });
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="md:col-span-1 col-span-3"></div>
          {/* //! 쓰레기 상성 직접 작성 가능할 시 */}
          {/* <input
            type="text"
            value={
              !['재활용', '생활', '음식물', '기타'].includes(
                formData.categories && formData.categories[0]
                  ? formData.categories[0]
                  : ''
              )
                ? formData.categories && formData.categories[0]
                  ? formData.categories[0]
                  : ''
                : ''
            }
            placeholder={focus.trashInput ? '' : '직접 입력'}
            className={`md:col-span-1 col-span-3 border border-light-border px-3 py-2 md:my-5 rounded w-full md:text-center text-left font-bold`}
            onFocus={() => setFocus({ trashInput: true })}
            onBlur={() => setFocus({ trashInput: false })}
            onChange={(e) => updateFormData({ categories: [e.target.value] })}
            onClick={() => updateFormData({ categories: [] })}
          /> */}

          {/* 쓰레기 상세 종류 */}
          <label className="md:col-span-1 col-span-3 font-bold text-[1rem] md:py-5">
            쓰레기 상세 종류
          </label>
          <input
            tabIndex={13}
            type="text"
            value={formData.type || ''}
            placeholder={focus.input3 ? '' : '입력란'}
            disabled={!formData.categories || formData.categories.length === 0}
            className={`col-span-3 md:col-span-1 w-full md:w-[200px] border border-light-border px-3 py-2 rounded md:text-center text-left font-bold ${formData.categories && formData.categories.length > 0 ? '' : 'bg-gray-100 cursor-not-allowed'}`}
            onFocus={() => setFocus({ input3: true })}
            onBlur={() => setFocus({ input3: false })}
            onChange={(e) => updateFormData({ type: e.target.value })}
          />
          <div className="hidden md:block md:col-span-3"></div>

          {/* 파일 첨부 */}
          <FileAttach
            className1='col-span-3 md:col-span-1 md:mb-4 mt-4 md:mt-6 text-[1rem] md:text-lg'
            className2='col-span-3 md:col-span-4 mb-4 md:mt-6'
            formData={formData}
            setFormData={(updates) => {
              if (typeof updates === 'function') {
                updateFormData(updates(formData));
              } else {
                updateFormData(updates);
              }
            }}
            objectCategory="complaint"
          />

          {/* 민원 내용 */}
          <label className="md:col-span-1 col-span-3 font-bold text-[1rem] md:mt-5 self-start">
            민원 내용
          </label>
          <textarea
            tabIndex={14}
            id="content"
            value={formData.content}
            className="md:col-span-4 col-span-3 border border-light-border px-3 md:py-2 md:mt-5 rounded w-full h-40 resize-none whitespace-pre-wrap"
            onChange={(e) => updateFormData({ content: e.target.value })}
          />

          {/* 악성 민원 체크 */}
          <div className="hidden md:block md:col-span-1"></div>
          <div className="md:col-span-1 col-span-2 flex items-center gap-2 row-span-1 md:mt-5">
            <input
              tabIndex={15}
              type="checkbox"
              id="malicious"
              className="w-5 h-5 accent-red"
              checked={getSourceData().bad}
              onChange={(e) =>
                updateFormData({
                  source: { ...formData.source, bad: e.target.checked },
                })
              }
            />
            <label
              htmlFor="malicious"
              className={`flex items-center text-[1rem] ${formData.source.bad ? 'text-red' : ''}`}
            >
              <img
                src={formData.source.bad ? attentionRed : attention}
                alt="찡그린 표정"
                className="w-6 h-6 mr-1"
              />
              반복 민원
            </label>
          </div>
        </div>
      </form>

      {/* 제출 버튼 */}
      <div className="text-center mt-5">
        <button
          tabIndex={16}
          className="bg-light-green hover:bg-green-600 text-white font-semibold px-20 py-2 rounded outline-1"
          onClick={handleSubmit}
        >
          검토 및 전송
        </button>
      </div>
    </div>
  );
}
