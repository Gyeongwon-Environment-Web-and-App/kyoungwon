import type { Complaint } from '@/types/complaint';
import type { MapPinConfig, PinData } from '@/types/map';

// Helper function to validate coordinates
export const isValidCoordinate = (lat: number, lng: number): boolean => {
  return (
    lat !== 0 &&
    lng !== 0 &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

// Pin configuration for different categories
export const PIN_CONFIGS: Record<string, MapPinConfig> = {
  recycle: {
    size: { width: 36, height: 45 },
    offset: { x: 18, y: 45 },
    selectedSize: { width: 54, height: 67.5 }, // 1.5x larger
    selectedOffset: { x: 27, y: 67.5 },
  },
  food: {
    size: { width: 36, height: 45 },
    offset: { x: 18, y: 45 },
    selectedSize: { width: 54, height: 67.5 }, // 1.5x larger
    selectedOffset: { x: 27, y: 67.5 },
  },
  general: {
    size: { width: 36, height: 45 },
    offset: { x: 18, y: 45 },
    selectedSize: { width: 54, height: 67.5 }, // 1.5x larger
    selectedOffset: { x: 27, y: 67.5 },
  },
  others: {
    size: { width: 36, height: 45 },
    offset: { x: 18, y: 45 },
    selectedSize: { width: 54, height: 67.5 }, // 1.5x larger
    selectedOffset: { x: 27, y: 67.5 },
  },
};

export const getPinImageSrc = (
  categories: string[],
  isRepeat: boolean
): string => {
  const basePath = '/src/assets/icons/pins/';

  const validCategories = categories.filter((cat) => cat !== 'manager');
  const primaryCategory = validCategories[0] || '기타';

  const categoryMap: Record<string, string> = {
    재활용: 'recycle',
    음식물: 'food',
    생활: 'general',
    기타: 'others',
  };

  const categoryKey = categoryMap[primaryCategory] || 'general';
  const suffix = isRepeat ? '_repeat' : '_pin';

  return `${basePath}${categoryKey}${suffix}.svg`;
};

// Complaint -> Pin
export const complaintToPinData = (complaint: Complaint): PinData => {
  const lat = complaint.coordinates?.latitude || 0;
  const lng = complaint.coordinates?.longitude || 0;

  // Validate coordinates - if invalid, they will be geocoded later in SimpleKakaoMap
  const hasValidCoordinates = isValidCoordinate(lat, lng);

  return {
    id: `pin-${complaint.id}`,
    lat: hasValidCoordinates ? lat : 0,
    lng: hasValidCoordinates ? lng : 0,
    category: complaint.category || '기타',
    isRepeat: complaint.source.bad,
    address: complaint.address,
    complaintId: complaint.id,
    content: complaint.content,
    datetime: complaint.datetime,
    status: complaint.status,
    teams: complaint.teams || [],
  };
};

// 중복 핀 방지용 민원 그룹화
export const groupComplaintsByAddress = (
  complaints: Complaint[]
): Map<string, Complaint[]> => {
  const grouped = new Map<string, Complaint[]>();

  complaints.forEach((complaint) => {
    const address = complaint.address.address;
    if (!grouped.has(address)) {
      grouped.set(address, []);
    }
    grouped.get(address)!.push(complaint);
  });

  return grouped;
};

// 민원 한 개로 묶기
export const getRepresentativeComplaint = (
  complaints: Complaint[]
): Complaint => {
  // Sort by: repeat status (desc), then by datetime (desc)
  const sorted = [...complaints].sort((a, b) => {
    if (a.source.bad !== b.source.bad) {
      return b.source.bad ? 1 : -1;
    }
    return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
  });

  return sorted[0];
};

export const complaintToPinDataWithGroup = (
  complaint: Complaint,
  allComplaintsInGroup: Complaint[]
): PinData => {
  const lat = complaint.coordinates?.latitude || 0;
  const lng = complaint.coordinates?.longitude || 0;

  const hasValidCoordinates = isValidCoordinate(lat, lng);
  const hasAnyBadComplaint = allComplaintsInGroup.some((c) => c.source.bad);

  return {
    id: `pin-${complaint.id}`,
    lat: hasValidCoordinates ? lat : 0,
    lng: hasValidCoordinates ? lng : 0,
    category: complaint.category || '기타',
    isRepeat: hasAnyBadComplaint,
    address: complaint.address,
    complaintId: complaint.id,
    content: complaint.content,
    datetime: complaint.datetime,
    status: complaint.status,
    teams: complaint.teams ?? [],
  };
};
