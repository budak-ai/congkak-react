import React, { useMemo } from 'react';
import * as THREE from 'three';
import threeConfig from '../../config/threeConfig';
import useScreenToWorld from '../../hooks/useScreenToWorld';

/**
 * Renders 3D depth for holes and houses
 * Creates bowl-like depressions where seeds sit
 */
const HoleRenderer = ({
  holeRefs,
  topHouseRef,
  lowHouseRef,
  burnedHolesUpper,
  burnedHolesLower,
}) => {
  const { domElementToWorld, getHoleRadius } = useScreenToWorld();
  const { hole: holeConfig, house: houseConfig } = threeConfig;

  // Calculate hole positions and sizes
  const holeData = useMemo(() => {
    const data = [];

    if (!holeRefs?.current) return data;

    // Process 14 holes
    for (let i = 0; i < 14; i++) {
      const element = holeRefs.current[i];
      if (!element) continue;

      // Check if burned
      const isUpper = i < 7;
      const localIndex = isUpper ? i : i - 7;
      const isBurned = isUpper
        ? burnedHolesUpper?.[localIndex]
        : burnedHolesLower?.[localIndex];

      const worldPos = domElementToWorld(element);
      const radius = getHoleRadius(element);

      data.push({
        position: [worldPos.x, 0, worldPos.z],
        radius,
        isBurned,
        isHouse: false,
      });
    }

    return data;
  }, [holeRefs, burnedHolesUpper, burnedHolesLower, domElementToWorld, getHoleRadius]);

  // Calculate house positions and sizes
  const houseData = useMemo(() => {
    const data = [];

    if (topHouseRef?.current) {
      const worldPos = domElementToWorld(topHouseRef.current);
      const radius = getHoleRadius(topHouseRef.current);
      data.push({
        position: [worldPos.x, 0, worldPos.z],
        radius,
        isTop: true,
      });
    }

    if (lowHouseRef?.current) {
      const worldPos = domElementToWorld(lowHouseRef.current);
      const radius = getHoleRadius(lowHouseRef.current);
      data.push({
        position: [worldPos.x, 0, worldPos.z],
        radius,
        isTop: false,
      });
    }

    return data;
  }, [topHouseRef, lowHouseRef, domElementToWorld, getHoleRadius]);

  return (
    <group>
      {/* Render holes */}
      {holeData.map((hole, index) => (
        <HoleMesh
          key={`hole-${index}`}
          position={hole.position}
          radius={hole.radius}
          depth={holeConfig.depth}
          segments={holeConfig.segments}
          color={hole.isBurned ? '#1a1a1a' : holeConfig.color}
          rimColor={hole.isBurned ? '#2a2a2a' : holeConfig.rimColor}
          rimWidth={holeConfig.rimWidth}
        />
      ))}

      {/* Render houses */}
      {houseData.map((house, index) => (
        <HoleMesh
          key={`house-${index}`}
          position={house.position}
          radius={house.radius}
          depth={houseConfig.depth}
          segments={houseConfig.segments}
          color={houseConfig.color}
          rimColor={houseConfig.rimColor}
          rimWidth={houseConfig.rimWidth}
        />
      ))}
    </group>
  );
};

/**
 * Individual hole/bowl mesh with depth
 */
const HoleMesh = ({
  position,
  radius,
  depth,
  segments,
  color,
  rimColor,
  rimWidth,
}) => {
  // Create bowl geometry (hemisphere facing down)
  const bowlGeometry = useMemo(() => {
    // Use a lathe geometry to create a smooth bowl shape
    const points = [];
    const bowlSegments = 12;

    // Create bowl profile (curved bottom)
    for (let i = 0; i <= bowlSegments; i++) {
      const t = i / bowlSegments;
      // Parabolic curve for natural bowl shape
      const y = -depth * (1 - t * t);
      const x = radius * t;
      points.push(new THREE.Vector2(x, y));
    }

    return new THREE.LatheGeometry(points, segments);
  }, [radius, depth, segments]);

  // Create rim geometry (torus at the top)
  const rimGeometry = useMemo(() => {
    return new THREE.TorusGeometry(radius, rimWidth, 8, segments);
  }, [radius, rimWidth, segments]);

  const bowlMaterial = useMemo(() => (
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide,
    })
  ), [color]);

  const rimMaterial = useMemo(() => (
    new THREE.MeshStandardMaterial({
      color: rimColor,
      roughness: 0.6,
      metalness: 0.2,
    })
  ), [rimColor]);

  return (
    <group position={position}>
      {/* Bowl interior */}
      <mesh geometry={bowlGeometry} material={bowlMaterial} />

      {/* Rim around the top */}
      <mesh
        geometry={rimGeometry}
        material={rimMaterial}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      />
    </group>
  );
};

export default HoleRenderer;
