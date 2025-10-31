/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { act, useEffect, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import MobileBottomNav from '@/components/layout/MobileBottomNav';
import DriverForm from '@/components/transport/DriverForm';
import DriverInfo from '@/components/transport/DriverInfo';
import VehicleForm from '@/components/transport/VehicleForm';
import VehicleInfo from '@/components/transport/VehicleInfo';

import driverIcon from '../assets/icons/common/driver.svg';
import truckIcon from '../assets/icons/common/truck.svg';
import teamIcon from '../assets/icons/common/team.svg';
import Header from '../components/common/Header';
import Popup from '../components/forms/Popup';
import PageLayout from '../components/layout/PageLayout';
import { useAuthStore } from '../stores/authStore';
import TeamForm from '@/components/transport/TeamForm';
import TeamInfo from '@/components/transport/TeamInfo';

const TransportManage: React.FC = () => {
  const { logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | 'vehicleInfo'
    | 'vehicleForm'
    | 'driverInfo'
    | 'driverForm'
    | 'teamForm'
    | 'teamInfo'
  >('vehicleInfo');

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/vehicle/form')) {
      setActiveTab('vehicleForm');
    } else if (path.includes('/vehicle/info')) {
      setActiveTab('vehicleInfo');
    } else if (path.includes('/driver/form')) {
      setActiveTab('driverForm');
    } else if (path.includes('/driver/info')) {
      setActiveTab('driverInfo');
    } else if (path.includes('/team/info')) {
      setActiveTab('teamInfo');
    } else if (path.includes('/team/form')) {
      setActiveTab('teamForm');
    } else {
      setActiveTab('vehicleInfo');
    }
  }, [location.pathname]);

  const handleTabClick = (
    nextTab:
      | 'vehicleInfo'
      | 'vehicleForm'
      | 'driverInfo'
      | 'driverForm'
      | 'teamInfo'
      | 'teamForm'
  ) => {
    if (
      (activeTab === 'driverForm' ||
        activeTab === 'vehicleForm' ||
        activeTab === 'teamForm') &&
      hasUnsavedChanges
    ) {
      const confirmLeave = window.confirm(
        '작성 중인 내용이 있습니다. 정말 나가시겠습니까?'
      );
      if (!confirmLeave) return;
    }

    // URL 업데이트
    if (nextTab === 'vehicleForm') {
      navigate('/transport/vehicle/form');
    } else if (nextTab === 'vehicleInfo') {
      navigate('/transport/vehicle/info');
    } else if (nextTab === 'driverForm') {
      navigate('/transport/driver/form');
    } else if (nextTab === 'driverInfo') {
      navigate('/transport/driver/info');
    } else if (nextTab === 'teamInfo') {
      navigate('/transport/team/info');
    } else if (nextTab === 'teamForm') {
      navigate('/transport/team/form');
    }

    setActiveTab(nextTab);
  };

  return (
    <div className="w-screen h-screen">
      {isPopupOpen && (
        <Popup
          message={
            <>
              <p>차량/기사정보 전송이</p>
              <p>완료되었습니다.</p>
            </>
          }
          yesNo={false}
          onFirstClick={() => {
            console.log('1st click');
          }}
          onSecondClick={() => {
            console.log('2nd click');
          }}
          toHome={true}
          onGoHome={() => {
            console.log('reset form');
          }}
        />
      )}
      <Header onLogout={logout} />
      <div className="flex md:justify-center md:items-center justify-start items-start pt-2 md:pt-4 pb-[7rem] md:pb-5 w-full">
        <PageLayout
          title="차량 관리"
          icon={
            activeTab === 'vehicleInfo' || activeTab === 'vehicleForm' ? (
              <img src={truckIcon} alt="차량 아이콘" className="w-8 h-8" />
            ) : activeTab === 'driverInfo' || activeTab === 'driverForm' ? (
              <img src={driverIcon} alt="기사 아이콘" className="w-8 h-8" />
            ) : (
              <img src={teamIcon} alt="팀 아이콘" className="w-8 h-8" />
            )
          }
          tabs={[
            { label: '차량 정보', value: 'vehicleInfo' },
            { label: '차량 등록 / 수정', value: 'vehicleForm' },
            { label: '기사 정보', value: 'driverInfo' },
            { label: '기사 등록 / 수정', value: 'driverForm' },
            { label: '팀 정보', value: 'teamInfo' },
            { label: '팀 등록 / 수정', value: 'teamForm' },
          ]}
          activeTab={activeTab}
          onTabClick={(value) => {
            if (
              value === 'vehicleInfo' ||
              value === 'vehicleForm' ||
              value === 'driverInfo' ||
              value === 'driverForm' ||
              value === 'teamForm' ||
              value === 'teamInfo'
            ) {
              handleTabClick(value);
            }
          }}
          tabTitle={
            activeTab === 'vehicleInfo'
              ? '차량 정보'
              : activeTab === 'vehicleForm'
                ? '차량 등록 / 수정'
                : activeTab === 'driverInfo'
                  ? '기사 정보'
                  : activeTab === 'driverForm'
                    ? '기사 등록 / 수정'
                    : activeTab === 'teamForm'
                    ? '팀 등록 / 수정'
                    : '팀 정보'
          }
        >
          {/* 민원 등록 콘텐츠 */}
          <div className="">
            {activeTab === 'vehicleInfo' && (
              <>
                <VehicleInfo />
              </>
            )}
            {activeTab === 'vehicleForm' && (
              <>
                <VehicleForm />
              </>
            )}
            {activeTab === 'driverInfo' && (
              <>
                <DriverInfo />
              </>
            )}
            {activeTab === 'driverForm' && (
              <>
                <DriverForm />
              </>
            )}
            {activeTab === 'teamForm' && (
              <>
                <TeamForm />
              </>
            )}
            {activeTab === 'teamInfo' && (
              <>
                <TeamInfo />
              </>
            )}
          </div>
        </PageLayout>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default TransportManage;
