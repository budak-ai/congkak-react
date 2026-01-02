import React, { useState, useEffect } from 'react';
import './Countdown.css';

const Countdown = ({ onComplete, duration = 3 }) => {
  const [count, setCount] = useState(duration);
  const [showGo, setShowGo] = useState(false);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else if (count === 0 && !showGo) {
      setShowGo(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    }
  }, [count, showGo, onComplete]);

  return (
    <div className="countdown-overlay">
      <div className="countdown-content">
        {count > 0 ? (
          <span className="countdown-number">{count}</span>
        ) : (
          <span className="countdown-go">GO!</span>
        )}
      </div>
    </div>
  );
};

export default Countdown;
