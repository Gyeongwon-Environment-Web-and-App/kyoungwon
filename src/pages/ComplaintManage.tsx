import { useEffect, useRef } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import ComplaintTable from '@/components/complaints/ComplaintTable';
import ComplaintStats from '@/components/statistics/ComplaintStats';

import chartIcon from '../assets/icons/common/chart.svg';
import editIcon from '../assets/icons/common/edit.svg';
import folderIcon from '../assets/icons/common/folder.svg';
import Header from '../components/common/Header';
import ComplaintConfirm from '../components/complaints/ComplaintConfirm';
import ComplaintForm from '../components/complaints/ComplaintForm';
import DateTimeBox from '../components/forms/DateTimeBox';
import Popup from '../components/forms/Popup';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import PageLayout from '../components/layout/PageLayout';
import apiClient from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { useComplaintFormStore } from '../stores/complaintFormStore';
import { useComplaintManageStore } from '../stores/complaintManageStore';

const ComplaintManage = () => {
  // Get logout function from Zustand store
  const { logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const lastCreatedComplaintIdRef = useRef<number | undefined>(undefined);

  // Get form data from Zustand store
  const { formData, resetForm } = useComplaintFormStore();

  // Get complaint manage state from Zustand store
  const {
    activeTab,
    showConfirm,
    hasUnsavedChanges,
    isPopupOpen,
    setActiveTab,
    setShowConfirm,
    setIsPopupOpen,
    checkUnsavedChanges,
  } = useComplaintManageStore();

  // URL 변경 감지하여 탭 업데이트
  useEffect(() => {
    const getDefaultTab = () => {
      if (location.pathname.includes('/form')) {
        return 'register';
      } else if (location.pathname.includes('/table')) {
        return 'manage';
      } else if (location.pathname.includes('/stats')) {
        return 'stats';
      }
      return 'register'; // 기본값
    };

    const newTab = getDefaultTab();
    setActiveTab(newTab);
  }, [location.pathname, setActiveTab]);

  useEffect(() => {
    if (!location.pathname.includes('/complaints/')) {
      setIsPopupOpen(false);
      setShowConfirm(false);
    }
  }, [location.pathname, setIsPopupOpen, setShowConfirm]);

  // 폼 데이터 변경 감지
  useEffect(() => {
    checkUnsavedChanges(formData);
  }, [formData, checkUnsavedChanges]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '작성 중인 민원이 있습니다. 정말 나가시겠습니까?';
        return '작성 중인 민원이 있습니다. 정말 나가시겠습니까?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleTabClick = (nextTab: 'manage' | 'register' | 'stats') => {
    if (
      activeTab === 'register' && // 작성 중에서
      nextTab !== 'register' && // 다른 탭으로 이동
      hasUnsavedChanges
    ) {
      const confirmLeave = window.confirm(
        '작성 중인 민원이 있습니다. 정말 나가시겠습니까?'
      );
      if (!confirmLeave) return;
    }

    // URL 업데이트
    if (nextTab === 'manage') {
      navigate('/complaints/table');
    } else if (nextTab === 'register') {
      navigate('/complaints/form');
    } else if (nextTab === 'stats') {
      navigate('/complaints/stats');
    }

    resetForm();
    setActiveTab(nextTab);
  };

  // !백엔드로 정보 전송
  const onSubmit = async (uploadedFileKeys?: string[]) => {
    try {
      // 1. 백엔드 API 형식에 맞춘 데이터 준비
      // console.log(formData.categories);

      // Transform uploadedFiles to objectInfos format
      // Use file keys passed directly from ComplaintConfirm, or fallback to store
      let fileKeys: string[] = [];

      if (uploadedFileKeys && uploadedFileKeys.length > 0) {
        // Use file keys passed directly (preferred - avoids timing issues)
        fileKeys = uploadedFileKeys;
      } else {
        // Fallback: get from store (for backward compatibility)
        const uploadedFiles = formData.uploadedFiles.filter((file) => file.url);
        fileKeys = uploadedFiles.map((file) => file.url as string);
      }

      // Get file names from store for objectInfos
      const uploadedFiles = formData.uploadedFiles.filter((file) => file.url);
      const fileKeyToNameMap = new Map(
        uploadedFiles.map((file) => [file.url as string, file.name])
      );

      const objectInfos = fileKeys.map((key) => ({
        objectKey: key, // Cloudflare key
        filenameOriginal:
          fileKeyToNameMap.get(key) || key.split('/').pop() || 'file', // Original filename
      }));

      const complaintData = {
        address: formData.address,
        // Add coordinates if available (convert from { latitude, longitude } to { x_coord, y_coord })
        ...(formData.coordinates &&
          !isNaN(formData.coordinates.latitude) &&
          !isNaN(formData.coordinates.longitude) && {
            coordinates: {
              x_coord: formData.coordinates.longitude, // x_coord = longitude
              y_coord: formData.coordinates.latitude, // y_coord = latitude
            },
          }),
        datetime: formData.datetime || new Date().toISOString(),
        categories: formData.categories || [],
        type: formData.type,
        content: formData.content || '',
        route: formData.route,
        source: {
          phone_no: formData.source?.phone_no || '',
          bad: formData.source?.bad || false,
        },
        notify: {
          // Transform usernames array to boolean flags for API
          teams: formData.notify?.usernames?.includes('팀장님께 전달') || false,
          manager:
            formData.notify?.usernames?.includes('소장님께 전달') || false,
        },
        ...(objectInfos.length > 0 && { objectInfos }), // Include uploaded file keys
      };

      console.log('민원 제출 데이터:', complaintData);
      // console.log('파일 정보:', objectInfos);
      // console.log('파일 키 개수:', fileKeys.length);

      // 2. apiClient를 사용하여 백엔드로 전송 (자동으로 토큰 추가됨)
      const response = await apiClient.post('/complaint/create', complaintData);

      console.log('민원 제출 성공:', response.data);

      const newComplaintId = response.data.complaint.id;
      console.log('newComplaintId:', newComplaintId);
      lastCreatedComplaintIdRef.current = newComplaintId;
      setIsPopupOpen(true);
    } catch (error) {
      console.error('민원 제출 실패:', error);
      alert('민원 제출에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="w-screen h-screen relative">
      {isPopupOpen && (
        <Popup
          message={
            <>
              <p>민원 전송이</p>
              <p>완료되었습니다.</p>
            </>
          }
          yesNo={false}
          onFirstClick={() => {
            setIsPopupOpen(false);
            resetForm();
            setShowConfirm(false);

            // Use the ref value for immediate access to the complaint ID
            const complaintId = lastCreatedComplaintIdRef.current;
            console.log(complaintId);
            if (complaintId) {
              navigate(`/map/overview/complaints/${complaintId}`);
            } else {
              console.error(
                'Complaint ID is undefined, redirecting to table view'
              );
              navigate('/map/overview');
            }
          }}
          onSecondClick={() => {
            setIsPopupOpen(false);
            resetForm();
            setShowConfirm(false);
            navigate('/complaints/table');
          }}
          onFirstLabel="민원 위치로 이동"
          onSecondLabel="민원 관리로 이동"
          toHome={true}
          onGoHome={() => {
            resetForm();
            setIsPopupOpen(false);
            setShowConfirm(false);
          }}
        />
      )}
      <Header onLogout={logout} />
      <div className="flex md:justify-center md:items-center justify-start items-start pt-2 md:pt-4 pb-[7rem] md:pb-5 w-full">
        <PageLayout
          title="민원"
          icon={
            activeTab === 'manage' ? (
              <img src={folderIcon} alt="민원관리 아이콘" className="w-7 h-7" />
            ) : activeTab === 'register' ? (
              <img src={editIcon} alt="민원등록 아이콘" className="w-7 h-7" />
            ) : (
              <img src={chartIcon} alt="전체통계 아이콘" className="w-8 h-8" />
            )
          }
          tabs={[
            { label: '내역 / 관리', value: 'manage' },
            { label: '민원 등록', value: 'register' },
            { label: '전체 통계', value: 'stats' },
          ]}
          activeTab={activeTab}
          onTabClick={(value) => {
            if (
              value === 'manage' ||
              value === 'register' ||
              value === 'stats'
            ) {
              handleTabClick(value);
            }
          }}
          tabTitle={
            activeTab === 'manage'
              ? '민원 내역 / 관리'
              : activeTab === 'register'
                ? '민원 등록'
                : activeTab === 'stats'
                  ? '전체 통계'
                  : ''
          }
        >
          {/* 민원 등록 콘텐츠 */}
          <div>
            {activeTab === 'manage' && (
              <>
                <ComplaintTable />
              </>
            )}
            {activeTab === 'register' &&
              (!showConfirm ? (
                <ComplaintForm
                  dateTimeBox={<DateTimeBox visible={true} repeat={false} />}
                  onSubmit={() => setShowConfirm(true)}
                />
              ) : (
                <ComplaintConfirm
                  onSubmit={onSubmit}
                  onBack={() => setShowConfirm(false)}
                />
              ))}
            {activeTab === 'stats' && (
              <>
                <ComplaintStats />
              </>
            )}
          </div>
        </PageLayout>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default ComplaintManage;
