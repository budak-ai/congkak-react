import React, { Suspense } from 'react';
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
  // Color data for persistent seed colors
  seedColors,
  topHouseColors,
  lowHouseColors,
  colorsInHandUpper,
  colorsInHandLower,
}) => {
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
        onCreated={({ camera }) => {
          camera.lookAt(0, 0, 0);
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
