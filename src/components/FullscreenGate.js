import { useEffect, useState } from 'react';
import './FullscreenGate.css';

/**
 * Forces fixed landscape orientation - NEVER rotates
 * Detects actual device orientation and compensates
 */
const FullscreenGate = ({ children }) => {
  const [rotation, setRotation] = useState(0);
  const [dimensions, setDimensions] = useState({ width: '100vw', height: '100vh' });

  useEffect(() => {
    const updateOrientation = () => {
      // Use screen.orientation if available, otherwise use window dimensions
      let angle = 0;
      
      if (window.screen?.orientation?.angle !== undefined) {
        angle = window.screen.orientation.angle;
      } else if (window.orientation !== undefined) {
        angle = window.orientation;
      } else {
        // Fallback: detect from dimensions
        angle = window.innerWidth < window.innerHeight ? 0 : 90;
      }

      // Compensate for device rotation to keep display fixed
      // Device portrait (0°) -> rotate content 90° to show landscape
      // Device landscape (90°) -> no rotation needed
      // Device portrait upside down (180°) -> rotate -90°
      // Device landscape reverse (270° / -90°) -> rotate 180°
      
      let needsRotation = 0;
      let newWidth = '100vw';
      let newHeight = '100vh';

      if (angle === 0 || angle === 180) {
        // Phone is portrait - rotate to landscape
        needsRotation = angle === 0 ? 90 : -90;
        newWidth = '100vh';
        newHeight = '100vw';
      } else if (angle === -90 || angle === 270) {
        // Landscape but reversed
        needsRotation = 180;
      }
      // angle === 90: normal landscape, no rotation

      setRotation(needsRotation);
      setDimensions({ width: newWidth, height: newHeight });
    };

    updateOrientation();

    // Listen for orientation changes
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    
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

  const style = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: dimensions.width,
    height: dimensions.height,
    transform: `rotate(${rotation}deg)`,
    transformOrigin: rotation === 90 ? 'bottom left' : rotation === -90 ? 'top right' : 'center',
    overflow: 'hidden',
  };

  // Adjust position after rotation
  if (rotation === 90) {
    style.top = `-${dimensions.height}`;
    style.left = 0;
  } else if (rotation === -90) {
    style.top = 0;
    style.left = `-${dimensions.width}`;
  }

  return (
    <div className="orientation-lock-container" style={style}>
      {children}
    </div>
  );
};

export default FullscreenGate;
