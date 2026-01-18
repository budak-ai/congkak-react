import React from 'react';
import threeConfig from '../../config/threeConfig';
import SeedRenderer from './SeedRenderer';
import Hand3D from './Hand3D';

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
}) => {
  const { lighting } = threeConfig;


  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={lighting.ambient.intensity} />
      <directionalLight
        position={lighting.directional.position}
        intensity={lighting.directional.intensity}
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
        holeRadius={2.5}
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
        holeRadius={2.5}
      />
    </>
  );
};

export default Scene;
