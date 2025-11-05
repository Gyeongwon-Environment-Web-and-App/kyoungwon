import React, { useState } from 'react';

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

  // JWT 토큰 디코딩 유틸리티 함수
  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('JWT decode error:', error);
      return null;
    }
  };

  // 수동 로그인 함수 (SSL 인증서 문제 우회용)
  const handleManualLogin = () => {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwicGhvbmVfbm8iOiJzdHJpbmciLCJzZXJpYWxfbm8iOiIxMjM0IiwibmFtZSI6InN0cmluZyIsImlhdCI6MTc2MjMyNDIwOSwiZXhwIjoxNzYyOTI5MDA5fQ.d0SRUMomo5cc_jyYjJevijHGc9qTP7EAngXOZLeDiXQ';

    // JWT 토큰 디코딩
    const decodedToken = decodeJWT(token);
    console.log('Decoded JWT token:', decodedToken);

    // JWT 토큰에서 추출한 사용자 데이터
    const userData = {
      id: decodedToken?.id || 2,
      serial_no: decodedToken?.serial_no || '1234',
      phone_no: decodedToken?.phone_no || '01012345678',
      name: decodedToken?.name || 'hey',
      token: token,
    };

    // 로컬 스토리지에 토큰 및 사용자 정보 저장
    localStorage.setItem('userToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('serial_no', userData.serial_no);

    console.log('Manual login successful with token:', token);
    console.log('User data:', userData);

    // 부모 컴포넌트의 onLogin 함수 호출
    onLogin(userData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true); // 로딩 상태 추가

    try {
      const serialNo = parseInt(serial);
      const result = await loginWithSerial(serialNo);

      if (result && result.success && result.data) {
        // 로그인 성공 시 부모 컴포넌트의 onLogin 함수 사용
        onLogin(result.data);
      } else {
        // 로그인 실패 시 에러 메시지 표시
        alert(result?.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 처리 중 오류:', error);
      alert('로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
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
          className="text-2xl font-bold mb-6 text-center"
          src={mdLogo}
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
                시리얼 넘버가 올바르지 않습니다. 다시 한 번 확인해 주세요.
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
              serial
                ? 'bg-[#00BA13] text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          {/* SSL 인증서 문제 우회용 수동 로그인 버튼 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2 text-center">
              SSL 인증서 문제로 로그인이 안 되나요?
            </p>
            <button
              type="button"
              onClick={handleManualLogin}
              className="w-full py-2 text-sm rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              🔧 수동 로그인 (개발용)
            </button>
            <p className="text-xs text-gray-400 mt-1 text-center">
              Swagger에서 받은 토큰으로 로그인합니다
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
