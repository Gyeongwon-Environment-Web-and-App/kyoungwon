import type { JSX } from 'react';

import { useNavigate } from 'react-router-dom';

interface PopupProps {
  message: string | JSX.Element;
  yesNo: boolean;
  onFirstClick: () => void;
  onFirstLabel?: string;
  onSecondClick: () => void;
  onSecondLabel?: string;
  toHome: boolean;
  onGoHome?: () => void;
}

export default function Popup({
  message,
  yesNo,
  onFirstClick,
  onFirstLabel,
  onSecondClick,
  onSecondLabel,
  toHome,
  onGoHome,
}: PopupProps) {
  const navigate = useNavigate();
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        className="fixed w-full max-w-sm max-h-80 p-6 bg-white rounded-lg shadow-lg text-center left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center items-center font-bold"
        onClick={(e) => {
          // Prevent clicks on popup from bubbling to backdrop
          e.stopPropagation();
        }}
      >
        {/* 메시지 */}
        <div className="mt-8 mb-4 text-xl font-bold">
          {typeof message === 'string' ? <span>{message}</span> : message}
        </div>

        {/* 버튼 */}
        <div className={`flex mt-2 ${toHome ? '' : 'mb-7'}`}>
          <button
            onClick={onFirstClick}
            className={`px-4 py-2 mr-2 bg-light-green text-white rounded font-semibold text-base ${yesNo ? 'w-[7rem]' : ''}`}
          >
            {yesNo ? '예' : onFirstLabel}
          </button>
          <button
            onClick={onSecondClick}
            className={`px-4 py-2 bg-d9d9d9 text-black rounded font-semibold text-base ${yesNo ? 'w-[7rem]' : ''}`}
          >
            {yesNo ? '아니오' : onSecondLabel}
          </button>
        </div>

        {/* 홈으로 돌아가기 문구 */}
        {toHome && (
          <button
            className="mt-4 mb-4 text-sm font-semibold text-gray-500 cursor-pointer"
            onClick={() => {
              // Reset states before navigation
              if (onGoHome) {
                onGoHome();
              }
              navigate('/');
            }}
          >
            홈으로 돌아가기
          </button>
        )}
      </div>
    </div>
  );
}
