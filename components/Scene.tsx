import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Html, PointerLockControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { PLANETS } from '../constants';
import { TransactionFilter, CharacterConfig, ViewMode, TransactionStyle } from '../types';
import { Planet } from './Planet';
import { Avatar } from './Avatar';

interface SceneProps {
  visiblePlanetIds: string[];
  filter: TransactionFilter;
  userCharacter: CharacterConfig;
  viewMode: ViewMode;
  txStyle: TransactionStyle;
}

const FlightController = ({ userCharacter, viewMode }: { userCharacter: CharacterConfig, viewMode: ViewMode }) => {
  const { camera } = useThree();
  const [moveState, setMoveState] = useState({ w: false, s: false, a: false, d: false, shift: false });
  
  // Physics Refs
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  
  // Track keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't move if typing in chat (checking if active element is an input)
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      switch(e.key.toLowerCase()) {
        case 'w': setMoveState(prev => ({ ...prev, w: true })); break;
        case 's': setMoveState(prev => ({ ...prev, s: true })); break;
        case 'a': setMoveState(prev => ({ ...prev, a: true })); break;
        case 'd': setMoveState(prev => ({ ...prev, d: true })); break;
        case 'shift': setMoveState(prev => ({ ...prev, shift: true })); break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch(e.key.toLowerCase()) {
        case 'w': setMoveState(prev => ({ ...prev, w: false })); break;
        case 's': setMoveState(prev => ({ ...prev, s: false })); break;
        case 'a': setMoveState(prev => ({ ...prev, a: false })); break;
        case 'd': setMoveState(prev => ({ ...prev, d: false })); break;
        case 'shift': setMoveState(prev => ({ ...prev, shift: false })); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse Wheel Warp (Time Warp Zoom)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
        // Only allow warp in Cockpit mode (First Person)
        if (viewMode !== 'first') return;
        
        // Prevent default scrolling of the page
        e.preventDefault();

        // Warp mechanics
        // e.deltaY is typically +/- 100 per step.
        // Positive deltaY is scrolling down (Zoom Out / Backward)
        // Negative deltaY is scrolling up (Zoom In / Forward)
        
        // High speed factor for "Immediate Transport" feel
        const warpFactor = 0.25; 
        const moveDistance = e.deltaY * warpFactor;
        
        // Translate along local Z axis (Forward/Backward relative to look direction)
        camera.translateZ(moveDistance);
    };

    // Add listener with passive: false to allow preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [viewMode, camera]);

  // Movement Physics Loop
  useFrame((state, delta) => {
    const accelRate = moveState.shift ? 80.0 : 35.0; 
    const friction = 2.5; 
    
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, Number(moveState.s) - Number(moveState.w));
    const sideVector = new THREE.Vector3(Number(moveState.d) - Number(moveState.a), 0, 0);

    // Combined vectors: 
    // frontVector is Z-axis (forward/back). 
    // sideVector is X-axis (left/right). 
    // Adding them gives the diagonal movement vector.
    direction.addVectors(frontVector, sideVector).normalize();

    if (moveState.w || moveState.s || moveState.a || moveState.d) {
        velocity.current.x += direction.x * accelRate * delta;
        velocity.current.z += direction.z * accelRate * delta;
    }

    velocity.current.x -= velocity.current.x * friction * delta;
    velocity.current.z -= velocity.current.z * friction * delta;

    camera.translateX(velocity.current.x * delta);
    camera.translateZ(velocity.current.z * delta);
  });

  const isMoving = Object.values(moveState).some(v => v === true);

  return (
    <group 
        // Position avatar lower (-4) and further forward (-10) to be visible at bottom of screen in 3rd person
        position={[0, -4, viewMode === 'third' ? -10 : -0.5]} 
        rotation={[0, Math.PI, 0]}
    >
         {/* Only render avatar in 3rd person mode */}
         {viewMode === 'third' && (
            <Avatar 
                config={userCharacter} 
                isFlying={isMoving} 
                isBoosting={moveState.shift && isMoving}
            />
         )}
    </group>
  );
};

export const Scene: React.FC<SceneProps> = ({ visiblePlanetIds, filter, userCharacter, viewMode, txStyle }) => {
  return (
    <div className="w-full h-full bg-black"> 
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.2 }}
      >
        <Suspense fallback={<Html center><div className="text-cyan-400 font-mono text-xl animate-pulse">LOADING GALAXY...</div></Html>}>
          <color attach="background" args={['#010103']} />
          
          {/* Deep Space Environment - Speed 0 to stop spinning feeling */}
          <Stars radius={300} depth={100} count={10000} factor={6} saturation={0} fade speed={0} />
          
          {/* Lighting */}
          <ambientLight intensity={0.2} />
          <pointLight position={[100, 50, 100]} intensity={1.5} color="#ffffff" />
          <pointLight position={[-50, -50, -50]} intensity={0.5} color="#4444ff" />
          <hemisphereLight groundColor="#000000" intensity={0.4} />

          {/* Player Camera & Controller */}
          <PerspectiveCamera makeDefault position={[0, 10, 100]} fov={60}>
             <FlightController userCharacter={userCharacter} viewMode={viewMode} />
          </PerspectiveCamera>
          <PointerLockControls />

          {/* Render Planets */}
          {PLANETS.map((planet) => (
            <Planet 
              key={planet.id} 
              data={planet} 
              showData={visiblePlanetIds.includes(planet.id)}
              filter={filter}
              txStyle={txStyle}
            />
          ))}
          
        </Suspense>
      </Canvas>
    </div>
  );
};