import { useEffect, useState } from 'react';
import './OrientationLock.css';

/**
 * Keeps game FIXED in landscape orientation (90° / home button right)
 * Counter-rotates for ALL device orientations
 */
const OrientationLock = ({ children }) => {
  const [style, setStyle] = useState({});

  useEffect(() => {
    const updateOrientation = () => {
      // Get device orientation angle
      let angle = 0;
      if (window.screen?.orientation?.angle !== undefined) {
        angle = window.screen.orientation.angle;
      } else if (window.orientation !== undefined) {
        angle = window.orientation;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;

      // We want to always show landscape (as if device is at 90°)
      // Counter-rotate based on current angle to achieve this
      
      let rotation = 0;
      let newWidth = width;
      let newHeight = height;
      let translateX = 0;
      let translateY = 0;

      // Normalize angle to 0, 90, 180, 270
      angle = ((angle % 360) + 360) % 360;

      if (angle === 0) {
        // Portrait normal - rotate 90° CW to show landscape
        rotation = 90;
        newWidth = height;
        newHeight = width;
        translateX = width;
        translateY = 0;
      } else if (angle === 90) {
        // Landscape right (home button right) - this is our target, no rotation
        rotation = 0;
        newWidth = width;
        newHeight = height;
      } else if (angle === 180) {
        // Portrait upside down - rotate -90° (270° CW) to show landscape
        rotation = -90;
        newWidth = height;
        newHeight = width;
        translateX = 0;
        translateY = height;
      } else if (angle === 270 || angle === -90) {
        // Landscape left (home button left) - rotate 180° to flip
        rotation = 180;
        newWidth = width;
        newHeight = height;
        translateX = width;
        translateY = height;
      }

      setStyle({
        position: 'fixed',
        width: newWidth + 'px',
        height: newHeight + 'px',
        transform: `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg)`,
        transformOrigin: 'top left',
        left: 0,
        top: 0,
        overflow: 'hidden',
        background: '#1a1410',
      });
    };

    updateOrientation();

    // Listen to all orientation events
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateOrientation, 50);
      setTimeout(updateOrientation, 150);
    });
    
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', updateOrientation);
    }

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', updateOrientation);
      }
    };
  }, []);

  return (
    <div className="orientation-lock" style={style}>
      {children}
    </div>
  );
};

export default OrientationLock;
