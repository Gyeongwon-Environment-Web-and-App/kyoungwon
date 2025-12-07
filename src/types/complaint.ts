// New API Response Types
export interface User {
  name: string;
  serial_no: string;
  phone_no: string;
}

export interface Address {
  address: string;
  region_nm: string;
}

export interface Source {
  phone_no: string;
  bad: boolean;
}

export interface Driver {
  id: number;
  name: string;
  phone_no: string;
}

export interface Team {
  id: number;
  category: string;
  team_nm: string;
  drivers: Driver[];
}

export interface PresignedLink {
  key: string;
  url: string;
}

// Team interface for category API response (without drivers)
export interface TeamForCategory {
  id: number;
  category: string;
  team_nm: string;
}

export interface ComplaintExtended {
  id: number;
  datetime: string;
  content: string;
  status: boolean;
  category: string;
  type: string;
  route: string;
  bad: boolean;
  user: User;
  address: Address;
  source: Source;
  teams: Team[];
  presigned_links: PresignedLink[];
}

export interface ComplaintExtendedWithDrivers {
  id: number;
  datetime: string;
  content: string;
  status: boolean;
  category: string;
  type: string;
  route: string;
  bad: boolean;
  user: User;
  address: Address;
  source: Source;
  teams: Array<{
    id: number;
    category: string;
    team_nm: string;
    isActive: boolean;
  }>;
  drivers: Array<{
    id: number;
    name: string;
    phone_no: string;
    isActive: boolean;
  }>;
  presigned_links: PresignedLink[];
  categories: string[];
}

export interface ComplaintApiResponse {
  data?: ComplaintExtended[];
  message: string;
  complaints_extended: ComplaintExtended[];
}

export interface ComplaintApiResponseWithDrivers {
  message: string;
  complaints_extended: ComplaintExtendedWithDrivers[];
}

export interface ComplaintByIdApiResponse {
  message: string;
  complaint_extended: ComplaintExtendedWithDrivers;
}

// Complaint interface for category API response (different structure)
export interface ComplaintForCategory {
  id: number;
  datetime: string;
  content: string;
  status: boolean;
  type: string;
  route: string;
  bad: boolean;
  user: {
    id: number;
    name: string;
    serial_no: string;
  };
  address: {
    id: number;
    address: string;
    region_nm: string;
  };
  source: {
    id: number;
    phone_no: string;
    bad: boolean;
  };
  teams: TeamForCategory[];
  files: string[];
}

export interface ComplaintByCategoryApiResponse {
  message: string;
  complaints: ComplaintForCategory[];
}

// Form Data Interface (for creating new complaints)
export interface ComplaintFormData {
  address: string;
  datetime: string;
  categories: string[];
  type: string;
  content: string;
  route: string;
  source: {
    phone_no: string;
    bad: boolean;
  };
  notify: {
    usernames: string[];
  };
  // Keep these for UI purposes (not sent to backend)
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  uploadedFiles: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
    previewUrl?: string;
    file?: File;
  }>;
}

// Main Complaint interface
export interface Complaint {
  id: number;
  address: Address;
  datetime: string;
  category: string;
  type: string;
  content: string;
  route: string;
  source: {
    phone_no: string;
    bad: boolean;
  };
  notify: {
    usernames: string[];
  };
  // Keep these for UI purposes (not sent to backend)
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  status: boolean;
  bad: boolean;
  user: User;
  teams: Team[];
  presigned_links: PresignedLink[];
  categories?: string[];
}

export interface DriverInfo {
  id: number;
  name: string;
  phone_no: string;
}

export interface TruckInfo {
  id: number;
  truck_no: string;
  brand_nm: string;
  size: string;
  year: string;
  status: string;
}

export interface TeamInfo {
  id: number;
  team_nm: string;
  category: string;
  drivers: DriverInfo[];
  trucks: TruckInfo[];
}

export interface DriverDataResponse {
  message: string;
  teams: TeamInfo[];
}

export interface DriverData {
  teams: TeamInfo[];
  loading: boolean;
  error: string | null;
}
