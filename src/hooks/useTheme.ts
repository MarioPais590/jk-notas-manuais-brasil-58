
import { useState, useEffect } from 'react';
import { APP_CONFIG } from '@/constants/appConfig';

export function useTheme() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.THEME);
    if (savedTheme === APP_CONFIG.THEME.DARK) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.THEME, APP_CONFIG.THEME.DARK);
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.THEME, APP_CONFIG.THEME.LIGHT);
    }
  };

  return { darkMode, toggleTheme };
}
