import apiClient from '@/lib/api';

import type {
  FileInfo,
  GetUploadUrlsRequest,
  GetUploadUrlsResponse,
  UploadedFileInfo,
  UploadUrlData,
} from '../types/fileUpload';

/**
 * Get upload URLs from Cloudflare API
 * @param files - Array of File objects
 * @param objectCategory - Category like "complaint", "driver", "vehicle"
 * @returns Array of upload URL data
 */

async function getUploadUrls(
  files: File[],
  objectCategory: string
): Promise<UploadUrlData[]> {
  const filesInfo: FileInfo[] = files.map((file) => ({
    filename: file.name,
    contentType: file.type || 'application/octet-stream',
  }));

  const requestBody: GetUploadUrlsRequest = {
    filesInfo,
    object_category: objectCategory,
  };

  const response = await apiClient.post<GetUploadUrlsResponse>(
    '/cloudflare/getKeysAndUrlsToUpload',
    requestBody
  );

  if (!response.data.data || response.data.data.length === 0) {
    throw new Error('No upload URLs received from server');
  }

  return response.data.data;
}

/**
 * Upload a single file to Cloudflare using presigned URL
 * @param file - File object to upload
 * @param uploadUrl - Presigned URL from Cloudflare
 * @returns Promise that resolves when upload completes
 */
async function uploadFileToUrl(file: File, uploadUrl: string): Promise<void> {
  // Try fetch first without Content-Type to avoid CORS preflight
  // If that fails, fall back to XMLHttpRequest
  try {
    // Don't set Content-Type header - this avoids CORS preflight
    // The presigned URL should handle content type automatically
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      mode: 'cors', // Explicitly allow CORS
    });

    if (!response.ok) {
      throw new Error(
        `Upload failed: ${response.status} ${response.statusText}`
      );
    }
    return;
  } catch (fetchError) {
    // If fetch fails with CORS, try XMLHttpRequest as fallback
    console.warn('Fetch upload failed, trying XMLHttpRequest:', fetchError);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('PUT', uploadUrl, true);

      // Don't set Content-Type to avoid CORS preflight
      // Presigned URLs should handle content type automatically

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(
          new Error(
            'Network error during upload. Please check CORS configuration on Cloudflare R2 bucket.'
          )
        );
      };

      xhr.ontimeout = () => {
        reject(new Error('Upload timeout'));
      };

      // Set timeout to 60 seconds for large files
      xhr.timeout = 60000;

      // Send the file
      xhr.send(file);
    });
  }
}

/**
 * Main function: Upload multiple files to Cloudflare
 * @param files - Array of File objects to upload
 * @param objectCategory - Category like "complaint", "driver", "vehicle"
 * @param onProgress - Optional progress callback (fileIndex, progress)
 * @returns Array of uploaded file info with Cloudflare keys
 */
export async function uploadFilesToCloudflare(
  files: File[],
  objectCategory: string,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<UploadedFileInfo[]> {
  if (!files || files.length === 0) {
    throw new Error('No files provided for upload');
  }

  try {
    // Step 1: Get upload URLs from backend
    const uploadUrls = await getUploadUrls(files, objectCategory);

    if (uploadUrls.length !== files.length) {
      throw new Error(
        `Mismatch: received ${uploadUrls.length} URLs for ${files.length} files`
      );
    }

    // Step 2: Upload each file to its presigned URL
    const uploadPromises = files.map(async (file, index) => {
      const uploadUrlData = uploadUrls[index];

      // Report progress start
      if (onProgress) {
        onProgress(index, 0);
      }

      try {
        // Upload file
        await uploadFileToUrl(file, uploadUrlData.url);

        // Report progress complete
        if (onProgress) {
          onProgress(index, 100);
        } // Return file info with Cloudflare key
        return {
          key: uploadUrlData.key, // This is what you'll store in your database
          originalName: file.name,
          contentType: file.type || 'application/octet-stream',
          size: file.size,
        } as UploadedFileInfo;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown upload error';
        throw new Error(`Failed to upload ${file.name}: ${errorMessage}`);
      }
    });

    // Wait for all uploads to complete
    const uploadedFiles = await Promise.all(uploadPromises);

    return uploadedFiles;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`File upload failed: ${errorMessage}`);
  }
}

/**
 * Helper: Convert File to the format expected by form data
 * (Maintains compatibility with existing form structure)
 */
export function convertToFormFileData(uploadedFile: UploadedFileInfo): {
  name: string;
  url: string;
  type: string;
  size: number;
} {
  return {
    name: uploadedFile.originalName,
    url: uploadedFile.key,
    type: uploadedFile.contentType,
    size: uploadedFile.size,
  };
}
