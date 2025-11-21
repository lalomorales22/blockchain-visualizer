import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Html, PointerLockControls, PerspectiveCamera, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { PLANETS } from '../constants';
import { TransactionFilter, CharacterConfig, ViewMode, TransactionStyle, PlanetBalanceMap, UserTransaction, PlanetaryPositionMap, InteractionTarget } from '../types';
import { Planet } from './Planet';
import { Avatar } from './Avatar';

interface SceneProps {
  visiblePlanetIds: string[];
  filter: TransactionFilter;
  userCharacter: CharacterConfig;
  viewMode: ViewMode;
  txStyle: TransactionStyle;
  onInteractionTarget: (target: InteractionTarget | null) => void;
  planetBalances: PlanetBalanceMap;
  userTransactions: UserTransaction[];
  isEditMode: boolean;
  planetPositions: PlanetaryPositionMap;
  onPlanetPositionChange: (id: string, pos: THREE.Vector3) => void;
}

interface FlightControllerProps {
  userCharacter: CharacterConfig;
  viewMode: ViewMode;
  isLocked: boolean;
  onPositionUpdate: (pos: THREE.Vector3) => void;
  isEditMode: boolean;
}

const FlightController = ({ userCharacter, viewMode, isLocked, onPositionUpdate, isEditMode }: FlightControllerProps) => {
  const { camera } = useThree();
  const [moveState, setMoveState] = useState({ w: false, s: false, a: false, d: false, shift: false });
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
        if (viewMode !== 'first' || !isLocked || isEditMode) return;
        e.preventDefault();
        const warpFactor = 0.25; 
        const moveDistance = e.deltaY * warpFactor;
        camera.translateZ(moveDistance);
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [viewMode, camera, isLocked, isEditMode]);

  useFrame((state, delta) => {
    if (isLocked && !isEditMode) {
        const accelRate = moveState.shift ? 80.0 : 35.0; 
        const friction = 2.5; 
        const direction = new THREE.Vector3();
        const frontVector = new THREE.Vector3(0, 0, Number(moveState.s) - Number(moveState.w));
        // Fix strafe directions using addVectors correctly mapped
        const sideVector = new THREE.Vector3(Number(moveState.d) - Number(moveState.a), 0, 0);
        direction.addVectors(frontVector, sideVector).normalize();

        if (moveState.w || moveState.s || moveState.a || moveState.d) {
            velocity.current.x += direction.x * accelRate * delta;
            velocity.current.z += direction.z * accelRate * delta;
        }

        velocity.current.x -= velocity.current.x * friction * delta;
        velocity.current.z -= velocity.current.z * friction * delta;

        camera.translateX(velocity.current.x * delta);
        camera.translateZ(velocity.current.z * delta);
        
        onPositionUpdate(camera.position.clone());
    }
  });

  const isMoving = Object.values(moveState).some(v => v === true) && isLocked && !isEditMode;

  return (
    <group position={[0, -4, viewMode === 'third' ? -10 : -0.5]} rotation={[0, Math.PI, 0]}>
         {viewMode === 'third' && <Avatar config={userCharacter} isFlying={isMoving} isBoosting={moveState.shift && isMoving} />}
    </group>
  );
};

export const Scene: React.FC<SceneProps> = ({ 
    visiblePlanetIds, 
    filter, 
    userCharacter, 
    viewMode, 
    txStyle, 
    onInteractionTarget, 
    planetBalances, 
    userTransactions,
    isEditMode,
    planetPositions,
    onPlanetPositionChange
}) => {
  const [isLocked, setIsLocked] = useState(false);
  
  const handlePositionUpdate = (pos: THREE.Vector3) => {
      // Find closest planet/entity
      let closest: InteractionTarget | null = null;
      let minDist = 50; // Interaction range

      PLANETS.forEach(p => {
          const pPos = planetPositions[p.id] ? new THREE.Vector3(...planetPositions[p.id]) : new THREE.Vector3(...p.position);
          const dist = pos.distanceTo(pPos);
          if (dist < minDist) {
              minDist = dist;
              closest = {
                  id: p.id,
                  type: p.entityType || 'planet',
                  name: p.name,
                  distance: dist
              };
          }
      });
      onInteractionTarget(closest);
  };

  return (
    <div className="w-full h-full bg-black" id="scene-container"> 
      <Canvas dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.2 }}>
        <Suspense fallback={<Html center><div className="text-cyan-400 font-mono text-xl animate-pulse">LOADING GALAXY...</div></Html>}>
          <color attach="background" args={['#010103']} />
          <Stars radius={300} depth={100} count={10000} factor={6} saturation={0} fade speed={0} />
          <ambientLight intensity={0.2} />
          <pointLight position={[100, 50, 100]} intensity={1.5} color="#ffffff" />
          <pointLight position={[-50, -50, -50]} intensity={0.5} color="#4444ff" />
          <hemisphereLight groundColor="#000000" intensity={0.4} />

          <PerspectiveCamera makeDefault position={[0, 10, 100]} fov={60}>
             <FlightController 
                userCharacter={userCharacter} 
                viewMode={viewMode} 
                isLocked={isLocked} 
                onPositionUpdate={handlePositionUpdate}
                isEditMode={isEditMode}
             />
          </PerspectiveCamera>
          
          {!isEditMode && (
             <PointerLockControls selector="#scene-container" onLock={() => setIsLocked(true)} onUnlock={() => setIsLocked(false)} />
          )}

          {PLANETS.map((planet) => {
             const pos = planetPositions[planet.id] ? new THREE.Vector3(...planetPositions[planet.id]) : new THREE.Vector3(...planet.position);
             
             const PlanetNode = (
                <Planet 
                    key={planet.id} 
                    data={planet} 
                    showData={visiblePlanetIds.includes(planet.id)}
                    filter={filter}
                    txStyle={txStyle}
                    userBalance={planetBalances[planet.id] || 0}
                    userTransactions={userTransactions.filter(tx => tx.toPlanetId === planet.id && Date.now() - tx.timestamp < 10000)}
                    userColor={userCharacter.accentColor}
                    dynamicPosition={[pos.x, pos.y, pos.z]}
                />
             );

             if (isEditMode) {
                 return (
                     <TransformControls 
                        key={planet.id} 
                        position={[pos.x, pos.y, pos.z]} 
                        mode="translate"
                        onMouseUp={(e) => {
                            if (e?.target?.object) {
                                onPlanetPositionChange(planet.id, e.target.object.position.clone());
                            }
                        }}
                     >
                        {PlanetNode}
                     </TransformControls>
                 );
             }

             return PlanetNode;
          })}
        </Suspense>
      </Canvas>
    </div>
  );
};