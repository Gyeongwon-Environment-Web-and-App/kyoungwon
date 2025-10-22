import { useEffect, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import complaint from '../../assets/icons/navigation/mobile_menu/complaint.svg';
import complaintGreen from '../../assets/icons/navigation/mobile_menu/complaint_green.svg';
import home from '../../assets/icons/navigation/mobile_menu/home.svg';
import homeGreen from '../../assets/icons/navigation/mobile_menu/home_green.svg';
import mapIcon from '../../assets/icons/navigation/mobile_menu/mapIcon.svg';
import mapIconGreen from '../../assets/icons/navigation/mobile_menu/mapIcon_green.svg';
import stats from '../../assets/icons/navigation/mobile_menu/stats.svg';
import statsGreen from '../../assets/icons/navigation/mobile_menu/stats_green.svg';
import vehicle from '../../assets/icons/navigation/mobile_menu/vehicle.svg';
import vehicleGreen from '../../assets/icons/navigation/mobile_menu/vehicle_green.svg';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    // 현재 URL에 따라 초기 탭 설정
    switch (location.pathname) {
      case '/':
        return 'home';
      case '/map/overview':
        return 'map';
      case '/complaints/form':
        return 'complaint';
      case '/complaints/stats':
        return 'stats';
      case '/transport/vehicle/info':
        return 'transport';
      default:
        return 'home';
    }
  });

  // URL 변경 시 활성 탭 업데이트
  useEffect(() => {
    switch (location.pathname) {
      case '/':
        setActiveTab('home');
        break;
      case '/map/overview':
        setActiveTab('map');
        break;
      case '/complaints/form':
        setActiveTab('complaint');
        break;
      case '/complaints/stats':
        setActiveTab('stats');
        break;
      case '/transport/vehicle/info':
        setActiveTab('transport');
        break;
      default:
        setActiveTab('home');
    }
  }, [location.pathname]);

  const menuItems = [
    {
      id: 'complaint',
      label: '민원',
      icon: complaint,
      activeIcon: complaintGreen,
      route: '/complaints/form',
    },
    {
      id: 'stats',
      label: '통계',
      icon: stats,
      activeIcon: statsGreen,
      route: '/complaints/stats',
    },
    {
      id: 'home',
      label: '홈',
      icon: home,
      activeIcon: homeGreen,
      route: '/',
    },
    {
      id: 'map',
      label: '지도',
      icon: mapIcon,
      activeIcon: mapIconGreen,
      route: '/map/overview',
    },
    {
      id: 'transport',
      label: '차량',
      icon: vehicle,
      activeIcon: vehicleGreen,
      route: '/transport/vehicle/info',
    },
  ];

  type MenuItem = {
    id: string;
    label: string;
    icon: string;
    activeIcon: string;
    route: string;
  };

  const handleTabClick = (item: MenuItem) => {
    setActiveTab(item.id);
    navigate(item.route);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 block md:hidden">
      <div className="flex justify-around items-center py-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item)}
              className="flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1"
            >
              <img
                src={isActive ? item.activeIcon : item.icon}
                alt={item.label}
                className="w-8 h-8 mb-1"
              />
              <span
                className={`text-xs font-medium ${
                  isActive ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
