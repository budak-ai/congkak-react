import { useEffect } from 'react';
import './OrientationLock.css';

/**
 * Locks screen orientation to landscape on mobile devices
 * Uses Screen Orientation API (requires fullscreen on some browsers)
 */
const OrientationLock = () => {
  useEffect(() => {
    const lockOrientation = async () => {
      // Check if we're on mobile (rough check)
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (!isMobile) return;

      const screenObj = window.screen;

      try {
        // Try to lock orientation using Screen Orientation API
        if (screenObj.orientation && screenObj.orientation.lock) {
          await screenObj.orientation.lock('landscape');
          console.log('Orientation locked to landscape');
        }
      } catch (err) {
        // Orientation lock failed (might need fullscreen first)
        console.log('Orientation lock not supported or requires fullscreen:', err.message);
        
        // Try requesting fullscreen then locking (on user interaction)
        const requestFullscreenAndLock = async () => {
          try {
            const docEl = document.documentElement;
            if (docEl.requestFullscreen) {
              await docEl.requestFullscreen();
            } else if (docEl.webkitRequestFullscreen) {
              await docEl.webkitRequestFullscreen();
            }
            
            // Try locking again after fullscreen
            if (screenObj.orientation && screenObj.orientation.lock) {
              await screenObj.orientation.lock('landscape');
            }
          } catch (e) {
            console.log('Fullscreen/lock failed:', e.message);
          }
        };

        // Attach to first user interaction
        const handleInteraction = () => {
          requestFullscreenAndLock();
          document.removeEventListener('click', handleInteraction);
          document.removeEventListener('touchstart', handleInteraction);
        };

        document.addEventListener('click', handleInteraction, { once: true });
        document.addEventListener('touchstart', handleInteraction, { once: true });
      }
    };

    lockOrientation();

    return () => {
      // Unlock on unmount
      const screenObj = window.screen;
      if (screenObj.orientation && screenObj.orientation.unlock) {
        screenObj.orientation.unlock();
      }
    };
  }, []);

  return null;
};

export default OrientationLock;
