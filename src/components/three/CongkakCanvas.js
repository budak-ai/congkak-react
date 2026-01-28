import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';
import './CongkakCanvas.css';

/**
 * Main 3D Canvas wrapper for Congkak game
 * Overlays the DOM-based board and renders 3D seeds and cursor
 */
const CongkakCanvas = ({
  // Seed state
  seeds,
  topHouseSeeds,
  lowHouseSeeds,
  seedsInHandUpper,
  seedsInHandLower,
  // Cursor state
  cursorUpperPosition,
  cursorLowerPosition,
  cursorUpperVisible,
  cursorLowerVisible,
  // DOM refs for positioning
  holeRefs,
  topHouseRef,
  lowHouseRef,
  // Visual state
  burnedHolesUpper,
  burnedHolesLower,
  shakeCursorUpper,
  shakeCursorLower,
  canMoveUpper,
  canMoveLower,
  // Game state
  isSowingUpper,
  isSowingLower,
  // Collision waiting states
  handWaitingUpper,
  handWaitingLower,
  // Visual effects
  seedDancingEnabled,
  // Color data for persistent seed colors
  seedColors,
  topHouseColors,
  lowHouseColors,
  colorsInHandUpper,
  colorsInHandLower,
}) => {
  // Force re-render on resize to recalculate positions
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      // Small delay to let layout settle
      setTimeout(() => forceUpdate(prev => prev + 1), 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    // Handle mobile address bar hide/show
    const visualViewport = window.visualViewport;
    if (visualViewport) {
      visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (visualViewport) {
        visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return (
    <div className="congkak-canvas-container">
      <Canvas
        camera={{
          position: [0, 10, 0],  // Pure top-down view
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        style={{ pointerEvents: 'none' }}
        onCreated={({ camera, gl }) => {
          camera.lookAt(0, 0, 0);
          // Handle canvas resize
          const handleResize = () => {
            const container = gl.domElement.parentElement;
            if (container) {
              gl.setSize(container.clientWidth, container.clientHeight);
              camera.aspect = container.clientWidth / container.clientHeight;
              camera.updateProjectionMatrix();
            }
          };
          window.addEventListener('resize', handleResize);
          // Initial size sync
          handleResize();
        }}
      >
        <Suspense fallback={null}>
          <Scene
            seeds={seeds}
            topHouseSeeds={topHouseSeeds}
            lowHouseSeeds={lowHouseSeeds}
            seedsInHandUpper={seedsInHandUpper}
            seedsInHandLower={seedsInHandLower}
            cursorUpperPosition={cursorUpperPosition}
            cursorLowerPosition={cursorLowerPosition}
            cursorUpperVisible={cursorUpperVisible}
            cursorLowerVisible={cursorLowerVisible}
            holeRefs={holeRefs}
            topHouseRef={topHouseRef}
            lowHouseRef={lowHouseRef}
            burnedHolesUpper={burnedHolesUpper}
            burnedHolesLower={burnedHolesLower}
            shakeCursorUpper={shakeCursorUpper}
            shakeCursorLower={shakeCursorLower}
            canMoveUpper={canMoveUpper}
            canMoveLower={canMoveLower}
            isSowingUpper={isSowingUpper}
            isSowingLower={isSowingLower}
            handWaitingUpper={handWaitingUpper}
            handWaitingLower={handWaitingLower}
            seedDancingEnabled={seedDancingEnabled}
            // Color data
            seedColors={seedColors}
            topHouseColors={topHouseColors}
            lowHouseColors={lowHouseColors}
            colorsInHandUpper={colorsInHandUpper}
            colorsInHandLower={colorsInHandLower}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default CongkakCanvas;
