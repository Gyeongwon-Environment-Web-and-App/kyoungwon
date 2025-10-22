import type { VehicleDriver, VehicleFormData } from '@/types/transport';

// 10 dummy drivers
export const drivers: VehicleDriver[] = [
  {
    name: '김철수',
    phoneNum: '01012345678',
    category: '일반',
    teamNum: '1조',
  },
  {
    name: '이영희',
    phoneNum: '01023456789',
    category: '음식물',
    teamNum: '2조',
  },
  {
    name: '박민수',
    phoneNum: '01034567890',
    category: '재활용',
    teamNum: '3조',
  },
  {
    name: '최지영',
    phoneNum: '01045678901',
    category: '클린',
    teamNum: '1조',
  },
  {
    name: '정대호',
    phoneNum: '01056789012',
    category: '수송',
    teamNum: '2조',
  },
  {
    name: '한소영',
    phoneNum: '01067890123',
    category: '일반',
    teamNum: '3조',
  },
  {
    name: '윤태호',
    phoneNum: '01078901234',
    category: '음식물',
    teamNum: '1조',
  },
  {
    name: '강미영',
    phoneNum: '01089012345',
    category: '재활용',
    teamNum: '2조',
  },
  {
    name: '임동현',
    phoneNum: '01090123456',
    category: '클린',
    teamNum: '3조',
  },
  {
    name: '송나영',
    phoneNum: '01001234567',
    category: '수송',
    teamNum: '1조',
  },
];

// 10 dummy vehicles
export const vehicles: VehicleFormData[] = [
  {
    vehicleType: '포터',
    vehicleNum: '12가 3456',
    ton: '1T',
    maxTon: '0.7T',
    vehicleYear: '2020',
    vehicleCategory: '생활',
    uploadedFiles: [],
    drivers: drivers,
    vehicleArea: ['쌍문1동', '쌍문2동'],
    broken: false,
    selectedMainDriver: drivers[0],
    selectedTeamMembers: [drivers[1], drivers[2]],
  },
  {
    vehicleType: '마이티',
    vehicleNum: '34나 7890',
    ton: '3.5T',
    vehicleYear: '2019',
    vehicleCategory: '음식물',
    uploadedFiles: [],
    drivers: drivers,
    vehicleArea: ['쌍문3동', '쌍문4동'],
    broken: false,
    selectedMainDriver: drivers[1], // 이영희
    selectedTeamMembers: [drivers[0], drivers[3]], // 김철수, 최지영
  },
  {
    vehicleType: '뉴파워',
    vehicleNum: '56다 1234',
    ton: '5T',
    maxTon: '6.1T',
    vehicleYear: '2021',
    vehicleCategory: '재활용',
    uploadedFiles: [],
    drivers: drivers,
    vehicleArea: ['방학1동', '방학3동'],
    broken: true,
    selectedMainDriver: drivers[2], // 박민수
    selectedTeamMembers: [drivers[1], drivers[4]], // 이영희, 정대호
  },
  {
    vehicleType: '포터',
    vehicleNum: '78라 5678',
    ton: '1T',
    vehicleYear: '2022',
    vehicleCategory: '클린',
    uploadedFiles: [],
    drivers: drivers,
    vehicleArea: ['쌍문1동', '방학1동'],
    broken: true,
    selectedMainDriver: drivers[3], // 최지영
    selectedTeamMembers: [drivers[0], drivers[2]], // 김철수, 박민수
  },
  {
    vehicleType: '마이티',
    vehicleNum: '90마 9012',
    ton: '3.5T',
    vehicleYear: '2018',
    vehicleCategory: '수송',
    uploadedFiles: [],
    drivers: drivers,
    vehicleArea: ['쌍문2동', '쌍문3동'],
    broken: true,
    selectedMainDriver: drivers[4], // 정대호
    selectedTeamMembers: [drivers[1], drivers[3]], // 이영희, 최지영
  },
  {
    vehicleType: '뉴파워',
    vehicleNum: '12바 3456',
    ton: '25T',
    vehicleYear: '2020',
    vehicleCategory: '생활',
    uploadedFiles: [],
    drivers: drivers,
    vehicleArea: ['쌍문4동', '방학3동'],
    broken: false,
    selectedMainDriver: drivers[5], // 한소영
    selectedTeamMembers: [drivers[0], drivers[2], drivers[4]], // 김철수, 박민수, 정대호
  },
  {
    vehicleType: '포터',
    vehicleNum: '34사 7890',
    ton: '1T',
    vehicleYear: '2023',
    vehicleCategory: '음식물',
    uploadedFiles: [],
    drivers: drivers,
    vehicleArea: ['쌍문1동', '쌍문3동', '방학1동'],
    broken: false,
    selectedMainDriver: drivers[6], // 윤태호
    selectedTeamMembers: [drivers[1], drivers[3]], // 이영희, 최지영
  },
  {
    vehicleType: '마이티',
    vehicleNum: '56아 1234',
    ton: '3.5T',
    vehicleYear: '2019',
    vehicleCategory: '재활용',
    uploadedFiles: [],
    drivers: drivers,
    vehicleArea: ['쌍문2동', '쌍문4동', '방학3동'],
    broken: false,
    selectedMainDriver: drivers[7], // 강미영
    selectedTeamMembers: [drivers[2], drivers[4]], // 박민수, 정대호
  },
  {
    vehicleType: '뉴파워',
    vehicleNum: '78자 5678',
    ton: '5T',
    vehicleYear: '2021',
    vehicleCategory: '클린',
    uploadedFiles: [],
    drivers: drivers,
    vehicleArea: ['쌍문1동', '쌍문2동', '쌍문3동', '쌍문4동'],
    broken: false,
    selectedMainDriver: drivers[8], // 임동현
    selectedTeamMembers: [drivers[0], drivers[1], drivers[2]], // 김철수, 이영희, 박민수
  },
  {
    vehicleType: '포터',
    vehicleNum: '90차 9012',
    ton: '1T',
    vehicleYear: '2022',
    vehicleCategory: '수송',
    uploadedFiles: [],
    drivers: drivers,
    vehicleArea: ['방학1동', '방학3동'],
    broken: false,
    selectedMainDriver: drivers[9], // 송나영
    selectedTeamMembers: [drivers[3], drivers[4]], // 최지영, 정대호
  },
];
