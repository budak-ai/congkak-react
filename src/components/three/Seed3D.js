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
 * @param {number} count - Number of seeds
 * @param {number} holeRadius - Radius of the hole
 * @param {number} holeIndex - Index of the hole (for deterministic jitter)
 */
export function generateSeedLayout(count, holeRadius = 0.5, holeIndex = 0) {
  const { cluster } = threeConfig;
  const positions = [];

  if (count === 0) return positions;

  const spreadRadius = Math.min(holeRadius * 0.6, cluster.spreadRadius);

  // Seeded random for deterministic but natural jitter
  const random = seededRandom(holeIndex * 1000 + count);

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

    // Add deterministic slight randomness for natural look
    const jitterX = (random() - 0.5) * 0.05;
    const jitterZ = (random() - 0.5) * 0.05;

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

// Cache for house seed positions to maintain persistence
const housePositionCache = {
  top: { positions: [], houseRadius: 0 },
  low: { positions: [], houseRadius: 0 },
};

/**
 * Generate positions for seeds in house with gravity simulation
 * Seeds drop and settle naturally, rolling into gaps
 * Positions are cached so existing seeds don't move when new ones are added
 */
export function generateHouseSeedLayout(count, houseRadius = 1.0, houseId = 'top') {
  const { seed } = threeConfig;

  if (count === 0) return [];

  const seedRadius = seed.radius;
  const seedDiameter = seedRadius * 2;
  const maxRadius = houseRadius * 0.65;

  // Get or initialize cache for this house
  const cache = housePositionCache[houseId] || { positions: [], houseRadius: 0 };

  // Reset cache if house radius changed
  if (cache.houseRadius !== houseRadius) {
    cache.positions = [];
    cache.houseRadius = houseRadius;
  }

  // If we already have enough cached positions, return slice
  if (cache.positions.length >= count) {
    return cache.positions.slice(0, count);
  }

  // We need to generate more positions - start from where we left off
  const positions = cache.positions.map(p => [...p]); // Copy existing
  const startIndex = positions.length;

  // Seeded random - use a fixed seed per house so it's deterministic
  const baseSeed = houseId === 'top' ? 12345 : 67890;
  const random = seededRandom(baseSeed + startIndex);

  // Get distance between two points
  const distance = (x1, y1, z1, x2, y2, z2) => {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const dz = z1 - z2;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  // Check if position collides with any existing seed
  const getCollision = (x, y, z) => {
    for (let i = 0; i < positions.length; i++) {
      const [ex, ey, ez] = positions[i];
      const dist = distance(x, y, z, ex, ey, ez);
      if (dist < seedDiameter * 0.98) {
        return { collides: true, index: i, dist };
      }
    }
    return { collides: false };
  };

  // Simulate dropping a seed and letting it settle
  const dropSeed = (startX, startZ) => {
    let x = startX;
    let z = startZ;
    let y = 10; // Start high

    const gravity = 0.05;
    const friction = 0.3;
    let vy = 0;
    let vx = 0;
    let vz = 0;
    let settled = false;
    let iterations = 0;
    const maxIterations = 500;

    while (!settled && iterations < maxIterations) {
      iterations++;

      // Apply gravity
      vy -= gravity;
      y += vy;
      x += vx;
      z += vz;

      // Ground collision
      if (y <= seedRadius) {
        y = seedRadius;
        vy = 0;
        vx *= friction;
        vz *= friction;

        // Check if settled (very low velocity)
        if (Math.abs(vx) < 0.001 && Math.abs(vz) < 0.001) {
          settled = true;
        }
      }

      // Wall collision (house boundary)
      const distFromCenter = Math.sqrt(x * x + z * z);
      if (distFromCenter > maxRadius - seedRadius) {
        // Push back toward center
        const nx = x / distFromCenter;
        const nz = z / distFromCenter;
        x = nx * (maxRadius - seedRadius);
        z = nz * (maxRadius - seedRadius);
        // Reflect velocity
        const dot = vx * nx + vz * nz;
        vx = (vx - 2 * dot * nx) * friction;
        vz = (vz - 2 * dot * nz) * friction;
      }

      // Collision with other seeds
      const collision = getCollision(x, y, z);
      if (collision.collides) {
        const other = positions[collision.index];
        const [ox, oy, oz] = other;

        // Calculate collision normal
        const dx = x - ox;
        const dy = y - oy;
        const dz = z - oz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          const nz = dz / dist;

          // Push out of collision
          const overlap = seedDiameter - dist;
          x += nx * overlap * 0.5;
          y += ny * overlap * 0.5;
          z += nz * overlap * 0.5;

          // Roll off - apply tangential velocity
          if (ny > 0.3) {
            // On top of another seed - roll off
            vx += nx * 0.02 + (random() - 0.5) * 0.01;
            vz += nz * 0.02 + (random() - 0.5) * 0.01;
            vy = Math.min(vy, -0.01);
          } else {
            // Side collision - bounce slightly
            const dot = vx * nx + vy * ny + vz * nz;
            vx = (vx - 1.5 * dot * nx) * friction;
            vy = (vy - 1.5 * dot * ny) * friction;
            vz = (vz - 1.5 * dot * nz) * friction;
          }
        }
      }

      // Check if settled
      if (y <= seedRadius + 0.001 && Math.abs(vy) < 0.01 && Math.abs(vx) < 0.005 && Math.abs(vz) < 0.005) {
        // Additional check: not colliding
        if (!getCollision(x, y, z).collides) {
          settled = true;
        }
      }
    }

    // Final ground clamp
    y = Math.max(y, seedRadius);

    // Final bounds check
    const finalDist = Math.sqrt(x * x + z * z);
    if (finalDist > maxRadius - seedRadius) {
      const scale = (maxRadius - seedRadius) / finalDist;
      x *= scale;
      z *= scale;
    }

    return [x, y, z];
  };

  // Drop only NEW seeds (ones beyond what's cached)
  for (let i = startIndex; i < count; i++) {
    // Random drop position within house bounds
    const angle = random() * Math.PI * 2;
    const r = random() * maxRadius * 0.8;
    const startX = Math.cos(angle) * r;
    const startZ = Math.sin(angle) * r;

    const [x, y, z] = dropSeed(startX, startZ);
    positions.push([x, y, z]);
  }

  // Post-process: resolve overlaps only for new seeds against all seeds
  const resolveNewSeedOverlaps = () => {
    const minDist = seedDiameter * 1.0;

    for (let iter = 0; iter < 50; iter++) {
      let moved = false;

      // Only move new seeds, check against all seeds
      for (let i = startIndex; i < positions.length; i++) {
        for (let j = 0; j < positions.length; j++) {
          if (i === j) continue;

          const [x1, y1, z1] = positions[i];
          const [x2, y2, z2] = positions[j];

          const dx = x1 - x2;
          const dy = y1 - y2;
          const dz = z1 - z2;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < minDist && dist > 0) {
            moved = true;
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;
            const nz = dz / dist;

            // Only move the new seed (index i)
            positions[i][0] += nx * overlap;
            positions[i][1] += Math.abs(ny * overlap); // Push up
            positions[i][2] += nz * overlap;

            // Clamp to bounds
            const d = Math.sqrt(positions[i][0] ** 2 + positions[i][2] ** 2);
            if (d > maxRadius - seedRadius) {
              const scale = (maxRadius - seedRadius) / d;
              positions[i][0] *= scale;
              positions[i][2] *= scale;
            }
            positions[i][1] = Math.max(positions[i][1], seedRadius);
          }
        }
      }

      if (!moved) break;
    }
  };

  resolveNewSeedOverlaps();

  // Update cache with new positions
  cache.positions = positions.map(p => [...p]);
  housePositionCache[houseId] = cache;

  return positions;
}

/**
 * Clear house position cache (call on game reset)
 */
export function clearHousePositionCache() {
  housePositionCache.top = { positions: [], houseRadius: 0 };
  housePositionCache.low = { positions: [], houseRadius: 0 };
}

export default Seed3D;
