import axios from 'axios';

import apiClient from '../lib/api';

// Type definitions for API responses
export interface User {
  id: number;
  serial_no: string;
  phone_no: string;
  name: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginResult {
  success: boolean;
  data?: User & {
    token: string;
  };
  message?: string;
}

export interface RegisterRequest {
  serial_no: string;
  phone_no: string;
  name: string;
}

export interface RegisterResponse {
  success: boolean;
  data?: User;
  message?: string;
}

// Auth service with typed API calls
export const authService = {
  /**
   * Login with serial number
   * @param serialNo - The serial number to login with
   * @returns Promise with login result
   */
  login: async (serialNo: number): Promise<LoginResult> => {
    try {
      // Validate serialNo before making the request
      if (!serialNo || isNaN(serialNo) || serialNo <= 0) {
        console.error('Invalid serialNo provided to login:', serialNo);
        return {
          success: false,
          message: '유효하지 않은 시리얼 번호입니다.',
        };
      }

      const loginUrl = `/user/login/${serialNo}`;
      console.log(
        'Making login request to:',
        loginUrl,
        'with serialNo:',
        serialNo
      );

      const response = await apiClient.get<LoginResponse>(loginUrl);

      if (response.status === 200) {
        const { message, user, token } = response.data;
        console.log(`Login message: ${message}`);

        // Combine user data with token
        const userData = {
          ...user,
          token: token,
        };

        return {
          success: true,
          data: userData,
        };
      }

      return {
        success: false,
        message: 'Unexpected response status',
      };
    } catch (error) {
      console.error('Login failed:', error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return {
            success: false,
            message: '존재하지 않는 시리얼 번호입니다.',
          };
        } else if (error.response?.status === 400) {
          return {
            success: false,
            message: '잘못된 요청입니다.',
          };
        } else if (error.response?.status === 500) {
          return {
            success: false,
            message: '서버 오류가 발생했습니다.',
          };
        }
      }

      // Handle timeout errors with user-friendly message
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        return {
          success: false,
          message:
            '서버가 시작 중입니다. 잠시 후 다시 시도해주세요. (최대 2분 소요)',
        };
      }

      return {
        success: false,
        message: '로그인 중 오류가 발생했습니다.',
      };
    }
  },

  /**
   * Register a new user
   * @param serialNo - The serial number
   * @param phoneNo - The phone number
   * @param name - The user's name
   * @returns Promise with register result
   */
  register: async (
    serialNo: string,
    phoneNo: string,
    name: string
  ): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post<{ user: User; message: string }>(
        '/user/create',
        {
          serial_no: serialNo,
          phone_no: phoneNo,
          name: name,
        }
      );

      if (response.status === 200 || response.status === 201) {
        const { user, message } = response.data;
        console.log(`Register message: ${message}`);

        return {
          success: true,
          data: user,
          message: message,
        };
      }

      return {
        success: false,
        message: 'Unexpected response status',
      };
    } catch (error) {
      console.error('Registration failed:', error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          return {
            success: false,
            message: '잘못된 요청입니다. 입력한 정보를 확인해주세요.',
          };
        } else if (error.response?.status === 409) {
          return {
            success: false,
            message: '이미 등록된 시리얼 번호입니다.',
          };
        } else if (error.response?.status === 500) {
          return {
            success: false,
            message: '서버 오류가 발생했습니다.',
          };
        } else if (error.response?.data?.message) {
          return {
            success: false,
            message: error.response.data.message,
          };
        }
      }

      return {
        success: false,
        message: '등록 중 오류가 발생했습니다.',
      };
    }
  },

  /**
   * Logout user (clear local storage)
   */
  logout: () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('serial_no');
    localStorage.removeItem('userToken');
  },

  /**
   * Get current user data from localStorage
   */
  getCurrentUser: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('userToken');
    return !!token;
  },

  getToken: () => {
    return localStorage.getItem('userToken');
  },
};
