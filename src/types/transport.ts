import type { FileData } from '@/components/forms/FileAttach';

export interface DriverFormData {
  name: string;
  phoneNum: string;
  selectedTeam: string[];
  uploadedFiles: FileData[];
}

export interface VehicleDriver {
  name: string;
  phoneNum: string;
  category: string;
  teamNum: string;
}

export interface VehicleFormData {
  vehicleType: string;
  vehicleNum: string;
  ton: string;
  vehicleYear: string;
  uploadedFiles: FileData[];
  broken?: boolean;
}

export interface TeamFormData {
  category: string;
  teamName: string;
  regions: string[];
  selectedVehicles: string[];
  selectedDrivers: string[];
}

export interface Team {
  id: number;
  teamName: string;
  category: '생활' | '음식물' | '재활용' | '클린' | '수송';
  selectedVehicles: string[];
  regions: string[];
  drivers: VehicleDriver[];
}

export interface Driver {
  id: number;
  name: string;
  phoneNum: string;
  teamNms: string[];
  presignedLink?: string;
}

export interface Vehicle {
  id: number;
  vehicleType: string;
  vehicleNum: string;
  ton: string;
  vehicleYear: string;
  status: string; // 'okay' | 'broken'
  presignedLink?: string;
  driverName?: string;
  driverPhoneNum?: string;
}
