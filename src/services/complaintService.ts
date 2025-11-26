import type { DateRange } from 'react-day-picker';

import apiClient from '@/lib/api';
import {
  type Address,
  type Complaint,
  type ComplaintApiResponseWithDrivers,
  type ComplaintByIdApiResponse,
  type ComplaintExtended,
  type ComplaintExtendedWithDrivers,
  type ComplaintForCategory,
} from '@/types/complaint';
import {
  computeComplaintDiff,
  type CurrentComplaintData,
  type OriginalComplaintData,
} from '@/utils/computeDiff';

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
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }

  return dateObj.toISOString();
};

const getDateRangeFromPicker = (dateRange: DateRange | undefined) => {
  const today = new Date();

  if (!dateRange?.from || !dateRange?.to) {
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

// Converter for complaints with drivers at the complaint level
const convertComplaintExtendedWithDriversToComplaint = (
  complaintExtended: ComplaintExtendedWithDrivers
): Complaint => {
  if (!complaintExtended) {
    throw new Error('complaintExtended is null or undefined');
  }

  if (!complaintExtended.address) {
    throw new Error('complaintExtended.address is null or undefined');
  }

  // Convert drivers to the Driver format (without isActive)
  const activeDrivers = (complaintExtended.drivers || [])
    .filter((driver) => driver && driver.isActive)
    .map((driver) => ({
      id: driver.id,
      name: driver.name,
      phone_no: driver.phone_no,
    }));

  // Map drivers to teams - assign all drivers to the first team
  // (since most code accesses teams[0]?.drivers[0])
  const teamsWithDrivers = (complaintExtended.teams || []).map(
    (team, index) => {
      return {
        id: team.id,
        category: team.category,
        team_nm: team.team_nm,
        // Assign drivers only to the first team to avoid duplication
        drivers: index === 0 ? activeDrivers : [],
      };
    }
  );

  // If no teams exist, create a default team with all drivers
  const finalTeams =
    teamsWithDrivers.length > 0
      ? teamsWithDrivers
      : [
          {
            id: 0,
            category: complaintExtended.category || '기타',
            team_nm: '',
            drivers: activeDrivers,
          },
        ];

  return {
    id: complaintExtended.id,
    address: complaintExtended.address,
    datetime: complaintExtended.datetime,
    category:
      finalTeams.map((team) => team.category).filter(Boolean)[0] || '기타',
    type: complaintExtended.type,
    content: complaintExtended.content,
    route: complaintExtended.route,
    source: complaintExtended.source,
    notify: {
      usernames: finalTeams.flatMap((team) =>
        team.drivers.map((driver) => driver.name)
      ),
    },
    status: complaintExtended.status,
    bad: complaintExtended.bad,
    user: complaintExtended.user,
    teams: finalTeams,
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

      if (category && category !== 'all') {
        requestBody.category = category;
      }

      const response = await apiClient.post<ComplaintApiResponseWithDrivers>(
        '/complaint/getByCategoryAndOrDates',
        requestBody
      );

      const complaints = response.data.complaints_extended.map(
        convertComplaintExtendedWithDriversToComplaint
      );

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
      const response = await apiClient.get<ComplaintByIdApiResponse>(
        `/complaint/getById/${id}`
      );

      if (!response.data) {
        throw new Error('API response data is null or undefined');
      }

      if (!response.data.complaint_extended) {
        throw new Error('API response missing complaint_extended property');
      }

      const convertedComplaint = convertComplaintExtendedWithDriversToComplaint(
        response.data.complaint_extended
      );

      return convertedComplaint;
    } catch (error) {
      console.error('Error in getComplaintById:', error);
      throw error;
    }
  },

  async updateComplaint(
    id: number,
    updates: CurrentComplaintData,
    originalComplaint?: OriginalComplaintData
  ): Promise<void> {
    try {
      if (!originalComplaint) {
        throw new Error('Original complaint data is required for comparison');
      }

      const payload = computeComplaintDiff(originalComplaint, updates);

      if (Object.keys(payload).length === 0) {
        return;
      }

      await apiClient.patch(`/complaint/edit/${id}`, payload);
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
      const response = await apiClient.get('/complaint/getAllCategories');

      const allowedCategories = ['음식물', '재활용', '생활', '기타'];
      const categories = response.data.categories || response.data || [];

      const filteredCategories = categories.filter((category: string) =>
        allowedCategories.includes(category)
      );

      return filteredCategories;
    } catch (error) {
      console.error('Error fetching all categories:', error);
      return ['음식물', '재활용', '생활', '기타'];
    }
  },

  async getComplaintsForMap(categories: string[]): Promise<Complaint[]> {
    try {
      const response = await apiClient.post(
        '/map/getRecentComplaintsByCategories',
        {
          categories: categories,
        }
      );

      let complaints: Complaint[] = [];

      if (response.data.data && Array.isArray(response.data.data)) {
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

      const response = await apiClient.post(
        '/map/getComplaintsByNegs',
        requestBody
      );

      let complaints: Complaint[] = [];

      if (response.data.data && Array.isArray(response.data.data)) {
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

      return complaints;
    } catch (error) {
      console.error('complaint service-getComplaintsByNegs:', error);
      throw error;
    }
  },
};
