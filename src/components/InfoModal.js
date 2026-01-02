import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../config/translations';
import './InfoModal.css';

const InfoModal = ({ isOpen, toggleModal }) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className='modal-overlay' onClick={toggleModal}>
      <div className='modal-content' onClick={handleModalContentClick}>
        <h2>{t('rules.title', language)}</h2>
        <ul>
          <li>{t('rules.intro', language)}</li>
          <li>{t('rules.startSimultaneous', language)}</li>
          <li><strong>{t('rules.upperControls', language)}</strong></li>
          <li><strong>{t('rules.lowerControls', language)}</strong></li>
          <li>{t('rules.sowingBasic', language)}</li>
          <li>{t('rules.landingNonEmpty', language)}</li>
          <li>{t('rules.landingHouse', language)}</li>
          <li>{t('rules.capturing', language)}</li>
          <li><strong>{t('rules.winCondition', language)}</strong></li>
        </ul>
        <div className='modal-links'>
          <a href="https://github.com/ubAI6689/congkak-react" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://twitter.com/AyuInMetaverse" target="_blank" rel="noopener noreferrer">Social</a>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
