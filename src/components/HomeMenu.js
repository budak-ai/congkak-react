import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../config/translations';
import LanguageSelector from './LanguageSelector';
import './HomeMenu.css';

const HomeMenu = ({ onPlay, onRules, onSettings, isOverlay = false, onClose }) => {
  const { language } = useLanguage();
  const [selectedMode, setSelectedMode] = useState('quick');

  const handleOverlayClick = (e) => {
    if (isOverlay && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  const handlePlay = () => {
    onPlay(selectedMode);
  };

  return (
    <div
      className={`home-menu ${isOverlay ? 'home-menu--overlay' : 'home-menu--fullscreen'}`}
      onClick={handleOverlayClick}
    >
      <div className="home-menu__bg-glow" />
      <div className="home-menu__bg-glow home-menu__bg-glow--2" />

      <div className="home-menu__content">
        <div className="home-menu__header">
          <div className="home-menu__ornament">✦</div>
          <h1 className="home-menu__title">{t('menu.title', language)}</h1>
          <div className="home-menu__divider">
            <span className="home-menu__divider-line" />
            <span className="home-menu__divider-dot">◈</span>
            <span className="home-menu__divider-line" />
          </div>
          <p className="home-menu__subtitle">{t('menu.subtitle', language)}</p>
        </div>

        {!isOverlay && (
          <div className="home-menu__mode-select">
            <button
              className={`home-menu__mode-btn ${selectedMode === 'quick' ? 'home-menu__mode-btn--active' : ''}`}
              onClick={() => setSelectedMode('quick')}
            >
              {t('menu.quickMatch', language)}
            </button>
            <button
              className={`home-menu__mode-btn ${selectedMode === 'traditional' ? 'home-menu__mode-btn--active' : ''}`}
              onClick={() => setSelectedMode('traditional')}
            >
              {t('menu.traditional', language)}
            </button>
          </div>
        )}

        <nav className="home-menu__nav">
          <button className="home-menu__button home-menu__button--primary" onClick={handlePlay}>
            <span className="home-menu__button-text">{t('menu.play', language)}</span>
          </button>
          <button className="home-menu__button" onClick={onRules}>
            {t('menu.rules', language)}
          </button>
          <button className="home-menu__button" onClick={onSettings}>
            {t('menu.settings', language)}
          </button>
        </nav>

        {isOverlay && (
          <button className="home-menu__close" onClick={onClose} aria-label="Close menu">
            <i className="fa fa-times"></i>
          </button>
        )}
      </div>

      {!isOverlay && <LanguageSelector />}
    </div>
  );
};

export default HomeMenu;
