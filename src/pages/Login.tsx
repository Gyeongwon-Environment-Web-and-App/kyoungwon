import React, { useState } from 'react';

import pngMdLogo from '../assets/icons/brand/mid_logo.png';
import mdLogo from '../assets/icons/brand/mid_logo.svg';
import { authService, type LoginResult } from '../services/authService';

interface LoginProps {
  onLogin: (userData: {
    id: number;
    serial_no: string;
    phone_no: string;
    name: string;
    token: string;
  }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [serial, setSerial] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('로그인 중...');

  // Helper function to validate and parse serial number
  const isValidSerial = (serialValue: string): { valid: boolean; serialNo?: number } => {
    if (!serialValue || serialValue.trim() === '') {
      return { valid: false };
    }
    const serialNo = parseInt(serialValue.trim(), 10);
    if (isNaN(serialNo) || serialNo <= 0) {
      return { valid: false };
    }
    return { valid: true, serialNo };
  };

  // 로그인 API 호출 함수
  const loginWithSerial = async (serial_no: number): Promise<LoginResult> => {
    const result = await authService.login(serial_no);

    // 로그인 성공 시 로컬 스토리지에 사용자 정보 저장 (자동 로그인용)
    if (result.success && result.data && autoLogin) {
      localStorage.setItem('userData', JSON.stringify(result.data));
      localStorage.setItem('serial_no', result.data.serial_no.toString());
      localStorage.setItem('userToken', result.data.token);
      console.log('userToken: ', result.data.token);
    }

    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setLoadingMessage('로그인 중...');
    setError(false);

    try {
      // Validate serial number before parsing
      const validation = isValidSerial(serial);
      if (!validation.valid || !validation.serialNo) {
        setError(true);
        setLoading(false);
        setLoadingMessage('로그인 중...');
        console.error('Invalid serial number:', serial);
        return;
      }

      const serialNo = validation.serialNo;
      console.log(
        'Attempting login with serial number:',
        serialNo,
        'from input:',
        serial
      );

      // Show different messages during the wait
      const messageTimeout = setTimeout(() => {
        setLoadingMessage('서버가 시작 중입니다. 잠시만 기다려주세요...');
      }, 10000); // After 10 seconds, show server wake-up message

      const result = await loginWithSerial(serialNo);

      clearTimeout(messageTimeout);

      if (result && result.success && result.data) {
        // 로그인 성공 시 부모 컴포넌트의 onLogin 함수 사용
        onLogin(result.data);
      } else {
        // 로그인 실패 시 에러 메시지 표시
        setError(true);
        setLoadingMessage('로그인 중...');
        // Don't show alert, let the error message display in the UI
        console.error('Login failed:', result?.message);
      }
    } catch (error) {
      console.error('로그인 처리 중 오류:', error);
      setError(true);
      setLoadingMessage('로그인 중...');
    } finally {
      setLoading(false);
      setLoadingMessage('로그인 중...');
    }
  };

  const handleSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSerial(e.target.value);
    if (error) setError(false);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen w-screen">
      <div className="h-full flex items-center justify-center w-2/3 md:w-1/2">
        <img
          className="mb-6 text-center hidden md:block"
          src={mdLogo}
          alt="중간 크기 경원환경개발 초록색 로고"
        />
        <img
          className="mb-6 text-center md:hidden visible"
          src={pngMdLogo}
          alt="중간 크기 경원환경개발 초록색 로고"
        />
      </div>
      <div className="md:w-2/4 md:pr-20">
        <form onSubmit={handleSubmit} className="bg-white p-8 max-w-screen">
          <h2 className="text-3xl font-bold mb-6">로그인</h2>
          <div className="mb-4">
            <input
              id="serial"
              type="text"
              className={`w-full px-5 py-3 text-xl border rounded focus:outline-none transition-colors duration-200 ${
                isFocused
                  ? error
                    ? 'border-[#FF3D3D] outline-[#FF3D3D]'
                    : 'border-[#00BA13] outline-[#00BA13]'
                  : error
                    ? 'border-[#FF3D3D]'
                    : 'border-gray-300'
              }`}
              value={serial}
              onChange={handleSerialChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              required
              autoComplete="off"
              placeholder={isFocused ? '' : '시리얼코드'}
            />
            {error && (
              <p className="text-[#FF3D3D] text-sm mt-2">
                로그인에 실패했습니다. 서버가 시작 중일 수 있습니다. 잠시 후
                다시 시도해주세요.
              </p>
            )}
          </div>
          <div className="mb-6 flex items-center">
            <input
              id="autoLogin"
              type="checkbox"
              checked={autoLogin}
              onChange={(e) => setAutoLogin(e.target.checked)}
              className="mr-2"
            />
            <label
              htmlFor="autoLogin"
              className="text-gray-500 select-none text-lg"
            >
              자동 로그인
            </label>
          </div>
          <button
            type="submit"
            className={`w-full py-2 text-lg rounded transition outline-none border-none focus:outline-none ${
              isValidSerial(serial).valid
                ? 'bg-[#00BA13] text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={loading || !isValidSerial(serial).valid}
          >
            {loading ? loadingMessage : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
