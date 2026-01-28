import { useEffect, useState } from 'react';
import './OrientationLock.css';

/**
 * Keeps game FIXED in landscape orientation
 * Counter-rotates when device rotates so game appears stationary
 */
const OrientationLock = ({ children }) => {
  const [style, setStyle] = useState({});

  useEffect(() => {
    const updateOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;

      if (isPortrait) {
        // Phone is portrait - rotate content to landscape
        setStyle({
          position: 'fixed',
          width: height + 'px',
          height: width + 'px',
          transform: 'rotate(90deg)',
          transformOrigin: 'top left',
          left: width + 'px',
          top: 0,
          overflow: 'hidden',
        });
      } else {
        // Phone is landscape - no rotation needed
        setStyle({
          position: 'fixed',
          width: width + 'px',
          height: height + 'px',
          transform: 'none',
          left: 0,
          top: 0,
          overflow: 'hidden',
        });
      }
    };

    updateOrientation();

    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', () => {
      // Delay to let browser finish rotating
      setTimeout(updateOrientation, 100);
    });

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return (
    <div className="orientation-lock" style={style}>
      {children}
    </div>
  );
};

export default OrientationLock;
