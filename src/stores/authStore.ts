// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setStorageItem, removeStorageItem, getStorageItem } from '../utils/storage';

// Define user data interface
interface UserData {
  id: number;
  serial_no: string;
  phone_no: string;
  name: string;
  token: string;
}

// Define authentication state interface
interface AuthState {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  userData: UserData | null;
  token: string | null;

  // Actions
  login: (userData: UserData) => void;
  logout: () => void;
  checkAuthStatus: () => void;
  setLoading: (loading: boolean) => void;
}

// Helper function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now();
    const tokenExpTime = payload.exp * 1000; // Convert to milliseconds
    return tokenExpTime < currentTime;
  } catch {
    return true;
  }
};

// Create the authentication store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      isLoading: true,
      userData: null,
      token: null,

      // Actions
      login: async (userData: UserData) => {
        // Store data using storage utility for cross-platform compatibility
        // This stores in both Preferences (async, for persistence) and localStorage (sync, for immediate access)
        await setStorageItem('userData', JSON.stringify(userData));
        await setStorageItem('serial_no', userData.serial_no);
        await setStorageItem('userToken', userData.token);

        // Update Zustand state
        set({
          isAuthenticated: true,
          userData,
          token: userData.token,
          isLoading: false,
        });
      },

      logout: async () => {
        // Clear all storage using storage utility
        // This clears both Preferences and localStorage
        await removeStorageItem('userData');
        await removeStorageItem('serial_no');
        await removeStorageItem('userToken');
        
        // Also clear sessionStorage
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('serial_no');
        sessionStorage.removeItem('userToken');

        // Update Zustand state
        set({
          isAuthenticated: false,
          userData: null,
          token: null,
          isLoading: false,
        });
      },

      checkAuthStatus: async () => {
        try {
          // Use storage utility for cross-platform compatibility
          const userData = await getStorageItem('userData');
          const token = await getStorageItem('userToken');
          const serialNo = await getStorageItem('serial_no');

          if (userData && token) {
            if (isTokenExpired(token)) {
              await get().logout();
              return;
            }

            // Sync to localStorage for synchronous access in request interceptors
            // This ensures the token is available immediately for API calls
            localStorage.setItem('userData', userData);
            localStorage.setItem('userToken', token);
            if (serialNo) {
              localStorage.setItem('serial_no', serialNo);
            }

            const parsedUserData = JSON.parse(userData);
            set({
              isAuthenticated: true,
              userData: parsedUserData,
              token,
              isLoading: false,
            });
          } else {
            set({
              isAuthenticated: false,
              userData: null,
              token: null,
              isLoading: false,
            });
          }
        } catch {
          set({
            isAuthenticated: false,
            userData: null,
            token: null,
            isLoading: false,
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      // Only persist authentication state, not loading state
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userData: state.userData,
        token: state.token,
      }),
    }
  )
);
