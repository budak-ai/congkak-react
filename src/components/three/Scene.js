import React, { useState, useEffect } from 'react';
import threeConfig from '../../config/threeConfig';
import HoleRenderer from './HoleRenderer';
import SeedRenderer from './SeedRenderer';
import Hand3D from './Hand3D';

/**
 * Check if device is in portrait orientation
 */
const useIsPortrait = () => {
  const [isPortrait, setIsPortrait] = useState(
    window.matchMedia('(orientation: portrait)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(orientation: portrait)');
    const handler = (e) => setIsPortrait(e.matches);
    
    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  return isPortrait;
};

/**
 * Scene component - sets up lighting and contains all 3D elements
 */
const Scene = ({
  seeds,
  topHouseSeeds,
  lowHouseSeeds,
  seedsInHandUpper,
  seedsInHandLower,
  cursorUpperPosition,
  cursorLowerPosition,
  cursorUpperVisible,
  cursorLowerVisible,
  holeRefs,
  topHouseRef,
  lowHouseRef,
  burnedHolesUpper,
  burnedHolesLower,
  shakeCursorUpper,
  shakeCursorLower,
  canMoveUpper,
  canMoveLower,
  isSowingUpper,
  isSowingLower,
  handWaitingUpper,
  handWaitingLower,
  seedDancingEnabled,
  // Color data for persistent seed colors
  seedColors,
  topHouseColors,
  lowHouseColors,
  colorsInHandUpper,
  colorsInHandLower,
}) => {
  const { lighting } = threeConfig;
  const isPortrait = useIsPortrait();
  
  // Counter-rotation for portrait mode
  // CSS rotates container +90° (π/2), so we rotate scene -90° (-π/2) around Y axis
  const sceneRotation = isPortrait ? [0, -Math.PI / 2, 0] : [0, 0, 0];

  return (
    <group rotation={sceneRotation}>
      {/* Lighting */}
      <ambientLight intensity={lighting.ambient.intensity} />
      <directionalLight
        position={lighting.directional.position}
        intensity={lighting.directional.intensity}
      />

      {/* 3D depth for holes and houses */}
      <HoleRenderer
        holeRefs={holeRefs}
        topHouseRef={topHouseRef}
        lowHouseRef={lowHouseRef}
        burnedHolesUpper={burnedHolesUpper}
        burnedHolesLower={burnedHolesLower}
      />

      {/* Seeds in holes and houses */}
      <SeedRenderer
        seeds={seeds}
        topHouseSeeds={topHouseSeeds}
        lowHouseSeeds={lowHouseSeeds}
        holeRefs={holeRefs}
        topHouseRef={topHouseRef}
        lowHouseRef={lowHouseRef}
        burnedHolesUpper={burnedHolesUpper}
        burnedHolesLower={burnedHolesLower}
        seedColors={seedColors}
        topHouseColors={topHouseColors}
        lowHouseColors={lowHouseColors}
        dancingEnabled={seedDancingEnabled}
      />

      {/* Upper player hand cursor */}
      <Hand3D
        position={cursorUpperPosition}
        visible={cursorUpperVisible}
        seedCount={seedsInHandUpper}
        shake={shakeCursorUpper}
        canMove={canMoveUpper}
        isUpper={true}
        isSowing={isSowingUpper}
        waiting={handWaitingUpper}
        holeRadius={2.5}
        colorsInHand={colorsInHandUpper}
      />

      {/* Lower player hand cursor */}
      <Hand3D
        position={cursorLowerPosition}
        visible={cursorLowerVisible}
        seedCount={seedsInHandLower}
        shake={shakeCursorLower}
        canMove={canMoveLower}
        isUpper={false}
        isSowing={isSowingLower}
        waiting={handWaitingLower}
        holeRadius={2.5}
        colorsInHand={colorsInHandLower}
      />
    </group>
  );
};

export default Scene;
