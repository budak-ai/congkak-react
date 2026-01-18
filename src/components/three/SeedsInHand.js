import React, { useMemo } from 'react';
import threeConfig from '../../config/threeConfig';

/**
 * Seeds displayed in the hand during sowing
 * Shows a small cluster of seeds in the palm area
 */
const SeedsInHand = ({ count, colorIndices = [] }) => {
  const { seed } = threeConfig;

  // Generate compact seed positions for hand
  const seedPositions = useMemo(() => {
    const positions = [];
    const maxVisible = Math.min(count, 12); // Show max 12 seeds visually
    const radius = 0.12;

    for (let i = 0; i < maxVisible; i++) {
      const layer = Math.floor(i / 4);
      const indexInLayer = i % 4;
      const angle = (indexInLayer / 4) * Math.PI * 2 + layer * 0.5;
      const r = radius * (1 - layer * 0.2);

      positions.push([
        Math.cos(angle) * r,
        0.1 + layer * 0.08, // Slightly above palm
        Math.sin(angle) * r,
      ]);
    }

    return positions;
  }, [count]);

  // Smaller seed size for hand
  const handSeedRadius = seed.radius * 0.7;

  return (
    <group position={[0, 0, 0.1]}>
      {seedPositions.map((pos, i) => {
        // Use the persistent color index if available, otherwise fallback to cycling
        const colorIdx = colorIndices[i] ?? (i % seed.colors.length);
        return (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[handSeedRadius, 12, 12]} />
            <meshStandardMaterial
              color={seed.colors[colorIdx % seed.colors.length]}
              roughness={seed.roughness}
              metalness={seed.metalness}
            />
          </mesh>
        );
      })}

      {/* Show count if more than visible */}
      {count > 12 && (
        <mesh position={[0, 0.3, 0]}>
          {/* Small indicator sphere */}
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
    </group>
  );
};

export default SeedsInHand;
