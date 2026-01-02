import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const STORAGE_KEY = 'congkak-language';
const DEFAULT_LANGUAGE = 'BM'; // BM is primary per spec

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'EN' ? 'BM' : 'EN');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
