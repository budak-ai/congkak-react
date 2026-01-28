import { useCallback, useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Hook to convert screen coordinates to 3D world coordinates
 * Fixed for mobile viewport issues
 */
export function useScreenToWorld() {
  const { camera, size, gl } = useThree();
  // Force recalculation on window resize (important for mobile)
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      forceUpdate(prev => prev + 1);
    };

    // Handle both resize and orientation change
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    // Also listen for scroll (mobile address bar)
    window.addEventListener('scroll', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, []);

  const screenToWorld = useCallback((screenX, screenY) => {
    // Get canvas position on screen
    const canvas = gl.domElement;
    const canvasRect = canvas.getBoundingClientRect();

    // Use actual canvas dimensions (not CSS dimensions) for accuracy
    const actualWidth = canvasRect.width;
    const actualHeight = canvasRect.height;

    // Calculate position relative to canvas (0 to 1)
    // Account for canvas offset from viewport
    const relX = (screenX - canvasRect.left) / actualWidth;
    const relY = (screenY - canvasRect.top) / actualHeight;

    // Calculate visible world area at y=0
    const cameraY = camera.position.y;
    const fovRad = (camera.fov * Math.PI) / 180;
    const visibleHeight = 2 * cameraY * Math.tan(fovRad / 2);
    // Use canvas aspect ratio, not window aspect ratio
    const aspectRatio = actualWidth / actualHeight;
    const visibleWidth = visibleHeight * aspectRatio;

    // Map to world coordinates (centered at 0,0)
    const worldX = (relX - 0.5) * visibleWidth;
    const worldZ = (relY - 0.5) * visibleHeight;

    return { x: worldX, y: 0, z: worldZ };
  }, [camera, gl]);

  const domElementToWorld = useCallback((element) => {
    if (!element) return { x: 0, y: 0, z: 0 };

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    return screenToWorld(centerX, centerY);
  }, [screenToWorld]);

  const getHoleRadius = useCallback((element) => {
    if (!element) return 0.5;

    const rect = element.getBoundingClientRect();
    const canvas = gl.domElement;
    const canvasRect = canvas.getBoundingClientRect();

    // Calculate visible world area using actual canvas height
    const cameraY = camera.position.y;
    const fovRad = (camera.fov * Math.PI) / 180;
    const visibleHeight = 2 * cameraY * Math.tan(fovRad / 2);

    // Convert pixel width to world width
    const pixelToWorld = visibleHeight / canvasRect.height;
    return (rect.width / 2) * pixelToWorld;
  }, [camera, gl]);

  return { screenToWorld, domElementToWorld, getHoleRadius };
}

export default useScreenToWorld;
