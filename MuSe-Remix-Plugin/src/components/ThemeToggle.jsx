// src/components/SystemTheme.jsx
import React, { useState, useEffect } from 'react';

export const SystemThemeWatcher = ({ showIndicator = true, className = '' }) => {
  const [isDark, setIsDark] = useState(false);

  // Funzione per ottenere il tema preferito dal sistema
  const getSystemTheme = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  };

  // Funzione per applicare il tema
  const applyTheme = (isDarkMode) => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  };

  // Inizializza e ascolta i cambiamenti del tema di sistema
  useEffect(() => {
    // Imposta il tema iniziale basato sul sistema
    const initialTheme = getSystemTheme();
    setIsDark(initialTheme);
    applyTheme(initialTheme);

    // Ascolta i cambiamenti delle preferenze del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      setIsDark(e.matches);
      applyTheme(e.matches);
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // Renderizza l'indicatore opzionale del tema corrente
  if (!showIndicator) {
    return null;
  }

  return (
    <div style={{ display: 'none' }} className={`theme-indicator ${className}`}>
      <span className="theme-indicator-icon">
        {isDark ? '🌙' : '☀️'}
      </span>
      <span className="theme-indicator-text">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </div>
  );
};

// Hook personalizzato per React - solo per monitorare il tema di sistema
export const useSystemTheme = () => {
  const [isDark, setIsDark] = useState(false);

  const getSystemTheme = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  };

  const applyTheme = (isDarkMode) => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  };

  useEffect(() => {
    // Imposta il tema iniziale
    const initialTheme = getSystemTheme();
    setIsDark(initialTheme);
    applyTheme(initialTheme);

    // Ascolta i cambiamenti
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      setIsDark(e.matches);
      applyTheme(e.matches);
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  return { isDark, isSystemDark: isDark };
};

export default SystemThemeWatcher;