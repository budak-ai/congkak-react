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
        // Phone is portrait - rotate content -90deg (counter-clockwise)
        // So when user rotates phone clockwise to landscape, game appears normal
        setStyle({
          position: 'fixed',
          width: height + 'px',
          height: width + 'px',
          transform: 'rotate(-90deg)',
          transformOrigin: 'top right',
          top: height + 'px',
          right: 0,
          left: 'auto',
          overflow: 'hidden',
        });
      } else {
        // Phone is landscape - no rotation needed
        setStyle({
          position: 'fixed',
          width: width + 'px',
          height: height + 'px',
          transform: 'none',
          transformOrigin: 'center',
          left: 0,
          top: 0,
          right: 'auto',
          overflow: 'hidden',
        });
      }
    };

    updateOrientation();

    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', () => {
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
