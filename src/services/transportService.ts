import axios from 'axios';

import apiClient from '@/lib/api';
import type {
  DriverFormData,
  TeamFormData,
  VehicleFormData,
} from '@/types/transport';

import { uploadFilesToCloudflare } from './fileUploadService';

export interface VehicleApiRequest {
  truck_no: string;
  brand_nm: string;
  size: string;
  year: string;
  status: string;
  objectInfo?: {
    objectKey: string;
    filenameOriginal: string;
  };
}

export interface VehicleApiResponse {
  message: string;
  truck?: {
    id: number;
    truck_no: string;
    brand_nm: string;
    size: string;
    year: string;
    status: string;
    presigned_link: string;
  };
}

export interface DriverApiRequest {
  name: string;
  phone_no: string;
  team_nms: string[];
  objectInfo?: {
    objectKey: string;
    filenameOriginal: string;
  };
}

export interface DriverApiResponse {
  message: string;
  driver?: {
    id: number;
    name: string;
    phone_no: string;
    teams: Array<{ id: number }>;
    files: Array<{
      id: number;
      objectKey: string;
      contentType: string;
      contentLength: string;
      filenameOriginal: string;
      createdAt: string;
    }>;
    presigned_link: string;
  };
}

export interface TeamApiRequest {
  team_nm: string;
  category: string;
  official_region_nms: string[];
  truck_nos: string[];
  driver_nms: string[];
}

export interface TeamApiResponse {
  message: string;
  team?: {
    id: number;
    team_nm: string;
    category: string;
  };
}

export const transportService = {
  createVehicle: async (
    formData: VehicleFormData
  ): Promise<VehicleApiResponse> => {
    try {
      let objectInfo:
        | { objectKey: string; filenameOriginal: string }
        | undefined;

      const filesToUpload = formData.uploadedFiles.filter(
        (file) => file.file && !file.url
      );

      if (filesToUpload.length > 0) {
        const fileObjects = filesToUpload
          .map((f) => f.file)
          .filter((f): f is File => f !== undefined);

        const uploadedFiles = await uploadFilesToCloudflare(
          fileObjects,
          'truck'
        );

        if (uploadedFiles.length > 0) {
          const firstFile = uploadedFiles[0];
          objectInfo = {
            objectKey: firstFile.key,
            filenameOriginal: firstFile.originalName,
          };
        }
      } else {
        const alreadyUploaded = formData.uploadedFiles.find((f) => f.url);
        if (alreadyUploaded) {
          objectInfo = {
            objectKey: alreadyUploaded.url,
            filenameOriginal: alreadyUploaded.name,
          };
        }
      }

      const apiData: VehicleApiRequest = {
        truck_no: formData.vehicleNum,
        brand_nm: formData.vehicleType,
        size: formData.ton,
        year: formData.vehicleYear,
        status: formData.broken ? 'broken' : 'okay',
        ...(objectInfo && { objectInfo }),
      };

      const response = await apiClient.post<VehicleApiResponse>(
        '/tempTruck/create',
        apiData
      );

      return response.data;
    } catch (error) {
      console.error('transport service - 차량 등록 실패:', error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          return {
            message: '잘못된 요청입니다. 입력한 정보를 확인해주세요.',
          };
        } else if (error.response?.status === 500) {
          return {
            message: '서버 오류가 발생했습니다.',
          };
        } else if (error.response?.data?.message) {
          return {
            message: error.response.data.message,
          };
        }
      }

      return {
        message: '차량 등록 중 오류가 발생했습니다.',
      };
    }
  },

  createDriver: async (
    formData: DriverFormData
  ): Promise<DriverApiResponse> => {
    try {
      let objectInfo:
        | { objectKey: string; filenameOriginal: string }
        | undefined;
      // Step 1: Check for files that need to be uploaded
      const filesToUpload = formData.uploadedFiles.filter(
        (file) => file.file && !file.url
      );

      // Step 2: Upload files to Cloudflare if needed
      if (filesToUpload.length > 0) {
        const fileObjects = filesToUpload
          .map((f) => f.file)
          .filter((f): f is File => f !== undefined);

        // Upload to Cloudflare with 'driver' category
        const uploadedFiles = await uploadFilesToCloudflare(
          fileObjects,
          'driver'
        );

        if (uploadedFiles.length > 0) {
          // Use the first file (similar to vehicle - single file)
          const firstFile = uploadedFiles[0];
          objectInfo = {
            objectKey: firstFile.key,
            filenameOriginal: firstFile.originalName,
          };
        }
      } else {
        // Step 3: Check if files were already uploaded
        const alreadyUploaded = formData.uploadedFiles.find((f) => f.url);
        if (alreadyUploaded) {
          objectInfo = {
            objectKey: alreadyUploaded.url,
            filenameOriginal: alreadyUploaded.name,
          };
        }
      }
      // Step 4: Prepare API request data
      const apiData: DriverApiRequest = {
        name: formData.name,
        phone_no: formData.phoneNum,
        team_nms: formData.selectedTeam, // Array of strings like "생활 팀1", "음식물 팀2"
        // Only include objectInfo if file exists
        ...(objectInfo && { objectInfo }),
      };

      // Step 5: Make API call
      const response = await apiClient.post<DriverApiResponse>(
        '/tempDriver/create',
        apiData
      );

      // Step 6: Return the response data directly
      return response.data;
    } catch (error) {
      console.error('transport service - 기사 등록 실패:', error);

      // Step 7: Handle errors
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          return {
            message: '잘못된 요청입니다. 입력한 정보를 확인해주세요.',
          };
        } else if (error.response?.status === 500) {
          return {
            message: '서버 오류가 발생했습니다.',
          };
        } else if (error.response?.data?.message) {
          return {
            message: error.response.data.message,
          };
        }
      }

      return {
        message: '기사 등록 중 오류가 발생했습니다.',
      };
    }
  },

  createTeam: async (formData: TeamFormData): Promise<TeamApiResponse> => {
    try {
      // Step 1: Prepare API request data
      // No file upload needed for teams
      const apiData: TeamApiRequest = {
        team_nm: formData.teamName,
        category: formData.category,
        official_region_nms: formData.regions,
        truck_nos: formData.selectedVehicles,
        driver_nms: formData.selectedDrivers,
      };

      // Step 2: Make API call
      const response = await apiClient.post<TeamApiResponse>(
        '/tempTeam/create',
        apiData
      );

      // Step 3: Return the response data directly
      return response.data;
    } catch (error) {
      console.error('transport service - 팀 등록 실패:', error);

      // Step 4: Handle errors
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          return {
            message: '잘못된 요청입니다. 입력한 정보를 확인해주세요.',
          };
        } else if (error.response?.status === 500) {
          return {
            message: '서버 오류가 발생했습니다.',
          };
        } else if (error.response?.data?.message) {
          return {
            message: error.response.data.message,
          };
        }
      }

      return {
        message: '팀 등록 중 오류가 발생했습니다.',
      };
    }
  },
};
