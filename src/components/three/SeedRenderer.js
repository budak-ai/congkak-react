import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import threeConfig from '../../config/threeConfig';
import useScreenToWorld from '../../hooks/useScreenToWorld';
import { generateSeedLayout } from './Seed3D';

// Maximum number of seed instances (14 holes * 7 seeds + 2 houses * 50 seeds max)
const MAX_INSTANCES = 250;

/**
 * Efficient seed renderer using InstancedMesh
 * Renders all seeds in holes and houses with a single draw call
 */
const SeedRenderer = ({
  seeds,
  topHouseSeeds,
  lowHouseSeeds,
  holeRefs,
  topHouseRef,
  lowHouseRef,
  burnedHolesUpper,
  burnedHolesLower,
  // Color data for persistent seed colors
  seedColors: seedColorIndices,
  topHouseColors: topHouseColorIndices,
  lowHouseColors: lowHouseColorIndices,
}) => {
  const meshRef = useRef();
  const { domElementToWorld, getHoleRadius } = useScreenToWorld();
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  const { seed } = threeConfig;

  // Parse seed colors from config
  const seedColors = useMemo(() =>
    seed.colors.map(c => new THREE.Color(c)),
    [seed.colors]
  );

  // Create shared geometry and material (vertexColors enabled for instance colors)
  const geometry = useMemo(() => (
    new THREE.SphereGeometry(seed.radius, seed.segments, seed.segments)
  ), [seed]);

  const material = useMemo(() => (
    new THREE.MeshStandardMaterial({
      roughness: seed.roughness,
      metalness: seed.metalness,
      vertexColors: false,
    })
  ), [seed]);

  // Calculate all seed positions with their persistent color indices
  const seedData = useMemo(() => {
    const data = [];

    if (!holeRefs?.current) return data;

    // Process holes (indices 0-13)
    seeds?.forEach((seedCount, holeIndex) => {
      const holeElement = holeRefs.current[holeIndex];
      if (!holeElement) return;

      // Check if hole is burned
      const isUpper = holeIndex < 7;
      const localIndex = isUpper ? holeIndex : holeIndex - 7;
      const isBurned = isUpper
        ? burnedHolesUpper?.[localIndex]
        : burnedHolesLower?.[localIndex];

      if (isBurned || seedCount === 0) return;

      const worldPos = domElementToWorld(holeElement);
      const holeRadius = getHoleRadius(holeElement);
      const seedPositions = generateSeedLayout(seedCount, holeRadius);

      // Get the color indices for seeds in this hole
      const holeColorIndices = seedColorIndices?.[holeIndex] || [];

      seedPositions.forEach(([x, y, z], seedIdx) => {
        data.push({
          position: [worldPos.x + x, y, worldPos.z + z],
          visible: true,
          colorIndex: holeColorIndices[seedIdx] ?? (seedIdx % 7), // Fallback to cycling if no color data
        });
      });
    });

    // Process top house
    if (topHouseRef?.current && topHouseSeeds > 0) {
      const worldPos = domElementToWorld(topHouseRef.current);
      const houseRadius = getHoleRadius(topHouseRef.current);
      const seedPositions = generateSeedLayout(topHouseSeeds, houseRadius);

      seedPositions.forEach(([x, y, z], seedIdx) => {
        data.push({
          position: [worldPos.x + x, y, worldPos.z + z],
          visible: true,
          colorIndex: topHouseColorIndices?.[seedIdx] ?? (seedIdx % 7), // Fallback to cycling
        });
      });
    }

    // Process lower house
    if (lowHouseRef?.current && lowHouseSeeds > 0) {
      const worldPos = domElementToWorld(lowHouseRef.current);
      const houseRadius = getHoleRadius(lowHouseRef.current);
      const seedPositions = generateSeedLayout(lowHouseSeeds, houseRadius);

      seedPositions.forEach(([x, y, z], seedIdx) => {
        data.push({
          position: [worldPos.x + x, y, worldPos.z + z],
          visible: true,
          colorIndex: lowHouseColorIndices?.[seedIdx] ?? (seedIdx % 7), // Fallback to cycling
        });
      });
    }

    return data;
  }, [
    seeds,
    topHouseSeeds,
    lowHouseSeeds,
    holeRefs,
    topHouseRef,
    lowHouseRef,
    burnedHolesUpper,
    burnedHolesLower,
    seedColorIndices,
    topHouseColorIndices,
    lowHouseColorIndices,
    domElementToWorld,
    getHoleRadius,
  ]);

  // Update instance matrices and colors when seedData changes
  useEffect(() => {
    if (!meshRef.current || seedData.length === 0) return;

    let instanceIndex = 0;

    // Position visible seeds with their persistent colors
    seedData.forEach(({ position, visible, colorIndex }) => {
      if (visible && instanceIndex < MAX_INSTANCES) {
        tempObject.position.set(position[0], position[1], position[2]);
        tempObject.scale.set(1, 1, 1);
        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(instanceIndex, tempObject.matrix);

        // Use the persistent colorIndex from the data
        const color = seedColors[colorIndex % seedColors.length];
        meshRef.current.setColorAt(instanceIndex, color);

        instanceIndex++;
      }
    });

    // Hide unused instances
    for (let i = instanceIndex; i < MAX_INSTANCES; i++) {
      tempObject.position.set(0, -100, 0);
      tempObject.scale.set(0, 0, 0);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [seedData, tempObject, seedColors]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, MAX_INSTANCES]}
      frustumCulled={false}
    />
  );
};

export default SeedRenderer;
