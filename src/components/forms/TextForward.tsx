import React from 'react';

import { useIsMobile } from '@/hooks/use-mobile';

// 기존 훅 사용

interface TextForwardProps {
  options: string[];
  selectedValues: string[];
  onChange: (updated: string[]) => void;
  // 모바일용 텍스트 추가
  mobileOptions?: string[];
}

const TextForward: React.FC<TextForwardProps> = ({
  options,
  selectedValues,
  onChange,
  mobileOptions = options, // 기본값은 기존 options
}) => {
  const isMobile = useIsMobile();
  const displayOptions = isMobile ? mobileOptions : options;

  const handleCheckboxChange = (option: string) => {
    const isChecked = selectedValues.includes(option);
    const updated = isChecked
      ? selectedValues.filter((value) => value !== option)
      : [...selectedValues, option];

    onChange(updated);
  };

  const handleMobileClick = (
    option: string,
    e?: React.MouseEvent<HTMLButtonElement | HTMLLabelElement>
  ) => {
    // 이벤트 전파 중단
    e?.preventDefault();
    e?.stopPropagation();

    handleCheckboxChange(option);
  };

  // 모바일 버전
  if (isMobile) {
    return (
      <div className="flex gap-1 w-full justify-center">
        {displayOptions.map((option) => {
          const isSelected = selectedValues.includes(option);
          return (
            <button
              key={option}
              className={`w-16 px-0 rounded-lg border border-dark-gray font-bold text-sm transition-all ${
                isSelected
                  ? 'bg-lighter-green text-dark-gray'
                  : 'bg-white text-black'
              }`}
              onClick={(e) => handleMobileClick(option, e)}
            >
              {option}
            </button>
          );
        })}
      </div>
    );
  }

  // 데스크탑 버전 (기존 코드)
  return (
    <div className="flex gap-5 px-5">
      {options.map((option) => (
        <div
          key={option}
          className="border border-black rounded py-2 text-base font-bold w-[13rem] flex items-center justify-center"
        >
          <label
            className="flex items-center cursor-pointer"
            onClick={() => handleCheckboxChange(option)}
          >
            <div
              className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer ${
                selectedValues.includes(option)
                  ? 'bg-[#00BA13] border-[#006F0B]'
                  : 'border-black'
              }`}
            >
              {selectedValues.includes(option) && (
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span className="ml-3">{option}</span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default TextForward;
