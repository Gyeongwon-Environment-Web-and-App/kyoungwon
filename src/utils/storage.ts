import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

/**
 * Storage utility that uses Capacitor Preferences on native platforms
 * and localStorage on web for reliable cross-platform storage
 */
class Storage {
  private isNative: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  /**
   * Get a value from storage
   */
  async getItem(key: string): Promise<string | null> {
    if (this.isNative) {
      try {
        const { value } = await Preferences.get({ key });
        return value;
      } catch (error) {
        console.error(`Error getting item ${key} from Preferences:`, error);
        return null;
      }
    } else {
      return localStorage.getItem(key);
    }
  }

  /**
   * Set a value in storage
   * On native platforms, stores in both Preferences (for persistence) and localStorage (for sync access)
   */
  async setItem(key: string, value: string): Promise<void> {
    if (this.isNative) {
      try {
        // Store in Preferences for reliable persistence on native
        await Preferences.set({ key, value });
        // Also store in localStorage for synchronous access in request interceptors
        localStorage.setItem(key, value);
      } catch (error) {
        console.error(`Error setting item ${key} in Preferences:`, error);
        // Fallback to localStorage if Preferences fails
        try {
          localStorage.setItem(key, value);
        } catch (localError) {
          console.error(`Error setting item ${key} in localStorage:`, localError);
          throw error;
        }
      }
    } else {
      localStorage.setItem(key, value);
    }
  }

  /**
   * Remove a value from storage
   * On native platforms, removes from both Preferences and localStorage
   */
  async removeItem(key: string): Promise<void> {
    if (this.isNative) {
      try {
        // Remove from Preferences
        await Preferences.remove({ key });
        // Also remove from localStorage
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing item ${key} from Preferences:`, error);
        // Fallback to localStorage removal
        localStorage.removeItem(key);
      }
    } else {
      localStorage.removeItem(key);
    }
  }

  /**
   * Synchronous getItem for cases where async is not possible
   * On native, reads from localStorage (which is synced with Preferences via setItem)
   */
  getItemSync(key: string): string | null {
    // Always use localStorage for sync access since we store in both places
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  /**
   * Synchronous setItem for cases where async is not possible
   * Falls back to localStorage on native if Preferences fails
   */
  setItemSync(key: string, value: string): void {
    if (this.isNative) {
      // On native, use localStorage as fallback
      // But prefer async setItem for reliability
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error(`Error setting item ${key} in localStorage (native):`, error);
      }
    } else {
      localStorage.setItem(key, value);
    }
  }

  /**
   * Synchronous removeItem for cases where async is not possible
   */
  removeItemSync(key: string): void {
    if (this.isNative) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing item ${key} from localStorage (native):`, error);
      }
    } else {
      localStorage.removeItem(key);
    }
  }
}

// Export a singleton instance
export const storage = new Storage();

// Export convenience methods that match localStorage API
export const getStorageItem = (key: string): Promise<string | null> => storage.getItem(key);
export const setStorageItem = (key: string, value: string): Promise<void> => storage.setItem(key, value);
export const removeStorageItem = (key: string): Promise<void> => storage.removeItem(key);

// Synchronous versions for backward compatibility
export const getStorageItemSync = (key: string): string | null => storage.getItemSync(key);
export const setStorageItemSync = (key: string, value: string): void => storage.setItemSync(key, value);
export const removeStorageItemSync = (key: string): void => storage.removeItemSync(key);

