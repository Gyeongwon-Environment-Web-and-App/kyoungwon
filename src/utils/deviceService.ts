import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

import type { FileData } from '@/components/forms/FileAttach';

export type DeviceFileSource = 'camera' | 'photo-library' | 'file-picker';

export interface DeviceFile {
  name: string;
  type: string;
  size: number;
  data: string | File; // Base64 string (native) or File object (web)
  previewUrl?: string;
}

/**
 * Check if running on native platform
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Check if camera is available
 */
export async function isCameraAvailable(): Promise<boolean> {
  if (isNativePlatform()) {
    return true; // Capacitor handles availability
  }
  // Check browser support
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Get photo from camera (native or web)
 */
export async function getPhotoFromCamera(): Promise<DeviceFile | null> {
  if (isNativePlatform()) {
    // Use Capacitor Camera
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      if (!image.base64String) {
        console.error('Camera: No base64 string returned');
        return null;
      }

      return {
        name: `photo_${Date.now()}.${image.format}`,
        type: `image/${image.format}`,
        size: image.base64String.length, // Approximate
        data: image.base64String,
        previewUrl: `data:image/${image.format};base64,${image.base64String}`,
      };
    } catch (error) {
      console.error('Camera error:', error);
      return null;
    }
  } else {
    // Web: Use file input with capture attribute
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Use back camera
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const previewUrl = URL.createObjectURL(file);
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            data: file,
            previewUrl,
          });
        } else {
          resolve(null);
        }
      };
      input.click();
    });
  }
}

/**
 * Get photo from photo library (native or web)
 */
export async function getPhotoFromLibrary(): Promise<DeviceFile | null> {
  if (isNativePlatform()) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
      });

      if (!image.base64String) {
        console.error('Photo library: No base64 string returned');
        return null;
      }

      return {
        name: `photo_${Date.now()}.${image.format}`,
        type: `image/${image.format}`,
        size: image.base64String.length,
        data: image.base64String,
        previewUrl: `data:image/${image.format};base64,${image.base64String}`,
      };
    } catch (error) {
      console.error('Photo library error:', error);
      return null;
    }
  } else {
    // Web: Use standard file input
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = false;
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const previewUrl = URL.createObjectURL(file);
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            data: file,
            previewUrl,
          });
        } else {
          resolve(null);
        }
      };
      input.click();
    });
  }
}

/**
 * Convert DeviceFile to FileData format used by FileAttach
 */
export async function convertDeviceFileToFileData(
  deviceFile: DeviceFile
): Promise<FileData> {
  if (deviceFile.data instanceof File) {
    // Web: already a File object
    return {
      name: deviceFile.name,
      url: '',
      type: deviceFile.type,
      size: deviceFile.size,
      previewUrl: deviceFile.previewUrl,
      file: deviceFile.data,
    };
  } else {
    // Native: convert base64 string to File
    const base64Data = deviceFile.data as string;

    // Remove data URL prefix if present
    const base64String = base64Data.includes(',')
      ? base64Data.split(',')[1]
      : base64Data;

    // Convert base64 to binary
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: deviceFile.type });
    const file = new File([blob], deviceFile.name, { type: deviceFile.type });

    // Create preview URL from blob
    const previewUrl = URL.createObjectURL(blob);

    return {
      name: deviceFile.name,
      url: '',
      type: deviceFile.type,
      size: file.size,
      previewUrl: previewUrl,
      file: file,
    };
  }
}
