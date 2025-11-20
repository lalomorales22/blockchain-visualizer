import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CharacterConfig } from '../types';
import * as THREE from 'three';

interface AvatarProps {
  config: CharacterConfig;
  isFlying?: boolean;
  isBoosting?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ config, isFlying = false, isBoosting = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftThrusterRef = useRef<THREE.Mesh>(null);
  const rightThrusterRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    if (groupRef.current) {
        // Smooth floating animation (always active)
        const hoverY = Math.sin(time * 2) * 0.1; 
        
        // Determine target rotations/positions based on state
        // Iron Man style: upright but tilted slightly forward
        const targetTilt = isFlying ? 0.25 : 0; 
        const targetZRot = isFlying ? Math.sin(time * 4) * 0.02 : 0;
        
        // Smoothly interpolate (Lerp) to avoid snapping/sinking
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetTilt, delta * 5);
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetZRot, delta * 5);
        
        // Add subtle sway
        groupRef.current.position.y = hoverY;

        // Rotate body slightly when idle to look alive
        if (!isFlying) {
             groupRef.current.rotation.y += delta * 0.5;
        } else {
             // Reset Y rotation to face forward when flying
             // We use a specialized lerp for angles to take shortest path, but simple lerp is fine for small angles here
             // resetting to 0 (facing forward)
             groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, delta * 5);
        }
    }

    // Thruster Logic
    if (leftThrusterRef.current && rightThrusterRef.current) {
        const targetScale = isBoosting ? 2.0 + Math.random() : isFlying ? 0.8 + Math.random() * 0.2 : 0;
        
        // Smooth scale for thrusters too
        leftThrusterRef.current.scale.y = THREE.MathUtils.lerp(leftThrusterRef.current.scale.y, targetScale, delta * 10);
        rightThrusterRef.current.scale.y = THREE.MathUtils.lerp(rightThrusterRef.current.scale.y, targetScale, delta * 10);
        
        const color = isBoosting ? new THREE.Color('#00ffff') : new THREE.Color('#ff6600');
        (leftThrusterRef.current.material as THREE.MeshBasicMaterial).color.lerp(color, delta * 5);
        (rightThrusterRef.current.material as THREE.MeshBasicMaterial).color.lerp(color, delta * 5);
    }
  });

  const materials = useMemo(() => {
    return {
        body: new THREE.MeshStandardMaterial({ color: config.bodyColor, roughness: 0.2 }),
        accent: new THREE.MeshStandardMaterial({ color: config.accentColor, emissive: config.accentColor, emissiveIntensity: 0.5 }),
        skin: new THREE.MeshStandardMaterial({ color: '#ffccaa' }),
        dark: new THREE.MeshStandardMaterial({ color: '#1a1a1a' }),
        flame: new THREE.MeshBasicMaterial({ color: '#ff6600' })
    }
  }, [config]);

  return (
    <group ref={groupRef} scale={[0.5, 0.5, 0.5]}>
        {/* Body */}
        <mesh position={[0, 0, 0]} material={materials.body}>
            <boxGeometry args={[1, 1.2, 0.6]} />
        </mesh>

        {/* Jetpack */}
        <mesh position={[0, 0.2, -0.4]} material={materials.dark}>
            <boxGeometry args={[0.8, 0.8, 0.4]} />
        </mesh>
        {/* Thrusters Cans */}
        <mesh position={[-0.2, -0.3, -0.4]} material={materials.accent}>
            <cylinderGeometry args={[0.1, 0.15, 0.4]} />
        </mesh>
        <mesh position={[0.2, -0.3, -0.4]} material={materials.accent}>
            <cylinderGeometry args={[0.1, 0.15, 0.4]} />
        </mesh>

        {/* Thruster Flames */}
        <mesh ref={leftThrusterRef} position={[-0.2, -0.8, -0.4]} rotation={[Math.PI, 0, 0]} material={materials.flame}>
             <coneGeometry args={[0.08, 0.8, 8]} />
        </mesh>
        <mesh ref={rightThrusterRef} position={[0.2, -0.8, -0.4]} rotation={[Math.PI, 0, 0]} material={materials.flame}>
             <coneGeometry args={[0.08, 0.8, 8]} />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 0.9, 0]} material={materials.skin}>
             <boxGeometry args={[0.7, 0.7, 0.7]} />
        </mesh>
        
        {/* Helmet/Visor */}
        <mesh position={[0, 0.9, 0.25]} material={materials.accent}>
             <boxGeometry args={[0.5, 0.2, 0.3]} />
        </mesh>

        {/* Arms */}
        <mesh position={[-0.65, 0.2, 0]} material={materials.body} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.3, 1, 0.3]} />
        </mesh>
        <mesh position={[0.65, 0.2, 0]} material={materials.body} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[0.3, 1, 0.3]} />
        </mesh>

        {/* Legs */}
        <mesh position={[-0.3, -0.9, 0]} material={materials.dark} rotation={[isFlying ? 0.2 : 0, 0, 0]}>
            <boxGeometry args={[0.35, 0.8, 0.35]} />
        </mesh>
        <mesh position={[0.3, -0.9, 0]} material={materials.dark} rotation={[isFlying ? 0.2 : 0, 0, 0]}>
             <boxGeometry args={[0.35, 0.8, 0.35]} />
        </mesh>
    </group>
  );
};

export const generateRandomCharacter = (): CharacterConfig => {
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];
    return {
        seed: Math.random(),
        bodyColor: colors[Math.floor(Math.random() * colors.length)],
        accentColor: colors[Math.floor(Math.random() * colors.length)],
        headType: Math.floor(Math.random() * 3)
    };
};