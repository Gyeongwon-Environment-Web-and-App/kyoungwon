// stores/complaintFormStore.ts
import { create } from 'zustand';

import apiClient from '@/lib/api';

import {
  type Complaint,
  type ComplaintExtended,
  type ComplaintFormData,
  type DriverData,
  type DriverDataResponse,
} from '../types/complaint';

// Define address interface for type safety
interface AddressData {
  roadAddress: string;
  jibunAddress: string;
  englishAddress: string;
  x: string;
  y: string;
  name?: string;
}

// Step 1: Define the state interface
interface ComplaintFormState {
  // Form data
  formData: ComplaintFormData;
  driverData: DriverData;

  // UI state
  showAddressSearch: boolean;
  addresses: AddressData[];
  loading: boolean;
  error: string | null;
  tempAddress: string;

  // Actions (functions that update state)
  updateFormData: (updates: Partial<ComplaintFormData>) => void;
  setShowAddressSearch: (show: boolean) => void;
  setAddresses: (addresses: AddressData[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTempAddress: (address: string) => void;
  resetForm: () => void;
  fetchDriverData: (
    address: string,
    categories: string[],
    coordinates?: { x_coord: number; y_coord: number }
  ) => Promise<void>;
  setDriverData: (data: DriverData) => void;
  resetDriverData: () => void;

  // Edit mode actions
  populateFormForEdit: (complaintData: Complaint | ComplaintExtended) => void;
}

// Step 2: Initial form data
const initialFormData: ComplaintFormData = {
  address: '',
  datetime: new Date().toISOString(),
  categories: [],
  type: '',
  content: '',
  route: '',
  source: {
    phone_no: '',
    bad: false,
  },
  notify: {
    usernames: [],
  },
  uploadedFiles: [],
};

const initialDriverData: DriverData = {
  teams: [],
  loading: false,
  error: null,
};

// Step 3: Create the store
export const useComplaintFormStore = create<ComplaintFormState>()((set) => ({
  // Initial state
  formData: initialFormData,
  showAddressSearch: false,
  addresses: [],
  loading: false,
  error: null,
  tempAddress: '',
  driverData: initialDriverData,

  // Actions
  updateFormData: (updates) =>
    set((state) => ({
      formData: { ...state.formData, ...updates },
    })),

  setShowAddressSearch: (show) => set({ showAddressSearch: show }),

  setAddresses: (addresses) => set({ addresses }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setTempAddress: (address) => set({ tempAddress: address }),

  resetForm: () =>
    set({
      formData: initialFormData,
      driverData: initialDriverData,
      showAddressSearch: false,
      addresses: [],
      loading: false,
      error: null,
      tempAddress: '',
    }),

  // Edit mode actions
  populateFormForEdit: (complaintData) =>
    set(() => {
      const address =
        'address' in complaintData
          ? typeof complaintData.address === 'string'
            ? complaintData.address
            : complaintData.address?.address || ''
          : '';

      const uploadedFiles =
        'presigned_links' in complaintData && complaintData.presigned_links
          ? complaintData.presigned_links.map((link) => ({
              name: link.key.split('/').pop() || 'file',
              url: link.key,
              type: '',
              size: 0,
              previewUrl: link.url,
            }))
          : [];

      const formData = {
        address: address,
        datetime: complaintData.datetime || new Date().toISOString(),
        categories: complaintData.category ? [complaintData.category] : [],
        type: complaintData.type || '',
        content: complaintData.content || '',
        route: complaintData.route || '',
        source: {
          phone_no: complaintData.source?.phone_no || '',
          bad: complaintData.source?.bad || false,
        },
        notify: {
          usernames: [],
        },
        uploadedFiles: uploadedFiles,
        coordinates: undefined,
      };

      return {
        formData,
        tempAddress: formData.address,
      };
    }),

  // 차량 기사 정보 가져오기
  fetchDriverData: async (
    address: string,
    categories: string[],
    coordinates?: { x_coord: number; y_coord: number }
  ) => {
    set((state) => ({
      driverData: { ...state.driverData, loading: true, error: null },
    }));

    try {
      // Build payload with new API format
      const payload: {
        address: string;
        coordinates?: { x_coord: number; y_coord: number };
        categories: string[];
      } = {
        address,
        categories,
      };

      // Include coordinates if available
      if (coordinates) {
        payload.coordinates = coordinates;
      }

      const response = await apiClient.post<DriverDataResponse>(
        '/complaint/getTeamsDriversForComplaint',
        payload
      );

      console.log(response);

      set((state) => ({
        driverData: {
          ...state.driverData,
          teams: response.data.teams,
          loading: false,
          error: null,
        },
      }));
    } catch (error) {
      set((state) => ({
        driverData: {
          ...state.driverData,
          loading: false,
          error: `드라이버 정보를 가져오는데 실패했습니다: ${error}`,
        },
      }));
    }
  },

  setDriverData: (data) => set({ driverData: data }),

  resetDriverData: () => set({ driverData: initialDriverData }),
}));
