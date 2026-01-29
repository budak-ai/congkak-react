import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../config/translations';
import './MatchEndModal.css';

// Animated counter hook
const useCountUp = (target, duration = 1500, startDelay = 300) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) {
      const delayTimer = setTimeout(() => setStarted(true), startDelay);
      return () => clearTimeout(delayTimer);
    }

    if (target === 0) {
      setCount(0);
      return;
    }

    const startTime = Date.now();
    const endTime = startTime + duration;

    const tick = () => {
      const now = Date.now();
      if (now >= endTime) {
        setCount(target);
        return;
      }

      const progress = (now - startTime) / duration;
      // Ease out cubic for satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [target, duration, started, startDelay]);

  return count;
};

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

  // Animated counters
  const animatedTopSeeds = useCountUp(isOpen ? topHouseSeeds : 0, 1500, 500);
  const animatedLowSeeds = useCountUp(isOpen ? lowHouseSeeds : 0, 1500, 500);

  if (!isOpen) return null;

  const getWinnerText = () => {
    if (winner === 'PLAYER_UPPER') return t('game.p1Wins', language);
    if (winner === 'PLAYER_LOWER') return t('game.p2Wins', language);
    return t('game.draw', language);
  };

  const getReasonText = () => {
    if (reason === 'domination') return t('match.domination', language);
    if (reason === 'concession') return t('match.conceded', language);
    return '';
  };

  const topIsWinner = winner === 'PLAYER_UPPER';
  const lowIsWinner = winner === 'PLAYER_LOWER';

  return (
    <div className="match-end-overlay">
      <div className="match-end-modal">
        <div className="match-end-score">
          <span className={topIsWinner ? 'winner' : ''}>{animatedTopSeeds}</span>
          <span className="match-end-score-separator">-</span>
          <span className={lowIsWinner ? 'winner' : ''}>{animatedLowSeeds}</span>
        </div>
        <div className="match-end-winner">{getWinnerText()}</div>
        {reason && <div className="match-end-reason">{getReasonText()}</div>}

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
