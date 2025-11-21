import foodPin from '@/assets/icons/pins/food_pin.svg';
import foodRepeat from '@/assets/icons/pins/food_repeat.svg';
import generalPin from '@/assets/icons/pins/general_pin.svg';
import generalRepeat from '@/assets/icons/pins/general_repeat.svg';
import othersPin from '@/assets/icons/pins/others_pin.svg';
import othersRepeat from '@/assets/icons/pins/others_repeat.svg';
import recyclePin from '@/assets/icons/pins/recycle_pin.svg';
import recycleRepeat from '@/assets/icons/pins/recycle_repeat.svg';
import type { Complaint } from '@/types/complaint';
import type { MapPinConfig, PinData } from '@/types/map';

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

export const PIN_CONFIGS: Record<string, MapPinConfig> = {
  recycle: {
    size: { width: 36, height: 45 },
    offset: { x: 18, y: 45 },
    selectedSize: { width: 54, height: 67.5 },
    selectedOffset: { x: 27, y: 67.5 },
  },
  food: {
    size: { width: 36, height: 45 },
    offset: { x: 18, y: 45 },
    selectedSize: { width: 54, height: 67.5 },
    selectedOffset: { x: 27, y: 67.5 },
  },
  general: {
    size: { width: 36, height: 45 },
    offset: { x: 18, y: 45 },
    selectedSize: { width: 54, height: 67.5 },
    selectedOffset: { x: 27, y: 67.5 },
  },
  others: {
    size: { width: 36, height: 45 },
    offset: { x: 18, y: 45 },
    selectedSize: { width: 54, height: 67.5 },
    selectedOffset: { x: 27, y: 67.5 },
  },
};

const PIN_IMAGES: Record<string, { pin: string; repeat: string }> = {
  food: { pin: foodPin, repeat: foodRepeat },
  general: { pin: generalPin, repeat: generalRepeat },
  recycle: { pin: recyclePin, repeat: recycleRepeat },
  others: { pin: othersPin, repeat: othersRepeat },
};

export const getPinImageSrc = (
  categories: string[],
  isRepeat: boolean
): string => {
  const validCategories = categories.filter((cat) => cat !== 'manager');
  const primaryCategory = validCategories[0] || '기타';

  const categoryMap: Record<string, string> = {
    재활용: 'recycle',
    음식물: 'food',
    생활: 'general',
    기타: 'others',
  };

  const categoryKey = categoryMap[primaryCategory] || 'general';
  const pinType = isRepeat ? 'repeat' : 'pin';

  return PIN_IMAGES[categoryKey]?.[pinType] || PIN_IMAGES.general.pin;
};

export const complaintToPinData = (complaint: Complaint): PinData => {
  const lat = complaint.coordinates?.latitude || 0;
  const lng = complaint.coordinates?.longitude || 0;

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

export const getRepresentativeComplaint = (
  complaints: Complaint[]
): Complaint => {
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
