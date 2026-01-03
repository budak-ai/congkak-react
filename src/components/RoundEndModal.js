import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../config/translations';
import './RoundEndModal.css';

const RoundEndModal = ({
  isOpen,
  roundNumber,
  topHouseSeeds,
  lowHouseSeeds,
  burnedHolesUpper,
  burnedHolesLower,
  onContinue,
  onEndMatch
}) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const upperBurnedCount = burnedHolesUpper.filter(b => b).length;
  const lowerBurnedCount = burnedHolesLower.filter(b => b).length;

  return (
    <div className="round-end-overlay">
      <div className="round-end-modal">
        <h2>{t('round.end', language)}</h2>
        <div className="round-end-round-number">
          {t('round.number', language)} {roundNumber}
        </div>

        <div className="round-end-stats">
          <div className="round-end-player">
            <div className="round-end-player-label">{t('round.upperSeeds', language)}</div>
            <div className="round-end-player-seeds">{topHouseSeeds}</div>
            <div className="round-end-player-burned">
              {upperBurnedCount > 0 && `${upperBurnedCount} burned`}
            </div>
          </div>

          <div className="round-end-vs">vs</div>

          <div className="round-end-player">
            <div className="round-end-player-label">{t('round.lowerSeeds', language)}</div>
            <div className="round-end-player-seeds">{lowHouseSeeds}</div>
            <div className="round-end-player-burned">
              {lowerBurnedCount > 0 && `${lowerBurnedCount} burned`}
            </div>
          </div>
        </div>

        <div className="round-end-actions">
          <button className="round-end-btn round-end-btn--primary" onClick={onContinue}>
            {t('round.continue', language)}
          </button>
          <button className="round-end-btn" onClick={onEndMatch}>
            {t('round.endMatch', language)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoundEndModal;
