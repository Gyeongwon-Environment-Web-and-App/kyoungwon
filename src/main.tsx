import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './index.css';

// ✅ 정적 접근으로 env 한 번에 뽑기
const env = {
  VITE_KAKAO_JAVASCRIPT_KEY: import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_NAVER_CLOUD_API_KEY_ID: import.meta.env.VITE_NAVER_CLOUD_API_KEY_ID,
  VITE_NAVER_CLOUD_API_KEY: import.meta.env.VITE_NAVER_CLOUD_API_KEY,
} as const;

// Environment variable validation
const validateEnvironmentVariables = () => {
  const missingVars = Object.entries(env)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    console.error(
      'Please check your .env file and ensure all required variables are set.'
    );
  } else {
    console.log('✅ All required environment variables are loaded');
  }
};

// Validate environment variables before app initialization
validateEnvironmentVariables();

// Service worker removed to avoid HTTPS conflicts

createRoot(document.getElementById('root')!).render(<App />);
