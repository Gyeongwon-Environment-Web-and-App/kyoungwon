import type { Complaint } from '../types/complaint';

// 더미 데이터 - Updated to match new API structure
export const complaints: Complaint[] = [
  {
    id: 1,
    address: {
      address: '서울특별시 도봉구 방학로 101',
      region_nm: '방학동',
    },
    datetime: '2025-01-15T09:38:00',
    category: '재활용',
    type: '재활용',
    content: '스티로폼 수거 요청',
    route: '경원환경',
    source: {
      phone_no: '010-1234-1234',
      bad: false,
    },
    notify: {
      usernames: ['김민수'],
    },
    coordinates: {
      latitude: 37.6634,
      longitude: 127.0444,
    },
    status: true,
    bad: false,
    user: {
      name: '김민수',
      serial_no: '1234',
      phone_no: '010-1234-1234',
    },
    teams: [
      {
        id: 1,
        category: '재활용',
        team_nm: '경원환경',
        drivers: [
          {
            id: 1,
            name: '김민수',
            phone_no: '010-1234-1234',
          },
        ],
      },
    ],
    presigned_links: [],
  },
  {
    id: 2,
    address: {
      address: '서울특별시 도봉구 쌍문로 45길 20',
      region_nm: '쌍문동',
    },
    datetime: '2025-01-14T14:22:31',
    category: '음식물',
    type: '음식물',
    content: '음식물 미수거 신고',
    route: '구청',
    source: {
      phone_no: '010-3300-2200',
      bad: true,
    },
    notify: {
      usernames: ['이서준'],
    },
    coordinates: {
      latitude: 37.6489,
      longitude: 127.0347,
    },
    status: true,
    bad: true,
    user: {
      name: '이서준',
      serial_no: '5678',
      phone_no: '010-3300-2200',
    },
    teams: [
      {
        id: 2,
        category: '음식물',
        team_nm: '구청',
        drivers: [
          {
            id: 2,
            name: '이서준',
            phone_no: '010-3300-2200',
          },
        ],
      },
    ],
    presigned_links: [],
  },
  {
    id: 3,
    address: {
      address: '서울특별시 도봉구 시루봉로 59',
      region_nm: '시루봉동',
    },
    datetime: '2025-01-13T07:15:12',
    category: '생활',
    type: '생활',
    content: '대형폐기물 수거 요청',
    route: '경원환경',
    source: {
      phone_no: '010-5553-7777',
      bad: false,
    },
    notify: {
      usernames: ['박지훈'],
    },
    coordinates: {
      latitude: 37.6589,
      longitude: 127.0398,
    },
    status: true,
    bad: false,
    user: {
      name: '박지훈',
      serial_no: '9012',
      phone_no: '010-5553-7777',
    },
    teams: [
      {
        id: 3,
        category: '생활',
        team_nm: '경원환경',
        drivers: [
          {
            id: 3,
            name: '박지훈',
            phone_no: '010-5553-7777',
          },
        ],
      },
    ],
    presigned_links: [],
  },
  {
    id: 4,
    address: {
      address: '서울특별시 도봉구 우이천로 152',
      region_nm: '우이동',
    },
    datetime: '2025-01-12T19:48:00',
    category: '생활',
    type: '생활',
    content: '불법투기 신고',
    route: '경원환경',
    source: {
      phone_no: '010-7770-0000',
      bad: true,
    },
    notify: {
      usernames: ['최윤아'],
    },
    coordinates: {
      latitude: 37.6534,
      longitude: 127.0289,
    },
    status: false,
    bad: true,
    user: {
      name: '최윤아',
      serial_no: '3456',
      phone_no: '010-7770-0000',
    },
    teams: [
      {
        id: 4,
        category: '생활',
        team_nm: '경원환경',
        drivers: [
          {
            id: 4,
            name: '최윤아',
            phone_no: '010-7770-0000',
          },
        ],
      },
    ],
    presigned_links: [],
  },
  {
    id: 5,
    address: {
      address: '서울특별시 도봉구 도봉로 108가길 11',
      region_nm: '도봉동',
    },
    datetime: '2025-01-11T11:05:55',
    category: '음식물',
    type: '음식물',
    content: '골목 종량제 수거 요청',
    route: '주민센터',
    source: {
      phone_no: '02-120',
      bad: false,
    },
    notify: {
      usernames: ['정하늘'],
    },
    coordinates: {
      latitude: 37.6489,
      longitude: 127.0347,
    },
    status: false,
    bad: false,
    user: {
      name: '정하늘',
      serial_no: '7890',
      phone_no: '02-120',
    },
    teams: [
      {
        id: 5,
        category: '음식물',
        team_nm: '주민센터',
        drivers: [
          {
            id: 5,
            name: '정하늘',
            phone_no: '02-120',
          },
        ],
      },
    ],
    presigned_links: [],
  },
  {
    id: 6,
    address: {
      address: '서울특별시 도봉구 덕릉로 63',
      region_nm: '덕릉동',
    },
    datetime: '2025-01-10T06:30:00',
    category: '음식물',
    type: '음식물',
    content: '종량제 수거 요청',
    route: '120신고센터',
    source: {
      phone_no: '02-120',
      bad: false,
    },
    notify: {
      usernames: ['한지호'],
    },
    coordinates: {
      latitude: 37.6534,
      longitude: 127.0289,
    },
    status: false,
    bad: false,
    user: {
      name: '한지호',
      serial_no: '1111',
      phone_no: '02-120',
    },
    teams: [
      {
        id: 6,
        category: '음식물',
        team_nm: '120신고센터',
        drivers: [
          {
            id: 6,
            name: '한지호',
            phone_no: '02-120',
          },
        ],
      },
    ],
    presigned_links: [],
  },
  {
    id: 7,
    address: {
      address: '서울특별시 도봉구 해등로 12길 9',
      region_nm: '해등동',
    },
    datetime: '2025-01-09T17:12:45',
    category: '생활',
    type: '생활',
    content: '아파트 특수마대 수거 요청',
    route: '120신고센터',
    source: {
      phone_no: '02-120',
      bad: false,
    },
    notify: {
      usernames: ['서지민'],
    },
    coordinates: {
      latitude: 37.6489,
      longitude: 127.0347,
    },
    status: false,
    bad: false,
    user: {
      name: '서지민',
      serial_no: '2222',
      phone_no: '02-120',
    },
    teams: [
      {
        id: 7,
        category: '생활',
        team_nm: '120신고센터',
        drivers: [
          {
            id: 7,
            name: '서지민',
            phone_no: '02-120',
          },
        ],
      },
    ],
    presigned_links: [],
  },
  {
    id: 8,
    address: {
      address: '서울특별시 도봉구 해등로 198',
      region_nm: '해등동',
    },
    datetime: '2025-01-08T20:12:45',
    category: '생활',
    type: '생활',
    content: '한의원 앞 쓰레기 수거 요청',
    route: '경원환경',
    source: {
      phone_no: '010-7770-0000',
      bad: false,
    },
    notify: {
      usernames: ['김아무개'],
    },
    coordinates: {
      latitude: 37.6489,
      longitude: 127.0347,
    },
    status: true,
    bad: false,
    user: {
      name: '김아무개',
      serial_no: '3333',
      phone_no: '010-7770-0000',
    },
    teams: [
      {
        id: 8,
        category: '생활',
        team_nm: '경원환경',
        drivers: [
          {
            id: 8,
            name: '김아무개',
            phone_no: '010-7770-0000',
          },
        ],
      },
    ],
    presigned_links: [],
  },
  {
    id: 9,
    address: {
      address: '서울특별시 도봉구 방학로 203',
      region_nm: '방학동',
    },
    datetime: '2025-01-16T08:30:00',
    category: '재활용',
    type: '재활용',
    content: '플라스틱 분리수거 요청',
    route: '경원환경',
    source: {
      phone_no: '010-9999-8888',
      bad: false,
    },
    notify: {
      usernames: ['이영희'],
    },
    coordinates: {
      latitude: 37.6634,
      longitude: 127.0444,
    },
    status: true,
    bad: false,
    user: {
      name: '이영희',
      serial_no: '4444',
      phone_no: '010-9999-8888',
    },
    teams: [
      {
        id: 9,
        category: '재활용',
        team_nm: '경원환경',
        drivers: [
          {
            id: 9,
            name: '이영희',
            phone_no: '010-9999-8888',
          },
        ],
      },
    ],
    presigned_links: [],
  },
  {
    id: 10,
    address: {
      address: '서울특별시 도봉구 쌍문로 78길 15',
      region_nm: '쌍문동',
    },
    datetime: '2025-01-16T15:45:30',
    category: '음식물',
    type: '음식물',
    content: '음식물쓰레기 냄새 신고',
    route: '구청',
    source: {
      phone_no: '010-4444-5555',
      bad: true,
    },
    notify: {
      usernames: ['박철수'],
    },
    coordinates: {
      latitude: 37.6489,
      longitude: 127.0347,
    },
    status: true,
    bad: true,
    user: {
      name: '박철수',
      serial_no: '5555',
      phone_no: '010-4444-5555',
    },
    teams: [
      {
        id: 10,
        category: '음식물',
        team_nm: '구청',
        drivers: [
          {
            id: 10,
            name: '박철수',
            phone_no: '010-4444-5555',
          },
        ],
      },
    ],
    presigned_links: [],
  },
];
