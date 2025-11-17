// stores/complaintDataStore.ts
import axios from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define complaint data interface
interface ComplaintData {
  id: string;
  address: string;
  selectedRoute: string;
  phone: string;
  selectedTrash: string;
  trashDetail: string;
  content: string;
  isMalicious: boolean;
  forwardTargets: string[];
  uploadedFiles: Array<{
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  status: boolean;
  [key: string]:
    | string
    | number
    | boolean
    | string[]
    | File[]
    | Array<{ name: string; size: number; type: string; url: string }>
    | { latitude: number; longitude: number }
    | undefined;
}

// Define area data interface
interface AreaData {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  frequency: number;
  lastUpdated: string;
}

// Define cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Define complaint data state interface
interface ComplaintDataState {
  // Data state
  complaints: ComplaintData[];
  areas: AreaData[];

  // Cache state
  addressCache: Map<string, CacheEntry<unknown>>;
  areaCache: Map<string, CacheEntry<AreaData[]>>;

  // Loading states
  isLoadingComplaints: boolean;
  isLoadingAreas: boolean;

  // Error states
  complaintsError: string | null;
  areasError: string | null;

  // Actions
  setComplaints: (complaints: ComplaintData[]) => void;
  setAreas: (areas: AreaData[]) => void;
  setLoadingComplaints: (loading: boolean) => void;
  setLoadingAreas: (loading: boolean) => void;
  setComplaintsError: (error: string | null) => void;
  setAreasError: (error: string | null) => void;

  // Data management actions
  addComplaint: (complaint: ComplaintData) => void;
  updateComplaint: (id: string, updates: Partial<ComplaintData>) => void;
  deleteComplaint: (id: string) => void;

  // Cache management actions
  setAddressCache: (key: string, data: unknown, ttl?: number) => void;
  getAddressCache: (key: string) => unknown | null;
  setAreaCache: (key: string, data: AreaData[], ttl?: number) => void;
  getAreaCache: (key: string) => AreaData[] | null;
  clearCache: () => void;

  // API actions
  fetchComplaints: () => Promise<void>;
  fetchAreas: () => Promise<void>;
  submitComplaint: (complaintData: Partial<ComplaintData>) => Promise<boolean>;
  getAddressFrequency: (address: string) => Promise<number>;

  // Helper actions
  resetData: () => void;
}

// Default TTL values (in milliseconds)
const DEFAULT_TTL = {
  ADDRESS: 5 * 60 * 1000, // 5 minutes
  AREA: 30 * 60 * 1000, // 30 minutes
  COMPLAINT: 10 * 60 * 1000, // 10 minutes
};

// Create the complaint data store
export const useComplaintDataStore = create<ComplaintDataState>()(
  persist(
    (set, get) => ({
      // Initial state
      complaints: [],
      areas: [],
      addressCache: new Map(),
      areaCache: new Map(),
      isLoadingComplaints: false,
      isLoadingAreas: false,
      complaintsError: null,
      areasError: null,

      // Actions
      setComplaints: (complaints) => set({ complaints }),

      setAreas: (areas) => set({ areas }),

      setLoadingComplaints: (loading) => set({ isLoadingComplaints: loading }),

      setLoadingAreas: (loading) => set({ isLoadingAreas: loading }),

      setComplaintsError: (error) => set({ complaintsError: error }),

      setAreasError: (error) => set({ areasError: error }),

      // Data management actions
      addComplaint: (complaint) =>
        set((state) => ({
          complaints: [...state.complaints, complaint],
        })),

      updateComplaint: (id, updates) =>
        set((state) => ({
          complaints: state.complaints.map((complaint) =>
            complaint.id === id ? { ...complaint, ...updates } : complaint
          ),
        })),

      deleteComplaint: (id) =>
        set((state) => ({
          complaints: state.complaints.filter(
            (complaint) => complaint.id !== id
          ),
        })),

      // Cache management actions
      setAddressCache: (key, data: unknown, ttl = DEFAULT_TTL.ADDRESS) => {
        const { addressCache } = get();
        const newCache = new Map(addressCache);
        newCache.set(key, {
          data,
          timestamp: Date.now(),
          ttl,
        });
        set({ addressCache: newCache });
      },

      getAddressCache: (key): unknown | null => {
        const { addressCache } = get();
        const entry = addressCache.get(key);
        if (!entry) return null;

        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
          // Cache expired
          const newCache = new Map(addressCache);
          newCache.delete(key);
          set({ addressCache: newCache });
          return null;
        }

        return entry.data;
      },

      setAreaCache: (key, data, ttl = DEFAULT_TTL.AREA) => {
        const { areaCache } = get();
        const newCache = new Map(areaCache);
        newCache.set(key, {
          data,
          timestamp: Date.now(),
          ttl,
        });
        set({ areaCache: newCache });
      },

      getAreaCache: (key) => {
        const { areaCache } = get();
        const entry = areaCache.get(key);
        if (!entry) return null;

        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
          // Cache expired
          const newCache = new Map(areaCache);
          newCache.delete(key);
          set({ areaCache: newCache });
          return null;
        }

        return entry.data;
      },

      clearCache: () =>
        set({
          addressCache: new Map(),
          areaCache: new Map(),
        }),

      // API actions
      fetchComplaints: async () => {
        const { setLoadingComplaints, setComplaints, setComplaintsError } =
          get();

        try {
          setLoadingComplaints(true);
          setComplaintsError(null);

          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL || 'https://gyeongwon-proxy.onrender.com/api'}/complaints`
          );
          setComplaints(response.data);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch complaints';
          setComplaintsError(errorMessage);
          console.error('Failed to fetch complaints:', error);
        } finally {
          setLoadingComplaints(false);
        }
      },

      fetchAreas: async () => {
        const {
          setLoadingAreas,
          setAreas,
          setAreasError,
          getAreaCache,
          setAreaCache,
        } = get();

        try {
          setLoadingAreas(true);
          setAreasError(null);

          // Check cache first
          const cachedAreas = getAreaCache('all-areas');
          if (cachedAreas) {
            setAreas(cachedAreas);
            setLoadingAreas(false);
            return;
          }

          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL || 'https://kyoungwon-proxy.onrender.com/api'}/areas`
          );
          const areas = response.data;

          setAreas(areas);
          setAreaCache('all-areas', areas);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch areas';
          setAreasError(errorMessage);
          console.error('Failed to fetch areas:', error);
        } finally {
          setLoadingAreas(false);
        }
      },

      submitComplaint: async (complaintData) => {
        const { addComplaint, setComplaintsError } = get();

        try {
          setComplaintsError(null);

          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'https://kyoungwon-proxy.onrender.com/api'}/complaints`,
            complaintData
          );
          const newComplaint = response.data;

          addComplaint(newComplaint);
          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to submit complaint';
          setComplaintsError(errorMessage);
          console.error('Failed to submit complaint:', error);
          return false;
        }
      },

      getAddressFrequency: async (address) => {
        const { getAddressCache, setAddressCache } = get();

        // Check cache first
        const cached = getAddressCache(`frequency-${address}`);
        if (cached !== null) {
          return cached;
        }

        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL || 'https://kyoungwon-proxy.onrender.com/api'}/complaints/frequency`,
            {
              params: { address },
            }
          );

          const frequency = response.data.numberOfComplaints || 0;
          setAddressCache(`frequency-${address}`, frequency);
          return frequency;
        } catch (error) {
          console.error('Failed to get address frequency:', error);
          return 0;
        }
      },

      // Helper actions
      resetData: () =>
        set({
          complaints: [],
          areas: [],
          addressCache: new Map(),
          areaCache: new Map(),
          isLoadingComplaints: false,
          isLoadingAreas: false,
          complaintsError: null,
          areasError: null,
        }),
    }),
    {
      name: 'complaint-data-storage', // localStorage key
      // Only persist data, not cache or loading states
      partialize: (state) => ({
        complaints: state.complaints,
        areas: state.areas,
      }),
      // Custom storage to handle Map serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          if (parsed.state) {
            parsed.state.addressCache = new Map();
            parsed.state.areaCache = new Map();
          }
          return parsed;
        },
        setItem: (name, value) => {
          const toStore = { ...value };
          if (toStore.state) {
            // Clear cache properties if they exist
            if ('addressCache' in toStore.state) {
              (toStore.state as Record<string, unknown>).addressCache = {};
            }
            if ('areaCache' in toStore.state) {
              (toStore.state as Record<string, unknown>).areaCache = {};
            }
          }
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
