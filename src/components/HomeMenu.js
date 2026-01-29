import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../config/translations';
import LanguageSelector from './LanguageSelector';
import './HomeMenu.css';
import { unlockAudio, playClick } from '../utils/sounds';
import { AI_DIFFICULTY } from '../ai/congkakAI';

const HomeMenu = ({ onPlay, onRules, onSettings, isOverlay = false, onClose }) => {
  const { language } = useLanguage();
  const [selectedMode, setSelectedMode] = useState('quick');
  const [vsAI, setVsAI] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState(AI_DIFFICULTY.MEDIUM);

  const handleOverlayClick = (e) => {
    if (isOverlay && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  const handlePlay = () => {
    unlockAudio();
    playClick();
    onPlay(selectedMode, vsAI, aiDifficulty);
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
          <>
            {/* Game Mode Selection */}
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

            {/* VS Mode Selection (Human vs AI) */}
            <div className="home-menu__mode-select home-menu__vs-select">
              <button
                className={`home-menu__mode-btn ${!vsAI ? 'home-menu__mode-btn--active' : ''}`}
                onClick={() => setVsAI(false)}
              >
                {t('menu.vsHuman', language)}
              </button>
              <button
                className={`home-menu__mode-btn ${vsAI ? 'home-menu__mode-btn--active' : ''}`}
                onClick={() => setVsAI(true)}
              >
                {t('menu.vsAI', language)}
              </button>
            </div>

            {/* AI Difficulty Selection (only shown when VS AI is selected) */}
            {vsAI && (
              <div className="home-menu__difficulty-select">
                <span className="home-menu__difficulty-label">{t('menu.difficulty', language)}:</span>
                <div className="home-menu__difficulty-buttons">
                  <button
                    className={`home-menu__diff-btn ${aiDifficulty === AI_DIFFICULTY.EASY ? 'home-menu__diff-btn--active' : ''}`}
                    onClick={() => setAiDifficulty(AI_DIFFICULTY.EASY)}
                  >
                    {t('menu.easy', language)}
                  </button>
                  <button
                    className={`home-menu__diff-btn ${aiDifficulty === AI_DIFFICULTY.MEDIUM ? 'home-menu__diff-btn--active' : ''}`}
                    onClick={() => setAiDifficulty(AI_DIFFICULTY.MEDIUM)}
                  >
                    {t('menu.medium', language)}
                  </button>
                  <button
                    className={`home-menu__diff-btn ${aiDifficulty === AI_DIFFICULTY.HARD ? 'home-menu__diff-btn--active' : ''}`}
                    onClick={() => setAiDifficulty(AI_DIFFICULTY.HARD)}
                  >
                    {t('menu.hard', language)}
                  </button>
                </div>
              </div>
            )}
          </>
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
