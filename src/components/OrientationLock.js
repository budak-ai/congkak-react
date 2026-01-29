import { useEffect, useState } from 'react';
import './OrientationLock.css';

/**
 * Simple orientation handler:
 * - Shows "rotate device" prompt when in portrait
 * - Lets app render naturally in landscape
 * - Tries to lock orientation via API on first interaction
 */
const OrientationLock = ({ children }) => {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if portrait (height > width)
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
    };

    // Try to lock orientation on user interaction
    const tryLockOrientation = () => {
      if (window.screen?.orientation?.lock) {
        window.screen.orientation.lock('landscape').catch(() => {
          // Orientation lock failed - CSS fallback handles it
        });
      }
    };

    // Initial check
    checkOrientation();

    // Listen for changes
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', () => {
      // Delay check to let orientation settle
      setTimeout(checkOrientation, 100);
    });

    // Lock on first interaction
    const onInteraction = () => {
      tryLockOrientation();
      document.removeEventListener('touchstart', onInteraction);
      document.removeEventListener('click', onInteraction);
    };
    document.addEventListener('touchstart', onInteraction, { once: true });
    document.addEventListener('click', onInteraction, { once: true });

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return (
    <>
      {isPortrait && (
        <div className="rotate-prompt">
          <div className="rotate-prompt__icon">📱</div>
          <h2 className="rotate-prompt__title">Rotate Your Device</h2>
          <p className="rotate-prompt__text">Congkak is best played in landscape mode</p>
        </div>
      )}
      <div className={`orientation-content ${isPortrait ? 'orientation-content--hidden' : ''}`}>
        {children}
      </div>
    </>
  );
};

export default OrientationLock;
