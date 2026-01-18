import { useCallback } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Hook to convert screen coordinates to 3D world coordinates
 */
export function useScreenToWorld() {
  const { camera, size, gl } = useThree();

  const screenToWorld = useCallback((screenX, screenY) => {
    // Get canvas position on screen
    const canvas = gl.domElement;
    const canvasRect = canvas.getBoundingClientRect();

    // Calculate position relative to canvas (0 to 1)
    const relX = (screenX - canvasRect.left) / canvasRect.width;
    const relY = (screenY - canvasRect.top) / canvasRect.height;

    // Calculate visible world area at y=0
    const cameraY = camera.position.y;
    const fovRad = (camera.fov * Math.PI) / 180;
    const visibleHeight = 2 * cameraY * Math.tan(fovRad / 2);
    const visibleWidth = visibleHeight * (canvasRect.width / canvasRect.height);

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

    // Calculate visible world area
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
