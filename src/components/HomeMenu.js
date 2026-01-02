import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../config/translations';
import LanguageSelector from './LanguageSelector';
import './HomeMenu.css';

const HomeMenu = ({ onPlay, onRules, onSettings, isOverlay = false, onClose }) => {
  const { language } = useLanguage();

  const handleOverlayClick = (e) => {
    if (isOverlay && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className={`home-menu ${isOverlay ? 'home-menu--overlay' : 'home-menu--fullscreen'}`}
      onClick={handleOverlayClick}
    >
      <div className="home-menu__content">
        <div className="home-menu__header">
          <h1 className="home-menu__title">{t('menu.title', language)}</h1>
          <p className="home-menu__subtitle">{t('menu.subtitle', language)}</p>
        </div>

        <div className="home-menu__board-graphic">
          <div className="home-menu__holes-row">
            {[...Array(7)].map((_, i) => (
              <div key={`top-${i}`} className="home-menu__hole" />
            ))}
          </div>
          <div className="home-menu__houses">
            <div className="home-menu__house" />
            <div className="home-menu__house" />
          </div>
          <div className="home-menu__holes-row">
            {[...Array(7)].map((_, i) => (
              <div key={`bottom-${i}`} className="home-menu__hole" />
            ))}
          </div>
        </div>

        <nav className="home-menu__nav">
          <button className="home-menu__button home-menu__button--primary" onClick={onPlay}>
            {t('menu.play', language)}
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
