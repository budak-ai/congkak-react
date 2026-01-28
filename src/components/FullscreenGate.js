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
  const [isIOS, setIsIOS] = useState(false);

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
          
          {!isIOS && (
            <button className="fullscreen-gate-btn" onClick={requestFullscreen}>
              ▶ Enter Fullscreen
            </button>
          )}
          
          {isIOS && (
            <div className="fullscreen-gate-ios-notice">
              <p>iOS requires adding to Home Screen</p>
              <p className="hint">iOS memerlukan tambah ke Skrin Utama</p>
            </div>
          )}

          <div className="fullscreen-gate-instructions">
            <div className="fullscreen-gate-divider">
              {isIOS ? 'How to Add to Home Screen' : 'Or add to Home Screen for best experience'}
            </div>
            
            {isIOS ? (
              <ol className="fullscreen-gate-steps">
                <li>Tap the <strong>Share</strong> button <span className="icon">⬆️</span></li>
                <li>Scroll down, tap <strong>"Add to Home Screen"</strong></li>
                <li>Tap <strong>"Add"</strong> in the top right</li>
                <li>Open Congkak from your Home Screen</li>
              </ol>
            ) : (
              <ol className="fullscreen-gate-steps">
                <li>Tap the <strong>⋮ menu</strong> (top right)</li>
                <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
                <li>Tap <strong>"Add"</strong> to confirm</li>
                <li>Open Congkak from your Home Screen</li>
              </ol>
            )}

            <div className="fullscreen-gate-steps-bm">
              {isIOS ? (
                <ol>
                  <li>Tekan butang <strong>Kongsi</strong> <span className="icon">⬆️</span></li>
                  <li>Tatal ke bawah, tekan <strong>"Tambah ke Skrin Utama"</strong></li>
                  <li>Tekan <strong>"Tambah"</strong></li>
                  <li>Buka Congkak dari Skrin Utama</li>
                </ol>
              ) : (
                <ol>
                  <li>Tekan <strong>menu ⋮</strong> (kanan atas)</li>
                  <li>Tekan <strong>"Tambah ke skrin utama"</strong></li>
                  <li>Tekan <strong>"Tambah"</strong></li>
                  <li>Buka Congkak dari Skrin Utama</li>
                </ol>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default FullscreenGate;
