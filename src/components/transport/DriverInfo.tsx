import React from 'react';

import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDrivers } from '@/hooks/useDrivers';
import { transportService } from '@/services/transportService';

import { Button } from '../ui/button';
import DriverCard from './DriverCard';

const DriverInfo: React.FC = () => {
  const navigate = useNavigate();
  const { drivers, isLoading, fetchError, refetch } = useDrivers();

  const handleDeleteDriver = async (id: number) => {
    try {
      const response = await transportService.deleteDriver(id);

      if (response.message) {
        alert(response.message);
        // Refetch drivers after successful deletion
        refetch();
      }
    } catch (error) {
      console.error('기사 삭제 실패:', error);
      alert('기사 삭제 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">기사 목록을 불러오는 중...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-red-500">오류가 발생했습니다</p>
      </div>
    );
  }

  if (!isLoading && !fetchError && drivers.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">기사 정보가 없습니다</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center my-6">
        <div className="flex items-center gap-2 md:gap-4">
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="font-bold border border-light-border justify-between"
                >
                  정렬 방식
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full text-center">
                <DropdownMenuItem className="">가나다 순</DropdownMenuItem>
                <DropdownMenuItem className="">등록 순</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="font-bold border border-light-border justify-between"
                >
                  수거 종류
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full text-center">
                <DropdownMenuItem className="">재활용</DropdownMenuItem>
                <DropdownMenuItem className="">생활</DropdownMenuItem>
                <DropdownMenuItem className="">음식물</DropdownMenuItem>
                <DropdownMenuItem className="">클린 / 수송</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <button
          className="py-1.5 px-2 md:px-5 rounded-lg bg-light-green hover:bg-[#009d10] font-bold text-white"
          onClick={() => navigate('/transport/driver/form')}
        >
          등록하기
        </button>
      </div>
      <div className="md:grid md:grid-cols-[1fr_1fr_1fr_1fr] gap-6">
        {drivers.map((driver) => {
          return (
            <div key={driver.id} className="col-span-1 mb-6 md:mb-0">
              <DriverCard
                name={driver.name}
                phoneNum={driver.phoneNum}
                teamNms={driver.teamNms}
                driverId={driver.id}
                onDelete={handleDeleteDriver}
                presignedLink={driver.presignedLink}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DriverInfo;
