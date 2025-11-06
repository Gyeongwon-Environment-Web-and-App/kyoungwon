export const CATEGORY_MAPPING = {
  all: '전체',
  general: '생활',
  recycle: '재활용',
  food: '음식물',
  others: '기타',
  bad: '반복민원',
} as const;

export const KOREAN_TO_ENGLISH = {
  전체: 'all',
  생활: 'general',
  재활용: 'recycle',
  음식물: 'food',
  기타: 'others',
  반복민원: 'bad',
} as const;

export const getKoreanLabel = (englishId: string): string => {
  return (
    CATEGORY_MAPPING[englishId as keyof typeof CATEGORY_MAPPING] || englishId
  );
};

export const getEnglishId = (koreanLabel: string): string => {
  return (
    KOREAN_TO_ENGLISH[koreanLabel as keyof typeof KOREAN_TO_ENGLISH] ||
    koreanLabel
  );
};
