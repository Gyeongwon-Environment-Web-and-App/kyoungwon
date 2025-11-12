import type { DateRange } from 'react-day-picker';

import apiClient from '@/lib/api';
import {
  type Address,
  type Complaint,
  type ComplaintApiResponse,
  type ComplaintByIdApiResponse,
  type ComplaintExtended,
  type ComplaintForCategory,
} from '@/types/complaint';

// Map API response structure
interface MapComplaint {
  id: number;
  address: Address;
  phone_no: string;
  category: string;
  truck_no: string;
  datetime: string;
  content: string;
  status: string;
  type: string;
  route: string;
  bad: boolean;
  files: string[];
}

const formatDate = (date: Date): string => {
  // Ensure we have a valid Date object
  const dateObj = date instanceof Date ? date : new Date(date);

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }

  return dateObj.toISOString();
};

const getDateRangeFromPicker = (dateRange: DateRange | undefined) => {
  const today = new Date();

  if (!dateRange?.from || !dateRange?.to) {
    // Default: one month before to today
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    return {
      startDate: formatDate(oneMonthAgo),
      endDate: formatDate(today),
    };
  }

  return {
    startDate: formatDate(dateRange.from),
    endDate: formatDate(dateRange.to),
  };
};

// Helper function to convert ComplaintExtended to Complaint
const convertComplaintExtendedToComplaint = (
  complaintExtended: ComplaintExtended
): Complaint => {
  if (!complaintExtended) {
    throw new Error('complaintExtended is null or undefined');
  }

  if (!complaintExtended.address) {
    throw new Error('complaintExtended.address is null or undefined');
  }

  return {
    id: complaintExtended.id,
    address: complaintExtended.address,
    datetime: complaintExtended.datetime,
    category:
      complaintExtended.teams.map((team) => team.category).filter(Boolean)[0] ||
      '기타',
    type: complaintExtended.type,
    content: complaintExtended.content,
    route: complaintExtended.route,
    source: complaintExtended.source,
    notify: {
      usernames: complaintExtended.teams.flatMap((team) =>
        team.drivers.map((driver) => driver.name)
      ),
    },
    status: complaintExtended.status,
    bad: complaintExtended.bad,
    user: complaintExtended.user,
    teams: complaintExtended.teams,
    presigned_links: complaintExtended.presigned_links || [],
  };
};

const convertComplaintForCategoryToComplaint = (
  complaintForCategory: ComplaintForCategory
): Complaint => {
  if (!complaintForCategory) {
    throw new Error('complaintForCategory is null or undefined');
  }

  if (!complaintForCategory.address) {
    throw new Error('complaintForCategory.address is null or undefined');
  }

  return {
    id: complaintForCategory.id,
    address: complaintForCategory.address,
    datetime: complaintForCategory.datetime,
    category:
      complaintForCategory.teams.map((team) => team.category)[0] || '기타',
    type: complaintForCategory.type,
    content: complaintForCategory.content,
    route: complaintForCategory.route,
    source: complaintForCategory.source,
    notify: {
      usernames: [],
    },
    status: complaintForCategory.status,
    bad: complaintForCategory.bad,
    user: {
      name: complaintForCategory.user.name,
      serial_no: complaintForCategory.user.serial_no,
      phone_no: '',
    },
    teams: complaintForCategory.teams.map((team) => ({
      ...team,
      drivers: [],
    })),
    presigned_links: [],
  };
};

// Helper function to convert MapComplaint to Complaint
const convertMapComplaintToComplaint = (
  mapComplaint: MapComplaint
): Complaint => {
  if (!mapComplaint) {
    throw new Error('mapComplaint is null or undefined');
  }

  return {
    id: mapComplaint.id,
    address: mapComplaint.address,
    datetime: mapComplaint.datetime,
    category: mapComplaint.category,
    type: mapComplaint.type,
    content: mapComplaint.content,
    route: mapComplaint.route,
    source: {
      phone_no: mapComplaint.phone_no,
      bad: mapComplaint.bad,
    },
    notify: {
      usernames: [],
    },
    status: mapComplaint.status === 'true',
    bad: mapComplaint.bad,
    user: {
      name: '',
      serial_no: '',
      phone_no: mapComplaint.phone_no,
    },
    teams: [
      {
        id: 0,
        category: mapComplaint.category,
        team_nm: '',
        drivers: [],
      },
    ],
    presigned_links: [],
  };
};

export const complaintService = {
  async getComplaintsByCategoryAndOrDates(
    dateRange?: DateRange,
    category?: string
  ): Promise<Complaint[]> {
    try {
      const dateRangeRequest = getDateRangeFromPicker(dateRange);

      const requestBody: {
        startDate: string;
        endDate: string;
        category?: string;
      } = {
        startDate: dateRangeRequest.startDate,
        endDate: dateRangeRequest.endDate,
      };

      // Only include category if it's provided and not 'all'
      if (category && category !== 'all') {
        requestBody.category = category;
      }

      console.log('🌐 API Call: /complaint/getByCategoryAndOrDates', {
        requestBody,
        timestamp: new Date().toISOString(),
      });

      const response = await apiClient.post<ComplaintApiResponse>(
        '/complaint/getByCategoryAndOrDates',
        requestBody
      );

      console.log('📡 API Response for getByCategoryAndOrDates:', {
        rawResponse: response.data,
        timestamp: new Date().toISOString(),
      });

      // Convert the API response to the expected format
      const complaints = response.data.complaints_extended.map(
        convertComplaintExtendedToComplaint
      );

      console.log('🔄 Converted complaints:', {
        complaints,
        count: complaints.length,
        timestamp: new Date().toISOString(),
      });

      return complaints;
    } catch (error) {
      console.error(
        'Error fetching complaints by category and/or dates:',
        error
      );
      throw error;
    }
  },

  async getComplaintById(id: string): Promise<Complaint> {
    try {
      console.log('🌐 API Call: /complaint/getById/' + id, {
        timestamp: new Date().toISOString(),
      });

      const response = await apiClient.get<ComplaintByIdApiResponse>(
        `/complaint/getById/${id}`
      );

      console.log('📡 API Response for getById:', {
        rawResponse: response.data,
        timestamp: new Date().toISOString(),
      });

      if (!response.data) {
        throw new Error('API response data is null or undefined');
      }

      if (!response.data.complaint_extended) {
        throw new Error('API response missing complaint_extended property');
      }

      const convertedComplaint = convertComplaintExtendedToComplaint(
        response.data.complaint_extended
      );

      console.log('🔄 Converted complaint for getById:', {
        convertedComplaint,
        category: convertedComplaint.category,
        timestamp: new Date().toISOString(),
      });

      return convertedComplaint;
    } catch (error) {
      console.error('Error in getComplaintById:', error);
      throw error;
    }
  },

  async updateComplaint(
    id: number,
    updates: {
      phone_no?: string;
      content?: string;
      type?: string;
      route?: string;
      status?: boolean | null;
    }
  ): Promise<void> {
    try {
      await apiClient.patch(`/complaint/edit/${id}`, updates);
    } catch (error) {
      console.error(`Error updating complaint ${id}:`, error);
      throw error;
    }
  },

  async deleteComplaints(ids: number[]): Promise<void> {
    try {
      await apiClient.delete('/complaint/deleteOneOrMany', {
        data: { ids },
      });
    } catch (error) {
      console.error(`Error deleting complaints [${ids.join(', ')}]:`, error);
      throw error;
    }
  },

  async getAllCategories(): Promise<string[]> {
    try {
      console.log('🌐 API Call: /complaint/getAllCategories', {
        timestamp: new Date().toISOString(),
      });

      const response = await apiClient.get('/complaint/getAllCategories');

      console.log('📡 API Response for all categories:', {
        rawResponse: response.data,
        timestamp: new Date().toISOString(),
      });

      // Filter to only include allowed categories
      const allowedCategories = ['음식물', '재활용', '생활', '기타'];
      const categories = response.data.categories || response.data || [];

      const filteredCategories = categories.filter((category: string) =>
        allowedCategories.includes(category)
      );

      console.log('🔄 Filtered categories:', {
        allCategories: categories,
        filteredCategories,
        timestamp: new Date().toISOString(),
      });

      return filteredCategories;
    } catch (error) {
      console.error('Error fetching all categories:', error);
      // Return fallback categories if API fails
      return ['음식물', '재활용', '생활', '기타'];
    }
  },

  async getComplaintsForMap(categories: string[]): Promise<Complaint[]> {
    try {
      console.log('🌐 API Call: /map/getRecentComplaintsByCategories', {
        categories,
        timestamp: new Date().toISOString(),
      });

      const response = await apiClient.post(
        '/map/getRecentComplaintsByCategories',
        {
          categories: categories,
        }
      );

      console.log('📡 API Response for map categories:', {
        rawResponse: response.data,
        timestamp: new Date().toISOString(),
      });

      // Handle different possible response structures
      let complaints: Complaint[] = [];

      if (response.data.data && Array.isArray(response.data.data)) {
        // If response has data array (map API structure: {message: 'OK', data: [...]})
        complaints = response.data.data.map((item: unknown) => {
          return convertMapComplaintToComplaint(item as MapComplaint);
        });
      } else if (Array.isArray(response.data)) {
        complaints = response.data.map((item: unknown) => {
          const itemObj = item as Record<string, unknown>;
          if (
            itemObj &&
            typeof itemObj === 'object' &&
            'address' in itemObj &&
            typeof itemObj.address === 'object'
          ) {
            return convertComplaintExtendedToComplaint(
              item as ComplaintExtended
            );
          } else {
            return convertComplaintForCategoryToComplaint(
              item as ComplaintForCategory
            );
          }
        });
      } else {
        console.error('Unexpected API response structure:', response.data);
        throw new Error('Unexpected API response structure');
      }

      console.log('🔄 Converted complaints for map:', {
        complaints,
        count: complaints.length,
        timestamp: new Date().toISOString(),
      });

      return complaints;
    } catch (error) {
      console.error('Error fetching complaints for map by categories:', error);
      throw error;
    }
  },

  async getComplaintsByNegs(dateRange?: DateRange): Promise<Complaint[]> {
    try {
      const dateRangeRequest = getDateRangeFromPicker(dateRange);

      const requestBody = {
        startDate: dateRangeRequest.startDate,
        endDate: dateRangeRequest.endDate,
      };

      console.log('🌐 API Call: /map/getComplaintsByNegs', {
        requestBody,
        timestamp: new Date().toISOString(),
      });

      const response = await apiClient.post(
        '/map/getComplaintsByNegs',
        requestBody
      );

      console.log('📡 API Response for getComplaintsByNegs:', {
        rawResponse: response.data,
        timestamp: new Date().toISOString(),
      });

      // Handle different possible response structures
      let complaints: Complaint[] = [];

      if (response.data.data && Array.isArray(response.data.data)) {
        // If response has data array (map API structure: {message: 'OK', data: [...]})
        complaints = response.data.data.map((item: unknown) => {
          return convertMapComplaintToComplaint(item as MapComplaint);
        });
      } else if (Array.isArray(response.data)) {
        complaints = response.data.map((item: unknown) => {
          return convertMapComplaintToComplaint(item as MapComplaint);
        });
      } else {
        console.error(
          'Unexpected API response structure for getComplaintsByNegs:',
          response.data
        );
        throw new Error('Unexpected API response structure');
      }

      console.log('🔄 Converted complaints for getComplaintsByNegs:', {
        complaints,
        count: complaints.length,
        timestamp: new Date().toISOString(),
      });

      return complaints;
    } catch (error) {
      console.log('complaint service-getComplaintsByNegs:', error);
      throw error;
    }
  },
};
