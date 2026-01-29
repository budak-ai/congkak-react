import { useEffect, useState } from 'react';
import './OrientationLock.css';

/**
 * LOCKS game to ONE landscape orientation (home button on right).
 * Counter-rotates the entire app when device rotates so the game NEVER moves.
 * For 2-player game where players sit opposite each other.
 */
const OrientationLock = ({ children }) => {
  const [transform, setTransform] = useState({});

  useEffect(() => {
    const updateOrientation = () => {
      // Get device orientation angle
      let angle = 0;
      if (window.screen?.orientation?.angle !== undefined) {
        angle = window.screen.orientation.angle;
      } else if (window.orientation !== undefined) {
        angle = window.orientation;
      }

      // Normalize to 0, 90, 180, 270
      angle = ((angle % 360) + 360) % 360;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Target: Always show as if device is in landscape (90°)
      // We counter-rotate to cancel out device rotation

      let rotation = 0;
      let width = vw;
      let height = vh;
      let top = 0;
      let left = 0;

      if (angle === 0) {
        // Portrait (normal) - rotate content 90° clockwise
        rotation = 90;
        width = vh;
        height = vw;
        left = vw;
        top = 0;
      } else if (angle === 90) {
        // Landscape (home right) - this is our target, no rotation
        rotation = 0;
        width = vw;
        height = vh;
        left = 0;
        top = 0;
      } else if (angle === 180) {
        // Portrait (upside down) - rotate -90° (counter-clockwise)
        rotation = -90;
        width = vh;
        height = vw;
        left = 0;
        top = vh;
      } else if (angle === 270) {
        // Landscape (home left) - rotate 180°
        rotation = 180;
        width = vw;
        height = vh;
        left = vw;
        top = vh;
      }

      setTransform({
        position: 'fixed',
        width: width + 'px',
        height: height + 'px',
        left: left + 'px',
        top: top + 'px',
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'top left',
        overflow: 'hidden',
        background: '#1a1410',
      });
    };

    // Initial
    updateOrientation();

    // Listen for orientation changes
    window.addEventListener('resize', updateOrientation);
    
    const onOrientationChange = () => {
      // Multiple updates to catch the final state
      updateOrientation();
      setTimeout(updateOrientation, 50);
      setTimeout(updateOrientation, 150);
      setTimeout(updateOrientation, 300);
    };
    
    window.addEventListener('orientationchange', onOrientationChange);
    
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', onOrientationChange);
    }

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', onOrientationChange);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', onOrientationChange);
      }
    };
  }, []);

  return (
    <div className="orientation-lock" style={transform}>
      {children}
    </div>
  );
};

export default OrientationLock;
