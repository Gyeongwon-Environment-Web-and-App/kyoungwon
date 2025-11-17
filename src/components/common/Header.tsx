import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, X } from '@/lib/icons';

import logo from '../../assets/icons/brand/logo.svg';
import long_logo from '../../assets/icons/brand/long_logo.svg';
import bottomArrow from '../../assets/icons/navigation/arrows/bottom_arrow.svg';
import topArrow from '../../assets/icons/navigation/arrows/top_arrow.svg';

interface HeaderProps {
  onLogout: () => void;
}

type SidebarShortcut = 'complaint' | 'vehicle' | 'stats';

interface MenuItem {
  name: string;
  route: string;
  sidebar?: SidebarShortcut;
}

const menuItems: {
  label: string;
  submenu: MenuItem[];
}[] = [
  {
    label: '지도',
    submenu: [
      { name: '민원 목록', route: '/map/overview', sidebar: 'complaint' },
      { name: '차량 조회', route: '/map/overview', sidebar: 'vehicle' },
      { name: '구역별 통계', route: '/map/overview', sidebar: 'stats' },
      { name: '관할 구역 수정', route: '/' },
    ],
  },
  {
    label: '차량 관리',
    submenu: [
      { name: '차량 정보', route: '/transport/vehicle/info' },
      { name: '기사 정보', route: '/transport/driver/info' },
      { name: '팀 정보', route: '/transport/team/info' },
    ],
  },
  {
    label: '민원',
    submenu: [
      { name: '내역 / 관리', route: '/complaints/table' },
      { name: '민원 등록 / 수정', route: '/complaints/form' },
      { name: '전체 통계', route: '/complaints/stats' },
    ],
  },
  {
    label: '공지사항',
    submenu: [
      { name: '공지 목록', route: '/notice/table' },
      { name: '공지 상세', route: '/notice/detail' },
      { name: '공지 작성 / 수정', route: '/notice/form' },
    ],
  },
];

export default function Header({ onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<number[]>([]);

  const buildTargetRoute = (route: string, sidebar?: SidebarShortcut) =>
    sidebar ? `${route}?sidebar=${sidebar}` : route;

  const toggleMenu = (index: number) => {
    setExpandedMenus((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const isMenuExpanded = (index: number) => expandedMenus.includes(index);

  const handleLogout = () => {
    onLogout();
    alert('로그아웃 되었습니다.');
  };

  return (
    <header className="relative w-screen xs:h-[3rem] md:h-[7rem] bg-white py-3 z-50">
      <div className="relative md:h-full flex items-center justify-between mx-5 mt-2 2xl:mx-[18rem]">
        {/* 로고 */}
        <div
          className="cursor-pointer mb-2 md:ml-6"
          onClick={() => navigate('/')}
        >
          {/* 작은 화면용 로고 */}
          <img
            src={logo}
            alt="경원환경개발 로고"
            className="object-center h-[5vh] lg:hidden"
          />
          {/* 큰 화면용 로고 */}
          <img
            src={long_logo}
            alt="경원환경개발 로고"
            className="object-center h-[7vh] hidden lg:block"
          />
        </div>

        {/* 데스크톱 메뉴 - md 이상에서만 표시 */}
        <nav
          className="hidden md:flex relative space-x-16 z-25 mb-0 pb-0 px-10 lg:mr-[9rem] md:mr-[3rem]"
          onMouseEnter={() => setShowDropdown(true)}
        >
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              className="relative flex flex-col items-center box-border"
            >
              {/* 상단 메뉴 텍스트 */}
              <div
                className={`cursor-pointer px-4 pt-7 pb-4 font-bold lg:text-xl text-md ${showDropdown ? 'border-b-2 border-black' : ''}`}
              >
                {item.label}
              </div>

              {/* 개별 드롭다운: 상단 메뉴 바로 아래 위치 */}
              {showDropdown && (
                <div className="absolute top-full bg-efefef pt-4 pb-2 px-4 z-20 w-max min-w-[9rem] text-center transition">
                  {item.submenu.map((sub, subIdx) => (
                    <div
                      key={subIdx}
                      className="py-2 hover:text-gray-400 cursor-pointer font-semibold lg:text-lg text-md"
                      onClick={() => {
                        navigate(buildTargetRoute(sub.route, sub.sidebar));
                        setShowDropdown(false);
                      }}
                    >
                      {sub.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* 모바일 햄버거 메뉴 - md 미만에서만 표시 */}
        <div className="md:hidden overflow-auto">
          <Sheet
            open={mobileMenuOpen}
            onOpenChange={(open) => {
              setMobileMenuOpen(open);
            }}
          >
            <SheetTrigger asChild>
              <button
                className="p-2 hover:bg-gray-100 rounded-md"
                onClick={() => {
                  setMobileMenuOpen(true);
                }}
              >
                <Menu className="h-7 w-7 text-[#4C9355]" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] sm:w-[400px] relative h-screen [&>button:first-child]:hidden !p-0 border-none z-[9999]"
              style={{
                left: 0,
                right: 'auto',
                transform: 'translateX(0)',
                position: 'fixed',
                zIndex: 9999,
              }}
            >
              {/* 접근성을 위한 제목과 설명 */}
              <SheetTitle className="sr-only">모바일 메뉴</SheetTitle>
              <SheetDescription className="sr-only">
                네비게이션 메뉴를 선택하세요
              </SheetDescription>

              {/* 커스텀 X 버튼 */}
              <SheetClose asChild>
                <button className="absolute -right-[3rem] top-[3.5rem] p-3 bg-red-500 hover:bg-red-600 transition-colors z-50">
                  <X className="h-6 w-6 text-white font-bold" />
                </button>
              </SheetClose>

              {/* 로그아웃 버튼 */}
              <div className="text-sm bg-[#77BF7E] text-right pt-[4rem]">
                <button
                  className="text-right text-white hover:text-gray-600 transition-colors"
                  onClick={() => handleLogout}
                >
                  직원 등록
                </button>
                <button
                  className="text-right text-white hover:text-gray-600 transition-colors"
                  onClick={() => handleLogout}
                >
                  로그아웃
                </button>
              </div>
              <div className="flex flex-col space-y-4 mt-8 p-6 pt-0">
                {menuItems.map((item, idx) => (
                  <div key={idx} className="border-b border-bababa pb-4">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() =>
                        item.submenu.length > 0 ? toggleMenu(idx) : null
                      }
                    >
                      <h3 className="text-lg font-bold mb-2">{item.label}</h3>
                      {item.submenu.length > 0 && (
                        <img
                          src={isMenuExpanded(idx) ? topArrow : bottomArrow}
                          alt={isMenuExpanded(idx) ? '접기' : '펼치기'}
                          className="w-4 h-4 transition-transform"
                        />
                      )}
                    </div>
                    {isMenuExpanded(idx) && item.submenu.length > 0 && (
                      <div className="flex flex-col space-y-2 mt-2">
                        {item.submenu.map((sub, subIdx) => (
                          <button
                            key={subIdx}
                            className="text-left py-1 text-[#656565] hover:text-gray-600 transition-colors"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              navigate(
                                buildTargetRoute(sub.route, sub.sidebar)
                              );
                            }}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* 오른쪽 메뉴 - 데스크톱에서만 표시 */}
        <div className="hidden md:flex space-x-4 text-base md:text-sm absolute top-0 right-2 cursor-pointer">
          <button className="hover:text-gray-400" onClick={() => onLogout()}>
            직원 등록
          </button>
          <button className="hover:text-gray-400" onClick={() => onLogout()}>
            로그아웃
          </button>
        </div>
      </div>

      {showDropdown && (
        <div
          className="hidden sm:block absolute top-[6.3rem] left-0 !w-screen md:h-[15rem] h-[13rem] z-10 bg-efefef transition"
          onMouseLeave={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
}
