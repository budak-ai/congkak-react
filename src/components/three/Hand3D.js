import React, { useRef, useMemo } from 'react';
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
}) => {
  const groupRef = useRef();
  const { screenToWorld } = useScreenToWorld();
  const { animation, colors } = threeConfig;

  // Scale hand to be 3/4 of hole size
  const handScale = holeRadius * 0.75;

  // Current interpolated position
  const currentPos = useRef(new THREE.Vector3());
  const shakeOffset = useRef(0);

  // Hand color based on player
  const handColor = isUpper ? colors.handUpper : colors.handLower;

  // Convert screen position to world coordinates
  const targetPos = useMemo(() => {
    if (!position?.left || !position?.top) {
      return new THREE.Vector3(0, 3, 0);
    }
    const world = screenToWorld(position.left, position.top);
    return new THREE.Vector3(world.x, 3, world.z); // Y=3 to float above board
  }, [position, screenToWorld]);

  // Animation loop
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth position interpolation (lerp)
    currentPos.current.lerp(targetPos, animation.lerpFactor);

    // Apply shake effect
    if (shake) {
      shakeOffset.current = Math.sin(state.clock.elapsedTime * 50) * animation.shakeIntensity;
    } else {
      shakeOffset.current *= 0.9; // Decay
    }

    // Update position
    groupRef.current.position.set(
      currentPos.current.x + shakeOffset.current,
      currentPos.current.y,
      currentPos.current.z
    );

    // Pulse glow effect when can move
    const baseScale = 1.2;
    if (canMove) {
      const pulse = Math.sin(state.clock.elapsedTime * 5) * 0.1 + 1;
      groupRef.current.scale.setScalar(baseScale * pulse);
    } else {
      groupRef.current.scale.setScalar(baseScale);
    }

    // Visibility
    groupRef.current.visible = visible;
  });

  return (
    <group
      ref={groupRef}
      rotation={isUpper ? [0, 0, Math.PI] : [0, 0, 0]}
      scale={[8, 8, 8]}
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
        <SeedsInHand count={seedCount} />
      )}
    </group>
  );
};

export default Hand3D;
