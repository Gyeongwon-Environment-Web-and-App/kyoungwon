import apiClient from '@/lib/api';

/**
 * Get file URL from Cloudflare key
 * If the key is already a full URL, return it as-is
 * Otherwise, try to get the URL from the API or construct it
 * @param key - Cloudflare object key (e.g., "complaint/xxx.jpg")
 * @returns Full URL to access the file
 */
export async function getFileUrl(key: string): Promise<string> {
  // If key is already a full URL, return it
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }

  // Try to get URL from API endpoint
  try {
    const response = await apiClient.get<{ url: string }>(
      `/cloudflare/getFileUrl/${encodeURIComponent(key)}`
    );
    if (response.data?.url) {
      return response.data.url;
    }
  } catch (error) {
    console.warn(
      'Failed to get file URL from API, trying direct construction:',
      error
    );
  }

  // Fallback: construct URL from base URL and key
  // This assumes files are accessible via the API base URL
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://gyeongwon-proxy.onrender.com/api';
  return `${baseURL}/cloudflare/file/${encodeURIComponent(key)}`;
}

/**
 * Get file URL synchronously (for immediate use in components)
 * This will return a constructed URL that may need to be validated
 * @param key - Cloudflare object key
 * @returns Constructed URL (may not be valid until verified)
 */
export function getFileUrlSync(key: string): string {
  // If key is already a full URL, return it
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }

  // Construct URL from base URL and key
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://20.200.145.224';
  return `${baseURL}/cloudflare/file/${encodeURIComponent(key)}`;
}
