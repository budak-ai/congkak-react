import React, { useMemo } from 'react';
import * as THREE from 'three';
import threeConfig from '../../config/threeConfig';

/**
 * Individual seed mesh (used for non-instanced rendering if needed)
 */
const Seed3D = ({ position = [0, 0, 0], color }) => {
  const { seed } = threeConfig;

  const material = useMemo(() => (
    new THREE.MeshStandardMaterial({
      color: color || seed.color,
      roughness: seed.roughness,
      metalness: seed.metalness,
    })
  ), [color, seed]);

  return (
    <mesh position={position}>
      <sphereGeometry args={[seed.radius, seed.segments, seed.segments]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

/**
 * Generate positions for seeds arranged in a hole
 * Creates a natural-looking pile with circular arrangement and stacking
 */
export function generateSeedLayout(count, holeRadius = 0.5) {
  const { cluster } = threeConfig;
  const positions = [];

  if (count === 0) return positions;

  const spreadRadius = Math.min(holeRadius * 0.6, cluster.spreadRadius);

  for (let i = 0; i < count; i++) {
    const layer = Math.floor(i / cluster.maxSeedsPerLayer);
    const indexInLayer = i % cluster.maxSeedsPerLayer;
    const seedsInThisLayer = Math.min(
      cluster.maxSeedsPerLayer,
      count - layer * cluster.maxSeedsPerLayer
    );

    // Angle offset per layer for visual variety
    const angleOffset = layer * 0.5;
    const angle = (indexInLayer / seedsInThisLayer) * Math.PI * 2 + angleOffset;

    // Radius decreases slightly per layer (pyramid shape)
    const layerRadius = spreadRadius * (1 - layer * 0.15);

    // Add slight randomness for natural look
    const jitterX = (Math.random() - 0.5) * 0.05;
    const jitterZ = (Math.random() - 0.5) * 0.05;

    positions.push([
      Math.cos(angle) * layerRadius + jitterX,
      layer * cluster.layerHeight + threeConfig.seed.radius, // Y is up
      Math.sin(angle) * layerRadius + jitterZ,
    ]);
  }

  return positions;
}

export default Seed3D;
