import { useEffect, useRef } from 'react';
import './FullscreenGate.css';

/**
 * Locks to landscape once - NEVER changes after
 */
const FullscreenGate = ({ children }) => {
  const containerRef = useRef(null);
  const lockedRef = useRef(false);

  useEffect(() => {
    // Lock dimensions on first load when in landscape
    // Or force landscape dimensions if starting in portrait
    const lockToLandscape = () => {
      if (lockedRef.current) return; // Already locked, never change again
      
      const vw = Math.max(window.innerWidth, window.innerHeight);
      const vh = Math.min(window.innerWidth, window.innerHeight);
      
      if (containerRef.current) {
        containerRef.current.style.width = vw + 'px';
        containerRef.current.style.height = vh + 'px';
        
        // If currently portrait, rotate to show landscape
        if (window.innerHeight > window.innerWidth) {
          containerRef.current.style.transform = 'rotate(90deg)';
          containerRef.current.style.transformOrigin = 'top left';
          containerRef.current.style.position = 'fixed';
          containerRef.current.style.top = '0';
          containerRef.current.style.left = vh + 'px';
        } else {
          containerRef.current.style.transform = 'none';
          containerRef.current.style.position = 'fixed';
          containerRef.current.style.top = '0';
          containerRef.current.style.left = '0';
        }
        
        lockedRef.current = true; // Lock forever
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(lockToLandscape, 100);
  }, []);

  return (
    <div ref={containerRef} className="locked-landscape">
      {children}
    </div>
  );
};

export default FullscreenGate;
