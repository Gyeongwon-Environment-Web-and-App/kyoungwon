import React, { useMemo, useState } from 'react';

import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTeams } from '@/hooks/useTeams';
import { transportService } from '@/services/transportService';

import { Button } from '../ui/button';
import TeamCard from './TeamCard';

const TeamInfo: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  const navigate = useNavigate();
  const { teams, isLoading, fetchError, refetch } = useTeams();

  const handleDeleteTeam = async (id: number) => {
    try {
      const response = await transportService.deleteTeam(id);

      if (response.message) {
        alert(response.message);
        // Refetch teams after successful deletion
        refetch();
      }
    } catch (error) {
      console.error('팀 삭제 실패:', error);
      alert('팀 삭제 중 오류가 발생했습니다.');
    }
  };

  const filteredTeams = useMemo(() => {
    if (selectedCategory === '전체') {
      return teams;
    }
    if (selectedCategory === '클린 / 수송') {
      return teams.filter(team => team.category === '클린' || team.category === '수송');
    }
    return teams.filter(team => team.category === selectedCategory);
  }, [teams, selectedCategory]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">팀 목록을 불러오는 중...</p>
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

  if (!isLoading && !fetchError && teams.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">팀 정보가 없습니다</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center my-6">
        <div className="flex items-center gap-2 md:gap-4">
          {/* <div>
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
          </div> */}
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="font-bold border border-light-border justify-between"
                >
                  {selectedCategory === '전체' ? '수거 종류' : selectedCategory}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full text-center">
                <DropdownMenuItem onClick={() => setSelectedCategory('전체')} className="">전체</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory('재활용')} className="">재활용</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory('생활')} className="">생활</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory('음식물')} className="">음식물</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory('클린 / 수송')} className="">클린 / 수송</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <button
          className="py-1.5 px-2 md:px-5 rounded-lg bg-light-green hover:bg-[#009d10] font-bold text-white"
          onClick={() => navigate('/transport/team/form')}
        >
          등록하기
        </button>
      </div>
      <div className="md:grid md:grid-cols-[1fr_1fr_1fr] gap-6">
        {filteredTeams.map((team, index) => (
          <div key={team.teamName || index} className="col-span-1 mb-6 md:mb-0">
            <TeamCard
              key={index}
              teamName={team.teamName}
              category={team.category}
              selectedVehicles={team.selectedVehicles}
              regions={team.regions}
              drivers={team.drivers}
              teamId={team.id}
              onDelete={handleDeleteTeam}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamInfo;
