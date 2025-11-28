import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import mdLogo from '../assets/icons/brand/mid_logo.png';
import { authService } from '../services/authService';
import { validatePhoneNumber } from '../utils/validateDash';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serial, setSerial] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [name, setName] = useState('');

  const handleSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSerial(e.target.value);
    if (error) setError(null);
  };

  const handlePhoneNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNum(e.target.value);
    if (error) setError(null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serial || !phoneNum || !name) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    // Validate phone number for dashes
    const phoneValidation = validatePhoneNumber(phoneNum);
    if (!phoneValidation.isValid) {
      setError(phoneValidation.message || '전화번호 형식이 올바르지 않습니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authService.register(serial, phoneNum, name);

      if (result.success) {
        alert('등록이 완료되었습니다. 메인화면으로 돌아갑니다.');
        navigate('/');
      } else {
        setError(result.message || '등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('등록 처리 중 오류:', error);
      setError('등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen w-screen">
      <div
        className="h-full flex items-center justify-center w-2/3 md:w-1/2 cursor-pointer"
        onClick={() => {
          navigate('/');
        }}
      >
        <img
          className="mb-6 text-center w-full md:w-[70%]"
          src={mdLogo}
          alt="중간 크기 경원환경개발 초록색 로고"
        />
      </div>
      <div className="md:w-2/4 md:pr-20">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 max-w-screen"
          autoComplete="off"
        >
          <h2 className="text-3xl font-bold mb-6">직원 등록하기</h2>
          <div className="mb-5">
            <label htmlFor="name" className="font-medium text-lg">
              이름
            </label>
            <input
              id="name"
              type="text"
              className={`w-full px-5 py-3 mt-2 text-xl border rounded`}
              value={name}
              onChange={handleNameChange}
              required
              autoComplete="off"
              placeholder="이름을 작성해주세요."
            />
          </div>
          <div className="mb-5">
            <label htmlFor="phoneNum" className="font-medium text-lg">
              전화번호
            </label>
            <input
              id="phoneNum"
              type="text"
              className={`w-full px-5 py-3 mt-2 text-xl border rounded`}
              value={phoneNum}
              onChange={handlePhoneNumChange}
              required
              autoComplete="off"
              placeholder="'-'를 빼고 입력해주세요."
            />
          </div>
          <div className="mb-10">
            <label htmlFor="serial" className="font-medium text-lg">
              시리얼 번호
            </label>
            <input
              id="serial"
              type="text"
              className={`w-full px-5 py-3 mt-2 text-xl border rounded`}
              value={serial}
              onChange={handleSerialChange}
              required
              autoComplete="off"
              placeholder="휴대폰 번호 뒷자리를 입력해주세요."
            />
          </div>
          {error && (
            <div className="mb-5 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <button
            type="submit"
            className={`w-full py-2 text-lg rounded transition border-none focus:outline-none ${
              serial && phoneNum && name && !loading
                ? 'bg-[#00BA13] text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={loading || !serial || !phoneNum || !name}
          >
            {loading ? '등록 중...' : '등록하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
