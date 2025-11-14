import axios from 'axios';

import apiClient from '@/lib/api';
import type {
  DriverFormData,
  TeamFormData,
  VehicleFormData,
} from '@/types/transport';

import { uploadFilesToCloudflare } from './fileUploadService';

// ============================================================================
// Helper Functions for Common Operations
// ============================================================================

/**
 * Generic error handler for API calls
 * @param error - The error object from axios
 * @param defaultMessage - Default error message if no specific error found
 * @param context - Context for logging (e.g., '차량 등록', '기사 삭제')
 * @param fallbackData - Optional fallback data to return on error
 */
function handleApiError<T extends { message: string }>(
  error: unknown,
  defaultMessage: string,
  context: string,
  fallbackData?: Partial<T>
): T {
  console.error(`transport service - ${context} 실패:`, error);

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    if (status === 400) {
      return {
        message: '잘못된 요청입니다. 입력한 정보를 확인해주세요.',
        ...fallbackData,
      } as T;
    } else if (status === 404) {
      let notFoundMessage = '항목을 찾을 수 없습니다.';
      if (context.includes('기사')) {
        notFoundMessage = '기사를 찾을 수 없습니다.';
      } else if (context.includes('차량')) {
        notFoundMessage = '차량을 찾을 수 없습니다.';
      }
      return {
        message: notFoundMessage,
        ...fallbackData,
      } as T;
    } else if (status === 500) {
      return {
        message: '서버 오류가 발생했습니다.',
        ...fallbackData,
      } as T;
    } else if (serverMessage) {
      return {
        message: serverMessage,
        ...fallbackData,
      } as T;
    }
  }

  return {
    message: defaultMessage,
    ...fallbackData,
  } as T;
}

/**
 * Process file uploads for create/update operations
 * @param uploadedFiles - Array of files from form data
 * @param category - Category for file upload ('driver' | 'truck')
 * @param originalFile - Optional original file info for update operations
 * @returns Object info with objectKey and filenameOriginal, or undefined
 */
async function processFileUpload(
  uploadedFiles: Array<{ file?: File; url?: string; name?: string }>,
  category: 'driver' | 'truck',
  originalFile?: { objectKey: string; filenameOriginal: string }
): Promise<{ objectKey: string; filenameOriginal: string } | undefined> {
  // Check for new files that need to be uploaded
  const filesToUpload = uploadedFiles.filter((file) => file.file && !file.url);

  if (filesToUpload.length > 0) {
    // Upload new files to Cloudflare
    const fileObjects = filesToUpload
      .map((f) => f.file)
      .filter((f): f is File => f !== undefined);

    const uploadedFiles = await uploadFilesToCloudflare(fileObjects, category);

    if (uploadedFiles.length > 0) {
      const firstFile = uploadedFiles[0];
      return {
        objectKey: firstFile.key,
        filenameOriginal: firstFile.originalName,
      };
    }
  } else {
    // Check if files were already uploaded or if file changed
    const alreadyUploaded = uploadedFiles.find((f) => f.url);

    if (alreadyUploaded) {
      // For update operations, check if file changed
      if (originalFile) {
        const fileChanged =
          alreadyUploaded.url !== originalFile.objectKey &&
          alreadyUploaded.name;

        if (fileChanged && alreadyUploaded.name) {
          return {
            objectKey: alreadyUploaded.url || '',
            filenameOriginal: alreadyUploaded.name,
          };
        }
        // File unchanged, don't include objectInfo
        return undefined;
      }

      // For create operations, use existing file
      if (alreadyUploaded.name) {
        return {
          objectKey: alreadyUploaded.url || '',
          filenameOriginal: alreadyUploaded.name,
        };
      }
    }
  }

  return undefined;
}

/**
 * Get default driver error response
 */
function getDefaultDriverError(): DriverApiResponseSingle['driver'] {
  return {
    id: 0,
    name: '',
    phone_no: '',
    team_nms: [],
    files: [],
    presigned_links: [],
  };
}

/**
 * Get default team error response
 */
function getDefaultTeamError(): TeamApiResponseSingle['team'] {
  return {
    id: 0,
    category: '',
    team_nm: '',
    trucks: [],
    official_regions: [],
    drivers: [],
  };
}

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

export interface DriverApiResponseSingle {
  message: string;
  driver: {
    id: number;
    name: string;
    phone_no: string;
    team_nms: string[];
    files: Array<{
      id: number;
      objectKey: string;
      contentType: string;
      contentLength: string;
      filenameOriginal: string;
      createdAt: string;
    }>;
    presigned_links: Array<{
      key: string;
      url: string;
    }>;
  };
}

export interface UpdateDriverApiRequest {
  category: string;
  team_nm: string;
  official_region_nms: string[];
  truck_nos: string[];
  objectInfo?: {
    objectKey: string;
    filenameOriginal: string;
  };
}

export interface UpdateDriverApiResponse {
  message: string;
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

export interface TeamsApiResponse {
  message: string;
  teams: Array<{
    id: number;
    category: string;
    team_nm: string;
    trucks: string[];
    official_regions: string[];
    drivers: Array<{
      id: number;
      name: string;
      phone_no: string;
    }>;
  }>;
}

export interface DeleteTeamApiResponse {
  message: string;
}

export interface DeleteDriverApiResponse {
  message: string;
}

export interface DriversApiResponse {
  message: string;
  drivers_extended: Array<{
    id: number;
    name: string;
    phone_no: string;
    team_nms: string[];
    presigned_links: Array<{
      key: string;
      url: string;
    }>;
  }>;
}

export interface TeamApiResponseSingle {
  message: string;
  team: {
    id: number;
    category: string;
    team_nm: string;
    trucks: string[];
    official_regions: string[];
    drivers: Array<{
      id: number;
      name: string;
      phone_no: string;
    }>;
  };
}

export interface UpdateTeamApiRequest {
  category: string;
  team_nm: string;
  official_region_nms: string[];
  truck_nos: string[];
  driver_nms: string[];
}

export interface UpdateTeamApiResponse {
  message: string;
}

export interface VehiclesApiResponse {
  message: string;
  trucks: Array<{
    id: number;
    truck_no: string;
    brand_nm: string;
    size: string;
    year: string;
    status: string;
    presigned_links?: Array<{
      key: string;
      url: string;
    }>;
    drivers?: Array<{ id: number; name: string; phone_no: string }>;
    teams?: Array<{ id: number; team_nm: string; category: string }>;
  }>;
}

export interface DeleteVehicleApiResponse {
  message: string;
}

export interface VehicleApiResponseSingle {
  message: string;
  truck: {
    id: number;
    truck_no: string;
    brand_nm: string;
    size: string;
    year: string;
    status: string;
    presigned_link?: string;
    files?: Array<{
      id: number;
      objectKey: string;
      contentType: string;
      contentLength: string;
      filenameOriginal: string;
      createdAt: string;
    }>;
  };
}

export interface UpdateVehicleApiRequest {
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

export interface UpdateVehicleApiResponse {
  message: string;
}

export const transportService = {
  createVehicle: async (
    formData: VehicleFormData
  ): Promise<VehicleApiResponse> => {
    try {
      const objectInfo = await processFileUpload(
        formData.uploadedFiles,
        'truck'
      );

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
      return handleApiError<VehicleApiResponse>(
        error,
        '차량 등록 중 오류가 발생했습니다.',
        '차량 등록'
      );
    }
  },

  createDriver: async (
    formData: DriverFormData
  ): Promise<DriverApiResponse> => {
    try {
      const objectInfo = await processFileUpload(
        formData.uploadedFiles,
        'driver'
      );

      const apiData: DriverApiRequest = {
        name: formData.name,
        phone_no: formData.phoneNum,
        team_nms: formData.selectedTeam,
        ...(objectInfo && { objectInfo }),
      };

      const response = await apiClient.post<DriverApiResponse>(
        '/tempDriver/create',
        apiData
      );

      return response.data;
    } catch (error) {
      return handleApiError<DriverApiResponse>(
        error,
        '기사 등록 중 오류가 발생했습니다.',
        '기사 등록'
      );
    }
  },

  deleteDriver: async (id: number): Promise<DeleteDriverApiResponse> => {
    try {
      const response = await apiClient.delete<DeleteDriverApiResponse>(
        `/tempDriver/delete/${id}`,
        {
          data: { id },
        }
      );

      return response.data;
    } catch (error) {
      return handleApiError<DeleteDriverApiResponse>(
        error,
        '기사 삭제 중 오류가 발생했습니다.',
        '기사 삭제'
      );
    }
  },

  getAllDrivers: async (): Promise<DriversApiResponse> => {
    try {
      const response =
        await apiClient.get<DriversApiResponse>('/tempDriver/getAll');

      console.log('getAllDrivers', response.data);

      return response.data;
    } catch (error) {
      return handleApiError<DriversApiResponse>(
        error,
        '기사 목록 불러오기 중 오류가 발생했습니다.',
        '기사 목록 불러오기',
        { drivers_extended: [] }
      );
    }
  },

  getDriverById: async (id: number): Promise<DriverApiResponseSingle> => {
    try {
      const response = await apiClient.get<DriverApiResponseSingle>(
        `/tempDriver/get/${id}`
      );

      return response.data;
    } catch (error) {
      return handleApiError<DriverApiResponseSingle>(
        error,
        '기사 정보 불러오기 중 오류가 발생했습니다.',
        '기사 정보 불러오기',
        { driver: getDefaultDriverError() }
      );
    }
  },

  updateDriver: async (
    id: number,
    formData: {
      category?: string;
      team_nm?: string;
      official_region_nms?: string[];
      truck_nos?: string[];
      uploadedFiles?: Array<{ file?: File; url?: string; name?: string }>;
      originalFile?: { objectKey: string; filenameOriginal: string };
    }
  ): Promise<UpdateDriverApiResponse> => {
    try {
      const apiData: Partial<UpdateDriverApiRequest> = {};

      // Only include fields that are provided
      if (formData.category !== undefined) {
        apiData.category = formData.category;
      }
      if (formData.team_nm !== undefined) {
        apiData.team_nm = formData.team_nm;
      }
      if (formData.official_region_nms !== undefined) {
        apiData.official_region_nms = formData.official_region_nms;
      }
      if (formData.truck_nos !== undefined) {
        apiData.truck_nos = formData.truck_nos;
      }

      // Handle file upload if provided
      if (formData.uploadedFiles) {
        const objectInfo = await processFileUpload(
          formData.uploadedFiles,
          'driver',
          formData.originalFile
        );
        if (objectInfo) {
          apiData.objectInfo = objectInfo;
        }
      }

      // Remove undefined fields to send only changed fields
      const cleanedApiData: Partial<UpdateDriverApiRequest> = {};
      if (apiData.category !== undefined)
        cleanedApiData.category = apiData.category;
      if (apiData.team_nm !== undefined)
        cleanedApiData.team_nm = apiData.team_nm;
      if (apiData.official_region_nms !== undefined)
        cleanedApiData.official_region_nms = apiData.official_region_nms;
      if (apiData.truck_nos !== undefined)
        cleanedApiData.truck_nos = apiData.truck_nos;
      if (apiData.objectInfo !== undefined)
        cleanedApiData.objectInfo = apiData.objectInfo;

      console.log('🟢 transportService.updateDriver - Final API Request:', {
        endpoint: `/tempDriver/edit/${id}`,
        method: 'PATCH',
        payload: cleanedApiData,
        id: id,
        hasBearerToken: !!localStorage.getItem('userToken'),
      });

      const response = await apiClient.patch<UpdateDriverApiResponse>(
        `/tempDriver/edit/${id}`,
        cleanedApiData
      );

      return response.data;
    } catch (error) {
      return handleApiError<UpdateDriverApiResponse>(
        error,
        '기사 수정 중 오류가 발생했습니다.',
        '기사 수정'
      );
    }
  },

  createTeam: async (formData: TeamFormData): Promise<TeamApiResponse> => {
    try {
      const apiData: TeamApiRequest = {
        team_nm: formData.teamName,
        category: formData.category,
        official_region_nms: formData.regions,
        truck_nos: formData.selectedVehicles,
        driver_nms: formData.selectedDrivers,
      };

      const response = await apiClient.post<TeamApiResponse>(
        '/tempTeam/create',
        apiData
      );

      return response.data;
    } catch (error) {
      return handleApiError<TeamApiResponse>(
        error,
        '팀 등록 중 오류가 발생했습니다.',
        '팀 등록'
      );
    }
  },

  getAllTeams: async (): Promise<TeamsApiResponse> => {
    try {
      const response =
        await apiClient.get<TeamsApiResponse>('/tempTeam/getAll');

      console.log('getAllTeams:', response.data);

      return response.data;
    } catch (error) {
      return handleApiError<TeamsApiResponse>(
        error,
        '팀 목록 불러오기 중 오류가 발생했습니다.',
        '팀 목록 불러오기',
        { teams: [] }
      );
    }
  },

  deleteTeam: async (id: number): Promise<DeleteTeamApiResponse> => {
    try {
      const response = await apiClient.delete<DeleteTeamApiResponse>(
        `/tempTeam/delete/${id}`,
        {
          data: { id },
        }
      );

      return response.data;
    } catch (error) {
      return handleApiError<DeleteTeamApiResponse>(
        error,
        '팀 삭제 중 오류가 발생했습니다.',
        '팀 삭제'
      );
    }
  },

  getTeamById: async (id: number): Promise<TeamApiResponseSingle> => {
    try {
      const response =
        await apiClient.get<TeamsApiResponse>('/tempTeam/getAll');

      const team = response.data.teams?.find((t) => t.id === id);

      if (!team) {
        return {
          message: '팀을 찾을 수 없습니다.',
          team: getDefaultTeamError(),
        };
      }

      return {
        message: response.data.message || '팀 정보를 불러왔습니다.',
        team,
      };
    } catch (error) {
      return handleApiError<TeamApiResponseSingle>(
        error,
        '팀 정보 불러오기 중 오류가 발생했습니다.',
        '팀 정보 불러오기',
        { team: getDefaultTeamError() }
      );
    }
  },

  updateTeam: async (
    id: number,
    formData: TeamFormData | Partial<UpdateTeamApiRequest>
  ): Promise<UpdateTeamApiResponse> => {
    try {
      // Check if formData is already in API format (partial update)
      // Check for any API field name (team_nm, category, official_region_nms, truck_nos, driver_nms)
      const isPartialUpdate =
        'team_nm' in formData ||
        'category' in formData ||
        'official_region_nms' in formData ||
        'truck_nos' in formData ||
        'driver_nms' in formData;

      const apiData: Partial<UpdateTeamApiRequest> = isPartialUpdate
        ? (formData as Partial<UpdateTeamApiRequest>)
        : {
            category: (formData as TeamFormData).category,
            team_nm: (formData as TeamFormData).teamName,
            official_region_nms: (formData as TeamFormData).regions,
            truck_nos: (formData as TeamFormData).selectedVehicles,
            driver_nms: (formData as TeamFormData).selectedDrivers,
          };

      // Remove undefined fields to send only changed fields
      const cleanedApiData: Partial<UpdateTeamApiRequest> = {};
      if (apiData.category !== undefined)
        cleanedApiData.category = apiData.category;
      if (apiData.team_nm !== undefined)
        cleanedApiData.team_nm = apiData.team_nm;
      if (apiData.official_region_nms !== undefined)
        cleanedApiData.official_region_nms = apiData.official_region_nms;
      if (apiData.truck_nos !== undefined)
        cleanedApiData.truck_nos = apiData.truck_nos;
      if (apiData.driver_nms !== undefined)
        cleanedApiData.driver_nms = apiData.driver_nms;

      console.log('🔵 transportService.updateTeam - Final API Request:', {
        endpoint: `/tempTeam/edit/${id}`,
        method: 'PATCH',
        payload: cleanedApiData,
        id: id,
        hasBearerToken: !!localStorage.getItem('userToken'),
      });

      const response = await apiClient.patch<UpdateTeamApiResponse>(
        `/tempTeam/edit/${id}`,
        cleanedApiData
      );

      return response.data;
    } catch (error) {
      return handleApiError<UpdateTeamApiResponse>(
        error,
        '팀 수정 중 오류가 발생했습니다.',
        '팀 수정'
      );
    }
  },

  getAllVehicles: async (): Promise<VehiclesApiResponse> => {
    try {
      const response =
        await apiClient.get<VehiclesApiResponse>('/tempTruck/getAll');

      console.log('getAllVehicles:', response.data);

      return response.data;
    } catch (error) {
      return handleApiError<VehiclesApiResponse>(
        error,
        '차량 목록 불러오기 중 오류가 발생했습니다.',
        '차량 목록 불러오기',
        { trucks: [] }
      );
    }
  },

  deleteVehicle: async (id: number): Promise<DeleteVehicleApiResponse> => {
    try {
      const response = await apiClient.delete<DeleteVehicleApiResponse>(
        `/tempTruck/delete/${id}`,
        {
          data: { id },
        }
      );

      return response.data;
    } catch (error) {
      return handleApiError<DeleteVehicleApiResponse>(
        error,
        '차량 삭제 중 오류가 발생했습니다.',
        '차량 삭제'
      );
    }
  },

  getVehicleById: async (id: number): Promise<VehicleApiResponseSingle> => {
    try {
      const response =
        await apiClient.get<VehiclesApiResponse>('/tempTruck/getAll');

      const truck = response.data.trucks?.find((t) => t.id === id);

      if (!truck) {
        return {
          message: '차량을 찾을 수 없습니다.',
          truck: {
            id: 0,
            truck_no: '',
            brand_nm: '',
            size: '',
            year: '',
            status: 'okay',
            files: [],
          },
        };
      }

      // Extract presigned_link from presigned_links array if available
      const presignedLink =
        truck.presigned_links && truck.presigned_links.length > 0
          ? truck.presigned_links[0].url
          : undefined;

      return {
        message: response.data.message || '차량 정보를 불러왔습니다.',
        truck: {
          id: truck.id,
          truck_no: truck.truck_no,
          brand_nm: truck.brand_nm,
          size: truck.size,
          year: truck.year,
          status: truck.status,
          presigned_link: presignedLink,
          files: [],
        },
      };
    } catch (error) {
      return handleApiError<VehicleApiResponseSingle>(
        error,
        '차량 정보 불러오기 중 오류가 발생했습니다.',
        '차량 정보 불러오기',
        {
          truck: {
            id: 0,
            truck_no: '',
            brand_nm: '',
            size: '',
            year: '',
            status: 'okay',
            files: [],
          },
        }
      );
    }
  },

  updateVehicle: async (
    id: number,
    formData:
      | {
          vehicleType: string;
          vehicleNum: string;
          ton: string;
          vehicleYear: string;
          broken: boolean;
          uploadedFiles: Array<{ file?: File; url?: string; name?: string }>;
          originalFile?: { objectKey: string; filenameOriginal: string };
        }
      | (Partial<UpdateVehicleApiRequest> & {
          uploadedFiles?: Array<{
            file?: File;
            url?: string;
            name?: string;
          }>;
          originalFile?: { objectKey: string; filenameOriginal: string };
        })
  ): Promise<UpdateVehicleApiResponse> => {
    try {
      // Check if formData is already in API format (partial update)
      const isPartialUpdate =
        'truck_no' in formData ||
        'brand_nm' in formData ||
        'size' in formData ||
        'year' in formData ||
        'status' in formData;

      const apiData: Partial<UpdateVehicleApiRequest> = {};

      if (isPartialUpdate) {
        // Handle partial update (API format)
        const partialData = formData as Partial<UpdateVehicleApiRequest> & {
          uploadedFiles?: Array<{ file?: File; url?: string; name?: string }>;
          originalFile?: { objectKey: string; filenameOriginal: string };
        };

        if (partialData.truck_no !== undefined) {
          apiData.truck_no = partialData.truck_no;
        }
        if (partialData.brand_nm !== undefined) {
          apiData.brand_nm = partialData.brand_nm;
        }
        if (partialData.size !== undefined) {
          apiData.size = partialData.size;
        }
        if (partialData.year !== undefined) {
          apiData.year = partialData.year;
        }
        if (partialData.status !== undefined) {
          apiData.status = partialData.status;
        }

        // Handle file upload if provided
        if (partialData.uploadedFiles) {
          const objectInfo = await processFileUpload(
            partialData.uploadedFiles,
            'truck',
            partialData.originalFile
          );
          if (objectInfo) {
            apiData.objectInfo = objectInfo;
          }
        }
      } else {
        // Handle full update (form format)
        const fullData = formData as {
          vehicleType: string;
          vehicleNum: string;
          ton: string;
          vehicleYear: string;
          broken: boolean;
          uploadedFiles: Array<{ file?: File; url?: string; name?: string }>;
          originalFile?: { objectKey: string; filenameOriginal: string };
        };

        const objectInfo = await processFileUpload(
          fullData.uploadedFiles,
          'truck',
          fullData.originalFile
        );

        apiData.truck_no = fullData.vehicleNum;
        apiData.brand_nm = fullData.vehicleType;
        apiData.size = fullData.ton;
        apiData.year = fullData.vehicleYear;
        apiData.status = fullData.broken ? 'broken' : 'okay';
        if (objectInfo) {
          apiData.objectInfo = objectInfo;
        }
      }

      // Remove undefined fields to send only changed fields
      const cleanedApiData: Partial<UpdateVehicleApiRequest> = {};
      if (apiData.truck_no !== undefined)
        cleanedApiData.truck_no = apiData.truck_no;
      if (apiData.brand_nm !== undefined)
        cleanedApiData.brand_nm = apiData.brand_nm;
      if (apiData.size !== undefined) cleanedApiData.size = apiData.size;
      if (apiData.year !== undefined) cleanedApiData.year = apiData.year;
      if (apiData.status !== undefined) cleanedApiData.status = apiData.status;
      if (apiData.objectInfo !== undefined)
        cleanedApiData.objectInfo = apiData.objectInfo;

      console.log('🟡 transportService.updateVehicle - Final API Request:', {
        endpoint: `/tempTruck/edit/${id}`,
        method: 'PATCH',
        payload: cleanedApiData,
        id: id,
        hasBearerToken: !!localStorage.getItem('userToken'),
      });

      const response = await apiClient.patch<UpdateVehicleApiResponse>(
        `/tempTruck/edit/${id}`,
        cleanedApiData
      );

      return response.data;
    } catch (error) {
      return handleApiError<UpdateVehicleApiResponse>(
        error,
        '차량 수정 중 오류가 발생했습니다.',
        '차량 수정'
      );
    }
  },
};
