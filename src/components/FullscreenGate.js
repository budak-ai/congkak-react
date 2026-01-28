import React, { useState, useEffect } from 'react';
import './FullscreenGate.css';

/**
 * Blocks game until user enters fullscreen mode
 * Required for orientation lock on mobile
 */
const FullscreenGate = ({ children }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobile);

    // Check if running as PWA (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://');
    setIsPWA(standalone);

    // Check fullscreen state
    const checkFullscreen = () => {
      const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFS);

      // Lock orientation when entering fullscreen
      if (isFS && mobile) {
        const screenObj = window.screen;
        if (screenObj.orientation && screenObj.orientation.lock) {
          screenObj.orientation.lock('landscape').catch(() => {});
        }
      }
    };

    checkFullscreen();
    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);

    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('webkitfullscreenchange', checkFullscreen);
    };
  }, []);

  const requestFullscreen = async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      }
    } catch (err) {
      console.log('Fullscreen request failed:', err);
    }
  };

  // Desktop or PWA - no gate needed
  if (!isMobile || isPWA) {
    return children;
  }

  // Mobile browser - require fullscreen
  if (!isFullscreen) {
    return (
      <div className="fullscreen-gate">
        <div className="fullscreen-gate-content">
          <div className="fullscreen-gate-icon">🎮</div>
          <h1 className="fullscreen-gate-title">CONGKAK</h1>
          <p className="fullscreen-gate-subtitle">Traditional Malaysian Game</p>
          
          <button className="fullscreen-gate-btn" onClick={requestFullscreen}>
            Enter Fullscreen to Play
          </button>
          <div className="fullscreen-gate-alt">Masuk Skrin Penuh untuk Main</div>

          <div className="fullscreen-gate-pwa">
            <div className="fullscreen-gate-divider">or</div>
            <p>Add to Home Screen for best experience</p>
            <p className="fullscreen-gate-pwa-hint">Tambah ke Skrin Utama untuk pengalaman terbaik</p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default FullscreenGate;
