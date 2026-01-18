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

/**
 * Simple seeded random number generator for deterministic positioning
 */
function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Generate positions for seeds in house with collision detection
 * Seeds don't overlap and stack realistically within bounds
 */
export function generateHouseSeedLayout(count, houseRadius = 1.0) {
  const { seed } = threeConfig;
  const positions = [];

  if (count === 0) return positions;

  const seedRadius = seed.radius;
  const minDistance = seedRadius * 2.05;
  const maxRadius = houseRadius * 0.7;
  const layerHeight = seedRadius * 1.6;

  // Seeded random for deterministic but natural positions
  const random = seededRandom(count * 1000 + Math.floor(houseRadius * 100));

  // Check collision with all existing positions
  const collides = (x, y, z) => {
    for (const [ex, ey, ez] of positions) {
      const dx = x - ex;
      const dy = y - ey;
      const dz = z - ez;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < minDistance * 0.95) return true;
    }
    return false;
  };

  // Try to place each seed with random position, biased toward center
  for (let i = 0; i < count; i++) {
    let placed = false;

    // Try multiple times to find a valid spot
    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      // Random angle
      const angle = random() * Math.PI * 2;
      // Bias toward center (square root for uniform disk distribution, then bias)
      const rNorm = Math.pow(random(), 1.5); // Bias toward center
      const r = rNorm * maxRadius;

      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      // Try each layer from bottom up
      for (let layer = 0; layer < 8 && !placed; layer++) {
        const y = seedRadius + layer * layerHeight;

        // Upper layers should be smaller radius
        const layerMaxR = maxRadius * (1 - layer * 0.1);
        if (r > layerMaxR) continue;

        if (!collides(x, y, z)) {
          positions.push([x, y, z]);
          placed = true;
        }
      }
    }

    // Fallback: if still not placed, force it somewhere
    if (!placed && positions.length < count) {
      const angle = random() * Math.PI * 2;
      const r = random() * maxRadius * 0.5;
      const layer = Math.floor(positions.length / 6);
      positions.push([
        Math.cos(angle) * r,
        seedRadius + layer * layerHeight,
        Math.sin(angle) * r,
      ]);
    }
  }

  return positions;
}

export default Seed3D;
