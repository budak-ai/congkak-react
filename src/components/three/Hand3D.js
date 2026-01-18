import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import threeConfig from '../../config/threeConfig';
import useScreenToWorld from '../../hooks/useScreenToWorld';
import SeedsInHand from './SeedsInHand';

/**
 * 3D Hand cursor component
 * Follows screen position and displays seeds being held
 */
const Hand3D = ({
  position, // { left, top } in screen coordinates
  visible,
  seedCount,
  shake,
  canMove,
  isUpper,
  isSowing,
  holeRadius = 1.5, // Default hole radius in world units
  colorsInHand = [], // Color indices for seeds in hand
}) => {
  const groupRef = useRef();
  const { screenToWorld } = useScreenToWorld();
  const { animation, colors } = threeConfig;

  // Current interpolated position
  const currentPos = useRef(new THREE.Vector3());

  // Store props in refs so useFrame callback always has latest values
  const positionRef = useRef(position);
  const visibleRef = useRef(visible);
  const shakeRef = useRef(shake);
  const canMoveRef = useRef(canMove);
  positionRef.current = position;
  visibleRef.current = visible;
  shakeRef.current = shake;
  canMoveRef.current = canMove;

  // Hand color based on player
  const handColor = isUpper ? colors.handUpper : colors.handLower;

  // Animation loop
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Convert screen position to world coordinates every frame
    const pos = positionRef.current;
    let targetX = 0, targetZ = 0;
    if (pos?.left && pos?.top) {
      const world = screenToWorld(pos.left, pos.top);
      targetX = world.x;
      targetZ = world.z;
    }

    // Smooth position interpolation (lerp)
    currentPos.current.x += (targetX - currentPos.current.x) * animation.lerpFactor;
    currentPos.current.y = 0.5; // Just above seeds, reduces perspective distortion
    currentPos.current.z += (targetZ - currentPos.current.z) * animation.lerpFactor;

    // Apply shake effect (X and Z axes like original)
    let shakeX = 0, shakeZ = 0;
    if (shakeRef.current) {
      const t = state.clock.elapsedTime * 50;
      shakeX = Math.sin(t) * animation.shakeIntensity;
      shakeZ = Math.cos(t * 1.3) * animation.shakeIntensity * 0.7;
    }

    // Update position
    groupRef.current.position.set(
      currentPos.current.x + shakeX,
      currentPos.current.y,
      currentPos.current.z + shakeZ
    );

    // Pulse glow effect when can move
    const baseScale = 1.2;
    if (canMoveRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 5) * 0.1 + 1;
      groupRef.current.scale.setScalar(baseScale * pulse);
    } else {
      groupRef.current.scale.setScalar(baseScale);
    }

    // Visibility
    groupRef.current.visible = visibleRef.current;
  });

  return (
    <group
      ref={groupRef}
      rotation={isUpper ? [0, 0, 0] : [0, Math.PI, 0]}
      scale={[6, 6, 6]}
    >
      {/* Simple hand geometry - palm */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.15, 0.7]} />
        <meshStandardMaterial color={handColor} roughness={0.6} />
      </mesh>

      {/* Thumb */}
      <mesh position={[-0.35, 0, -0.2]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.2, 0.12, 0.18]} />
        <meshStandardMaterial color={handColor} roughness={0.6} />
      </mesh>

      {/* Fingers (4) */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[0.22 - i * 0.15, 0, 0.45]}
          rotation={[0.2, 0, 0]}
        >
          <boxGeometry args={[0.12, 0.1, 0.35]} />
          <meshStandardMaterial color={handColor} roughness={0.6} />
        </mesh>
      ))}

      {/* Seeds in hand */}
      {seedCount > 0 && (
        <SeedsInHand count={seedCount} colorIndices={colorsInHand} />
      )}
    </group>
  );
};

export default Hand3D;
