// hooks/useAuth.ts
import { useEffect } from 'react';

import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
  // Get state and actions from Zustand store
  const {
    isAuthenticated,
    isLoading,
    userData,
    token,
    login: storeLogin,
    logout: storeLogout,
    checkAuthStatus,
    setLoading,
  } = useAuthStore();

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    isAuthenticated,
    isLoading,
    userData,
    token,
    logout: storeLogout,
    login: storeLogin,
    checkAuthStatus,
    setLoading,
  };
};
