import React, { useState, useEffect } from 'react';
import './FullscreenGate.css';

/**
 * Blocks game until in landscape orientation
 * Also handles fullscreen for non-PWA mobile browsers
 */
const FullscreenGate = ({ children }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    // Check if mobile
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobile);

    // Check if iOS
    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsIOS(ios);

    // Check if running as PWA (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://');
    setIsPWA(standalone);

    // Check orientation
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
    };

    // Check fullscreen state
    const checkFullscreen = () => {
      const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFS);

      // Lock orientation when entering fullscreen (Android)
      if (isFS && mobile && !ios) {
        const screenObj = window.screen;
        if (screenObj.orientation && screenObj.orientation.lock) {
          screenObj.orientation.lock('landscape').catch(() => {});
        }
      }
    };

    checkOrientation();
    checkFullscreen();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
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

  // Desktop - no gate needed
  if (!isMobile) {
    return children;
  }

  // Mobile in portrait - show rotate message (even for PWA)
  if (isPortrait) {
    return (
      <div className="fullscreen-gate">
        <div className="fullscreen-gate-content">
          <div className="fullscreen-gate-rotate-icon">📱</div>
          <div className="fullscreen-gate-rotate-arrow">↻</div>
          <h2 className="fullscreen-gate-rotate-text">Rotate to Landscape</h2>
          <p className="fullscreen-gate-rotate-hint">Putar ke mod Landskap</p>
        </div>
      </div>
    );
  }

  // PWA in landscape - good to go
  if (isPWA) {
    return children;
  }

  // Mobile browser in landscape but not fullscreen - prompt fullscreen
  if (!isFullscreen) {
    return (
      <div className="fullscreen-gate">
        <div className="fullscreen-gate-content">
          <div className="fullscreen-gate-icon">🎮</div>
          <h1 className="fullscreen-gate-title">CONGKAK</h1>
          <p className="fullscreen-gate-subtitle">Traditional Malaysian Game</p>
          
          {!isIOS && (
            <button className="fullscreen-gate-btn" onClick={requestFullscreen}>
              ▶ Enter Fullscreen
            </button>
          )}
          
          {isIOS && (
            <div className="fullscreen-gate-ios-notice">
              <p>Add to Home Screen to play</p>
              <p className="hint">Tambah ke Skrin Utama untuk main</p>
            </div>
          )}

          <div className="fullscreen-gate-instructions">
            <div className="fullscreen-gate-divider">
              {isIOS ? 'How to Add to Home Screen' : 'Or add to Home Screen'}
            </div>
            
            {isIOS ? (
              <ol className="fullscreen-gate-steps">
                <li>Tap <strong>Share</strong> <span className="icon">⬆️</span></li>
                <li>Tap <strong>"Add to Home Screen"</strong></li>
                <li>Tap <strong>"Add"</strong></li>
              </ol>
            ) : (
              <ol className="fullscreen-gate-steps">
                <li>Tap <strong>⋮ menu</strong></li>
                <li>Tap <strong>"Add to Home screen"</strong></li>
                <li>Tap <strong>"Add"</strong></li>
              </ol>
            )}
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default FullscreenGate;
