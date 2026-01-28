import React from 'react';
import './OrientationLock.css';

/**
 * Shows a "rotate device" overlay when mobile is in portrait mode
 */
const OrientationLock = () => {
  return (
    <div className="orientation-lock">
      <div className="orientation-lock-content">
        <div className="orientation-lock-icon">📱↔️</div>
        <div className="orientation-lock-text">
          Please rotate your device
        </div>
        <div className="orientation-lock-subtext">
          Sila pusingkan peranti anda
        </div>
      </div>
    </div>
  );
};

export default OrientationLock;
