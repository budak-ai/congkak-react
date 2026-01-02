import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../config/translations';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose }) => {
  const { language, toggleLanguage } = useLanguage();

  if (!isOpen) return null;

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-content" onClick={handleContentClick}>
        <h2>{t('settings.title', language)}</h2>

        <div className="settings-row">
          <span className="settings-label">{t('settings.language', language)}</span>
          <button className="settings-toggle" onClick={toggleLanguage}>
            {language === 'EN' ? 'English' : 'Bahasa Malaysia'}
          </button>
        </div>

        <button className="settings-close" onClick={onClose}>
          {t('settings.close', language)}
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
