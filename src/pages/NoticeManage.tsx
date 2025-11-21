import React, { useEffect, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

import MobileBottomNav from '@/components/layout/MobileBottomNav';
import NoticeDetail from '@/components/notice/NoticeDetail';
import NoticeForm from '@/components/notice/NoticeForm';
import NoticeTable from '@/components/notice/NoticeTable';

import Header from '../components/common/Header';
import Popup from '../components/forms/Popup';
import PageLayout from '../components/layout/PageLayout';
import { useAuthStore } from '../stores/authStore';

const NoticeManage: React.FC = () => {
  const { logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string; mode?: string }>();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'table' | 'detail' | 'form'>(
    'table'
  );

  // URL 변경 감지하여 탭 업데이트
  useEffect(() => {
    const getDefaultTab = () => {
      if (location.pathname.includes('/form')) {
        return 'form';
      } else if (location.pathname.includes('/table')) {
        return 'table';
      } else if (
        location.pathname.includes('/getPostById') ||
        (location.pathname.includes('/detail') && id)
      ) {
        return 'detail';
      }
      return 'table';
    };

    const newTab = getDefaultTab();
    setActiveTab(newTab);
  }, [location.pathname, id, setActiveTab]);

  const handleTabClick = (nextTab: 'table' | 'form') => {
    if (activeTab === 'form' && nextTab !== 'form') {
      const confirmLeave = window.confirm(
        '작성 중인 공지사항이 있습니다. 정말 나가시겠습니까?'
      );
      if (!confirmLeave) return;
    }

    // URL 업데이트
    if (nextTab === 'form') {
      navigate('/notice/form');
    } else if (nextTab === 'table') {
      navigate('/notice/table');
    }

    setActiveTab(nextTab);
  };

  const handleNoticeSubmit = () => {
    setIsPopupOpen(true);
  };

  const handlePopupFirstClick = () => {
    setIsPopupOpen(false);
    navigate('/notice/table');
  };

  const handlePopupSecondClick = () => {
    setIsPopupOpen(false);
    navigate('/');
  };

  return (
    <div className="w-screen h-screen">
      {isPopupOpen && (
        <Popup
          message={
            <>
              <p>공지사항 전송이</p>
              <p>완료되었습니다.</p>
            </>
          }
          yesNo={false}
          onFirstClick={handlePopupFirstClick}
          onFirstLabel="공지 목록"
          onSecondClick={handlePopupSecondClick}
          onSecondLabel="홈으로 이동"
          toHome={false}
        />
      )}
      <Header onLogout={logout} />
      <div className="flex md:justify-center md:items-center justify-start items-start pt-2 md:pt-4 pb-[7rem] md:pb-5 w-full">
        <PageLayout
          title="민원"
          icon=""
          tabs={[
            { label: '공지 목록', value: 'table' },
            { label: '공지 작성 / 수정', value: 'form' },
          ]}
          activeTab={activeTab}
          onTabClick={(value) => {
            if (value === 'form' || value === 'table') {
              handleTabClick(value);
            }
          }}
          tabTitle={
            activeTab === 'table'
              ? '공지 목록'
              : activeTab === 'form'
                ? '공지 작성 / 수정'
                : ''
          }
        >
          {/* 민원 등록 콘텐츠 */}
          <div className="">
            {activeTab === 'table' && (
              <>
                <NoticeTable />
              </>
            )}
            {activeTab === 'form' && (
              <>
                <NoticeForm onSubmit={handleNoticeSubmit} />
              </>
            )}
            {activeTab === 'detail' && (
              <>
                <NoticeDetail />
              </>
            )}
          </div>
        </PageLayout>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default NoticeManage;
