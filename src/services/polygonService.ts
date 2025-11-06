import apiClient from '@/lib/api';
import type { RegionData } from '@/types/map';

export interface PolygonServiceResponse {
  data: RegionData | null;
  error: string | null;
  loading: boolean;
}

/**
 * Fetch polygon data for a specific category
 * @param category - The category to fetch polygons for (e.g., '음식물', '재활용', '생활', '기타')
 * @returns Promise with polygon data or error
 */
export const fetchPolygonsByCategory = async (
  category: string
): Promise<RegionData> => {
  try {
    const response = await apiClient.get(
      `/tempRegion/getAllByCategory/${encodeURIComponent(category)}`
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch polygons for category ${category}:`, error);
    throw new Error(`Failed to load polygons for ${category}`);
  }
};

// Get available categories for polygon data
export const getAvailableCategories = (): string[] => {
  return ['음식물', '재활용', '생활', '기타'];
};

/**
 * Validate if a category is supported
 * @param category - Category to validate
 * @returns boolean indicating if category is valid
 */
export const isValidCategory = (category: string): boolean => {
  return getAvailableCategories().includes(category);
};
