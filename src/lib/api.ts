import { Capacitor } from '@capacitor/core';
import axios, {
  type AxiosError,
  type CreateAxiosDefaults,
  type InternalAxiosRequestConfig,
} from 'axios';

import { getStorageItemSync, removeStorageItemSync } from '../utils/storage';

// Retry configuration for Render free instance cold starts
const MAX_RETRIES = 2; // Retry up to 2 times (3 total attempts)
const RETRY_DELAY = 5000; // Wait 5 seconds between retries
const RETRYABLE_ERROR_CODES = ['ECONNABORTED', 'ETIMEDOUT', 'ERR_NETWORK'];

// Helper function to check if error should be retried
const shouldRetry = (error: AxiosError, retryCount: number): boolean => {
  if (retryCount >= MAX_RETRIES) {
    return false;
  }

  // Retry on timeout or network errors (especially for Render cold starts)
  if (error.code && RETRYABLE_ERROR_CODES.includes(error.code)) {
    // Only retry if it's a Render instance (cold start scenario)
    if (error.config?.baseURL?.includes('onrender.com')) {
      return true;
    }
    // Also retry network errors in general
    return error.code === 'ERR_NETWORK';
  }

  return false;
};

// Helper function to delay execution
const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Create Axios instance with base configuration
// Note: On native platforms (iOS/Android), don't force xhr adapter as it may not work properly
const isNative = Capacitor.isNativePlatform();
const apiClientConfig: CreateAxiosDefaults = {
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    'https://kyoungwon-proxy.onrender.com/api',
  timeout: 90000, // 90 seconds - increased to handle Render free instance cold starts (can take 50+ seconds)
  headers: {
    'Content-Type': 'application/json',
  },
  // Add HTTPS configuration for development with self-signed certificates
  withCredentials: false,
};

// Only use xhr adapter on web, not on native platforms
if (!isNative) {
  apiClientConfig.adapter = 'xhr';
}

const apiClient = axios.create(apiClientConfig);

// Request interceptor - Add auth token and track retry count
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token - use storage utility for cross-platform compatibility
    const token = getStorageItemSync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request details for debugging (especially on iOS)
    // console.log('API Request:', {
    //   method: config.method,
    //   url: config.url,
    //   baseURL: config.baseURL,
    //   fullURL: `${config.baseURL}${config.url}`,
    //   headers: config.headers,
    //   timestamp: new Date().toISOString(),
    // });

    // Initialize retry count if not present
    const configWithRetry = config as InternalAxiosRequestConfig & {
      retryCount?: number;
    };
    if (!configWithRetry.retryCount) {
      configWithRetry.retryCount = 0;
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    console.error('Request error details:', {
      message: error.message,
      code: error.code,
      config: error.config,
    });
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors and retry logic
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & {
      retryCount?: number;
      __retryDelay?: number;
    };

    // Initialize retry count if not present
    if (!config.retryCount) {
      config.retryCount = 0;
    }

    console.error('Response interceptor error:', error);
    console.log('Error details:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      token: getStorageItemSync('userToken') ? 'exists' : 'missing',
      baseURL: error.config?.baseURL,
      retryCount: config.retryCount,
      errorCode: error.code,
      errorMessage: error.message,
      responseData: error.response?.data,
      requestHeaders: error.config?.headers,
    });

    // Check if we should retry this request
    if (shouldRetry(error, config.retryCount)) {
      config.retryCount += 1;
      const retryDelay = config.__retryDelay || RETRY_DELAY;

      console.log(
        `Retrying request (attempt ${config.retryCount + 1}/${MAX_RETRIES + 1}) after ${retryDelay}ms...`
      );

      // Wait before retrying
      await delay(retryDelay);

      // Exponential backoff for subsequent retries
      config.__retryDelay = retryDelay * 1.5;

      // Retry the request
      return apiClient.request(config);
    }

    // Handle 401 Unauthorized - redirect to login
    // Only clear tokens and redirect if we actually have a token and get a real 401
    if (error.response?.status === 401 && getStorageItemSync('userToken')) {
      console.log(
        '401 Unauthorized - clearing tokens and redirecting to login'
      );
      // Use storage utility for cross-platform compatibility
      removeStorageItemSync('userToken');
      removeStorageItemSync('userData');
      removeStorageItemSync('serial_no');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Handle timeout errors (especially for Render free instances that spin down)
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error(
        'Request timeout - the server may be spinning up from inactivity. Render free instances can take 50+ seconds to wake up.'
      );
      // Provide user-friendly error message
      if (error.config?.baseURL?.includes('onrender.com')) {
        console.warn(
          'Render free instance detected - this timeout may be due to cold start delay'
        );
      }
    }

    // Handle network errors
    if (error.code === 'ERR_NETWORK') {
      console.error(
        'Network error - check server connection and HTTPS certificate'
      );
      // Additional logging for HTTPS issues
      if (error.config?.baseURL?.includes('https://')) {
        console.error(
          'HTTPS connection failed - this might be due to SSL certificate issues'
        );
      }
    }

    // Handle CORS errors
    if (error.code === 'ERR_CANCELED' || error.message?.includes('CORS')) {
      console.error('CORS error - check server CORS configuration');
    }

    // Handle SSL/TLS errors
    if (
      error.message?.includes('certificate') ||
      error.message?.includes('SSL') ||
      error.message?.includes('TLS')
    ) {
      console.error('SSL/TLS error - check server certificate configuration');
    }

    return Promise.reject(error);
  }
);

// Utility function to get current API configuration
export const getApiConfig = () => {
  return {
    baseURL: apiClient.defaults.baseURL,
    timeout: apiClient.defaults.timeout,
    hasToken: !!getStorageItemSync('userToken'),
    token: getStorageItemSync('userToken') ? 'exists' : 'missing',
  };
};

// Utility function to update base URL (for debugging)
export const updateApiBaseURL = (newBaseURL: string) => {
  apiClient.defaults.baseURL = newBaseURL;
  console.log('API base URL updated to:', newBaseURL);
};

export default apiClient;
