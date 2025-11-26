import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import Header from '@/components/common/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { noticeService } from '@/services/noticeService';
import { useAuthStore } from '@/stores/authStore';
import { useMainPageStore } from '@/stores/mainPageStore';
import type { Notice } from '@/types/notice';

import bg1 from '../assets/background/bg1.webp';
import bg2 from '../assets/background/bg2.webp';
import bg3 from '../assets/background/bg3.webp';
import bg4 from '../assets/background/bg4.webp';
import bg5 from '../assets/background/bg5.webp';
import notice from '../assets/icons/common/notice.svg';
import leftArrow from '../assets/icons/navigation/arrows/arrow_left_white.svg';
import rightArrow from '../assets/icons/navigation/arrows/arrow_right_white.svg';
import rightArrowGray from '../assets/icons/navigation/arrows/gray_arrow_right.svg';
import folder from '../assets/icons/navigation/home_menu/folder.svg';
import mapping from '../assets/icons/navigation/home_menu/mapping.svg';
import truck from '../assets/icons/navigation/home_menu/vehicle.svg';
import write from '../assets/icons/navigation/home_menu/write.svg';

const MainPage: React.FC = () => {
  // Get logout function from Zustand store
  const { logout } = useAuthStore();
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    noticeService.getAllNotices(1, true).then((res) => {
      setNotices(res.items.slice(0, 3));
    });
  }, []);

  // Get main page state from Zustand store
  const {
    currentImageIndex,
    loadedImages,
    isTransitioning,
    setCurrentImageIndex,
    addLoadedImage,
    setIsTransitioning,
    nextImage,
    prevImage,
  } = useMainPageStore();

  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Memoize backgroundImages array to prevent unnecessary re-renders
  const backgroundImages = useMemo(() => [bg1, bg2, bg3, bg4, bg5], []);

  // Preload image function with caching
  const preloadImage = useCallback(
    (index: number): Promise<void> => {
      return new Promise((resolve) => {
        if (loadedImages.has(index)) {
          resolve();
          return;
        }

        const img = new Image();
        img.onload = () => {
          addLoadedImage(index);
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load image at index ${index}`);
          resolve(); // Resolve anyway to prevent blocking
        };
        img.src = backgroundImages[index];
      });
    },
    [backgroundImages, loadedImages, addLoadedImage]
  );

  // Preload adjacent images (next and previous)
  const preloadAdjacentImages = useCallback(
    (currentIndex: number) => {
      const nextIndex = (currentIndex + 1) % backgroundImages.length;
      const prevIndex =
        currentIndex === 0 ? backgroundImages.length - 1 : currentIndex - 1;

      // Preload next and previous images
      preloadImage(nextIndex);
      preloadImage(prevIndex);
    },
    [backgroundImages.length, preloadImage]
  );

  // Initialize preloading on mount
  useEffect(() => {
    preloadAdjacentImages(0);
  }, [preloadAdjacentImages]);

  // Preload adjacent images when current image changes
  useEffect(() => {
    preloadAdjacentImages(currentImageIndex);
  }, [currentImageIndex, preloadAdjacentImages]);

  // Enhanced next/prev image functions using store actions
  const handleNextImage = useCallback(async () => {
    if (isTransitioning) return;

    const nextIndex = (currentImageIndex + 1) % backgroundImages.length;
    await preloadImage(nextIndex);
    nextImage(backgroundImages.length);
  }, [
    currentImageIndex,
    backgroundImages.length,
    isTransitioning,
    preloadImage,
    nextImage,
  ]);

  const handlePrevImage = useCallback(async () => {
    if (isTransitioning) return;

    const prevIndex =
      currentImageIndex === 0
        ? backgroundImages.length - 1
        : currentImageIndex - 1;
    await preloadImage(prevIndex);
    prevImage(backgroundImages.length);
  }, [
    currentImageIndex,
    backgroundImages.length,
    isTransitioning,
    preloadImage,
    prevImage,
  ]);

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  const handleNoticeClick = (noticeId: number) => {
    navigate(`/post/getPostById/${noticeId}/true`);
  };

  //! 네비게이팅 수정!
  const menuButtons = [
    {
      title: '민원 관리',
      description: '입력한 민원을 간편하게 관리',
      icon: folder,
      route: '/complaints/table',
      alt: '민원 관리 아이콘',
    },
    {
      title: '민원 등록',
      description: '간편하게 실시간 민원 입력',
      icon: write,
      route: '/complaints/form',
      alt: '민원 등록 아이콘',
    },
    {
      title: '지도',
      description: '간략화된 정보를 지도로 조회',
      icon: mapping,
      route: '/map/overview',
      alt: '지도 아이콘',
    },
    {
      title: '차량 조회',
      description: '업체에서 사용되는 차량 조회',
      icon: truck,
      route: '/transport/vehicle/info',
      alt: '차량 아이콘',
    },
  ];

  return (
    <div className="w-screen h-screen overflow-auto absolute top-0 text-center scrollbar-hide">
      <Header onLogout={logout} />
      {/* 배경 이미지 공간 */}
      <div className="w-screen overflow-hidden absolute top-[11%] lg:top-[12%]">
        <picture>
          <source
            srcSet={backgroundImages[currentImageIndex]}
            type="image/webp"
          />
          <img
            src={backgroundImages[currentImageIndex].replace('.webp', '.jpg')}
            alt={`배경 이미지 ${currentImageIndex + 1}`}
            className={`4xl:h-[43vh] md:h-[40vh] h-[33vh] w-screen object-cover object-center transition-all duration-200 ${
              isTransitioning ? 'scale-105' : 'scale-100'
            }`}
            loading="eager"
          />
        </picture>

        {/* 좌우 화살표 버튼 */}
        <button
          className="absolute top-[50%] md:left-[17%] left-0 -translate-y-[50%] cursor-pointer z-5 disabled:opacity-50"
          onClick={handlePrevImage}
          disabled={isTransitioning}
        >
          <img
            src={leftArrow}
            alt="왼쪽 이동 화살표"
            className="cursor-pointer"
          />
        </button>
        <button
          className="absolute top-[50%] md:right-[16%] right-0 -translate-y-[50%] cursor-pointer object-contain disabled:opacity-50"
          onClick={handleNextImage}
          disabled={isTransitioning}
        >
          <img
            src={rightArrow}
            alt="오른쪽 이동 화살표"
            className="cursor-pointer"
          />
        </button>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isTransitioning) {
                  setIsTransitioning(true);
                  preloadImage(index).then(() => {
                    setCurrentImageIndex(index);
                    setTimeout(() => setIsTransitioning(false), 200);
                  });
                }
              }}
              disabled={isTransitioning}
              className={`w-[15px] h-[15px] !p-0 rounded-full transition-all duration-200 ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              } ${isTransitioning ? 'opacity-50' : 'hover:bg-white/75'}`}
            />
          ))}
        </div>
      </div>

      {/* 화면 하단 */}
      <div className="absolute md:flex md:flex-row flex-col justify-center items-center text-left md:text-center top-[42%] md:top-[53%] w-screen 2xl:px-80">
        <p className="md:hidden font-bold text-lg px-7 pt-8 pb-4">메인 메뉴</p>
        {/* 기능 페이지 이동 버튼들 */}
        <div className="grid grid-cols-2 gap-4 md:gap-6 md:w-[60rem] lg:w-[80rem] xl:w-[100rem] md:mr-4 items-center px-4 4xl:pt-5">
          {menuButtons.map((button, index) => (
            <button
              key={index}
              className={`rounded-xl w-full h-[10rem] flex flex-col-reverse md:flex-row justify-around items-start md:items-center bg-white md:border-none md:shadow-custom border-[1.5px] border-[#C8C8C8] p-0 xxs:px-[0.2rem] xs:px-[0.8rem] md:px-5 py-5 md:py-0 ${
                button.title === '민원 등록' || button.title === '민원 관리'
                  ? 'hover:green-shadow'
                  : button.title === '지도'
                    ? 'hover:blue-shadow'
                    : button.title === '차량 조회'
                      ? 'hover:gray-shadow'
                      : ''
              }`}
              onClick={() => handleCardClick(button.route)}
            >
              <div className="ml-1 flex flex-col justify-between text-left">
                <p className="font-bold text-xl md:text-2xl mb-1">
                  {button.title}
                </p>
                <p className="xs:text-xs xxs:text-[0.7rem] md:text-lg md:hidden lg:block sm:block text-4e4e4e">
                  {button.description}
                </p>
              </div>
              <img
                src={button.icon}
                alt={button.alt}
                className="h-[3rem] md:h-20 xxs:pl-1"
              />
            </button>
          ))}
        </div>
        <div className="h-full mt-7 md:mt-10 mx-4 md:mx-0 4xl:pt-5 mb-24 md:mb-10">
          <div
            className="flex justify-between bg-[#C8F2CE] w-full md:min-w-64 px-3 py-1 rounded cursor-pointer"
            onClick={() => navigate('/notice/table')}
          >
            <div className="flex gap-1 font-semibold text-lg">
              공지사항
              <img src={notice} alt="공지사항 아이콘" />
            </div>
            <img
              src={rightArrowGray}
              alt="오른쪽 화살표"
              className="cursor-pointer"
            />
          </div>
          <div className="h-72 w-full mt-2 overflow-y-auto flex-col items-center justify-center">
            {notices.length > 0 &&
              notices.map((notice) => (
                <div
                  className="flex items-center justify-between border-b border-light-border py-1.5 px-2 cursor-pointer"
                  onClick={() => handleNoticeClick(notice.id)}
                >
                  <span className="truncate">{notice.title}</span>
                  <span>{notice.datetime.slice(0, 10)}</span>
                </div>
              ))}
            {notices.length === 0 && <p className=''>공지사항이 없습니다</p>}
          </div>
        </div>
      </div>
      {/* 
      <footer className='w-full absolute bottom-0 flex items-center justify-center font-normal text-light-border mb-2'>
        프론트엔드 안소현, 백엔드 고다연, 기획/디자인 김수빈, 이주하, 김지윤, 김민혜
      </footer> */}

      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default MainPage;
