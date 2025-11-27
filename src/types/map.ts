import type { Address } from "./complaint";

interface Team {
  id: number;
  category: string;
  team_nm: string;
  drivers: Driver[];
}

interface Driver {
  name: string;
}

// Map-related types for pin management
export interface PinData {
  id: string;
  lat: number;
  lng: number;
  category: string;
  isRepeat: boolean;
  address: Address;
  complaintId: number;
  content: string;
  datetime: string;
  status: boolean;
  teams: Team[];
}

export interface MapPinConfig {
  size: {
    width: number;
    height: number;
  };
  offset: {
    x: number;
    y: number;
  };
  selectedSize?: { width: number; height: number };
  selectedOffset?: { x: number; y: number };
}

export interface PinClickEvent {
  pin: PinData;
  marker: unknown; // Kakao Maps marker instance
  map: unknown; // Kakao Maps instance
}

// Polygon-related types
export interface PolygonCoordinates {
  type: 'Polygon';
  coordinates: number[][][]; // [ring][point][lng, lat]
}

export interface PolygonFeature {
  type: 'Feature';
  properties: {
    id: number;
    team: {
      id: number;
      team_nm: string;
      category: string;
    };
    truck: {
      id: number;
      truck_no: string;
    };
  };
  geometry: PolygonCoordinates;
}

export interface RegionData {
  message: string;
  region_areas: {
    type: 'FeatureCollection';
    features: PolygonFeature[];
  };
}

export interface PolygonClickEvent {
  polygon: PolygonFeature;
  map: unknown; // Kakao Maps instance
}
