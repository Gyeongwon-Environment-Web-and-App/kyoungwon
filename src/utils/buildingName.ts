import axios from 'axios';

// Kakao Local API response types
interface KakaoAddressDocument {
  address_name: string;
  y: string; // latitude
  x: string; // longitude
  address_type: 'REGION' | 'ROAD' | 'REGION_ADDR' | 'ROAD_ADDR';
  address: {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    region_3depth_h_name: string;
    h_code: string;
    b_code: string;
    mountain_yn: 'Y' | 'N';
    main_address_no: string;
    sub_address_no: string;
    x: string;
    y: string;
  };
  road_address?: {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    road_name: string;
    underground_yn: 'Y' | 'N';
    main_building_no: string;
    sub_building_no: string;
    building_name: string; // This is what we need!
    zone_no: string;
    x: string;
    y: string;
  };
}

interface KakaoAddressSearchResponse {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
  documents: KakaoAddressDocument[];
}

// Cache for building names to avoid repeated API calls
const buildingNameCache = new Map<string, string | null>();

/**
 * Finds a building name based on an address using Kakao Maps Local API
 * @param address - The address to search for (e.g., "서울 도봉구 도봉로139길 87")
 * @returns The building name if found, null otherwise
 * @example
 * const buildingName = await getBuildingNameFromAddress("서울 도봉구 도봉로139길 87");
 * // Returns: "한진빌라"
 */
export async function getBuildingNameFromAddress(
  address: string
): Promise<string | null> {
  // Check cache first
  if (buildingNameCache.has(address)) {
    return buildingNameCache.get(address)!;
  }

  const restApiKey = import.meta.env.VITE_KAKAO_REST_API_KEY;

  if (!restApiKey) {
    console.error(
      '❌ VITE_KAKAO_REST_API_KEY is not set. Please add it to your .env file.'
    );
    buildingNameCache.set(address, null);
    return null;
  }

  try {
    const response = await axios.get<KakaoAddressSearchResponse>(
      'https://dapi.kakao.com/v2/local/search/address.json',
      {
        params: {
          query: address,
        },
        headers: {
          Authorization: `KakaoAK ${restApiKey}`,
        },
      }
    );

    if (response.data.documents && response.data.documents.length > 0) {
      // Try to get building name from road_address first (more accurate)
      const firstResult = response.data.documents[0];

      if (firstResult.road_address?.building_name) {
        const buildingName = firstResult.road_address.building_name;
        buildingNameCache.set(address, buildingName);
        return buildingName;
      }

      // If no road_address building_name, return null
      // The building name is typically only available in road_address
      buildingNameCache.set(address, null);
      return null;
    }

    // No results found
    buildingNameCache.set(address, null);
    return null;
  } catch (error) {
    console.error('Error fetching building name from Kakao API:', error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.error('❌ Invalid Kakao REST API key');
      } else if (error.response?.status === 400) {
        console.error('❌ Invalid address format');
      }
    }

    buildingNameCache.set(address, null);
    return null;
  }
}

/**
 * Clears the building name cache
 * Useful for testing or when you want to force a fresh API call
 */
export function clearBuildingNameCache(): void {
  buildingNameCache.clear();
}

/**
 * Batch function to get building names for multiple addresses
 * @param addresses - Array of addresses to search
 * @returns Map of address to building name (or null if not found)
 */
export async function getBuildingNamesFromAddresses(
  addresses: string[]
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();

  // Process addresses with reasonable concurrency limit
  const concurrencyLimit = 5;
  const chunks = [];

  for (let i = 0; i < addresses.length; i += concurrencyLimit) {
    chunks.push(addresses.slice(i, i + concurrencyLimit));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (address) => {
      const buildingName = await getBuildingNameFromAddress(address);
      results.set(address, buildingName);
    });

    await Promise.all(promises);
  }

  return results;
}
