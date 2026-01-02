import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      className="language-selector"
      onClick={toggleLanguage}
      aria-label={`Switch to ${language === 'EN' ? 'Bahasa Malaysia' : 'English'}`}
    >
      {language === 'EN' ? 'EN | BM' : 'BM | EN'}
    </button>
  );
};

export default LanguageSelector;
