import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../config/translations';
import './MatchEndModal.css';

const MatchEndModal = ({
  isOpen,
  winner,
  reason,
  topHouseSeeds,
  lowHouseSeeds,
  roundsPlayed,
  onPlayAgain,
  onMainMenu
}) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const getWinnerText = () => {
    if (winner === 'PLAYER_UPPER') return t('game.darkWins', language);
    if (winner === 'PLAYER_LOWER') return t('game.whiteWins', language);
    return t('game.draw', language);
  };

  const getReasonText = () => {
    if (reason === 'domination') return t('match.domination', language);
    if (reason === 'concession') return t('match.conceded', language);
    return '';
  };

  return (
    <div className="match-end-overlay">
      <div className="match-end-modal">
        <div className="match-end-title">{t('match.winner', language)}</div>
        <div className="match-end-winner">{getWinnerText()}</div>
        {reason && <div className="match-end-reason">{getReasonText()}</div>}

        <div className="match-end-stats">
          <div className="match-end-stat">
            <span className="match-end-stat-label">{t('round.upperSeeds', language)}</span>
            <span className="match-end-stat-value">{topHouseSeeds}</span>
          </div>
          <div className="match-end-stat">
            <span className="match-end-stat-label">{t('round.lowerSeeds', language)}</span>
            <span className="match-end-stat-value">{lowHouseSeeds}</span>
          </div>
          <div className="match-end-stat">
            <span className="match-end-stat-label">{t('round.number', language)}s</span>
            <span className="match-end-stat-value">{roundsPlayed}</span>
          </div>
        </div>

        <div className="match-end-actions">
          <button className="match-end-btn match-end-btn--primary" onClick={onPlayAgain}>
            {t('match.playAgain', language)}
          </button>
          <button className="match-end-btn" onClick={onMainMenu}>
            {t('match.mainMenu', language)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchEndModal;
