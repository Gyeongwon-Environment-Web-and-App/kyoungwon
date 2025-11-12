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
  category: string; // Changed from categories array to single category string
  type: string;
  route: string;
  bad: boolean;
  user: User;
  address: Address;
  source: Source;
  teams: Team[];
}

export interface ComplaintApiResponse {
  data?: ComplaintExtended[];
  message: string;
  complaints_extended: ComplaintExtended[];
}

export interface ComplaintByIdApiResponse {
  message: string;
  complaint_extended: ComplaintExtended;
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
    url: string; // Cloudflare key (used for submission, empty until upload)
    type: string;
    size: number;
    previewUrl?: string; // Optional: local preview URL for images (for display only)
    file?: File; // Original File object (for later upload in confirm stage)
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
  uploadedFiles: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  // Fields from API response
  status: boolean;
  bad: boolean;
  user: User;
  teams: Team[];
}

export interface DriverInfo {
  id: number;
  name: string;
  phone_no: string;
}

export interface TeamInfo {
  id: number;
  team_nm: string;
  category: string;
  drivers: DriverInfo[];
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
