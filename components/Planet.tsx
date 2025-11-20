import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { PlanetData, Transaction, TransactionFilter, TransactionStyle } from '../types';
import { TransactionFlow } from './TransactionFlow';
import { InterPlanetaryFlow } from './InterPlanetaryFlow';
import { CITIES, PLANETS } from '../constants';

interface PlanetProps {
  data: PlanetData;
  showData: boolean;
  filter: TransactionFilter;
  txStyle: TransactionStyle;
}

// Procedural Building Generator for Exchange
const CityBlock = ({ count = 20, color }: { count?: number, color: string }) => {
  const buildings = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 8,
        0,
        (Math.random() - 0.5) * 8
      ] as [number, number, number],
      scale: [
        0.5 + Math.random() * 1.5,
        2 + Math.random() * 8, // Tall buildings
        0.5 + Math.random() * 1.5
      ] as [number, number, number],
      color: Math.random() > 0.8 ? '#ffffff' : color
    }));
  }, [count, color]);

  return (
    <group>
       {/* Platform Base */}
       <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[6, 6, 1, 6]} />
          <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
          {/* Neon Ring */}
          <mesh position={[0, 0.1, 0]}>
             <ringGeometry args={[5.8, 6, 32]} />
             <meshBasicMaterial color={color} side={THREE.DoubleSide} />
          </mesh>
       </mesh>
       
       {buildings.map((b, i) => (
         <mesh key={i} position={[b.position[0], b.scale[1]/2, b.position[2]]}>
            <boxGeometry args={[b.scale[0], b.scale[1], b.scale[2]]} />
            <meshStandardMaterial 
              color={b.color} 
              transparent 
              opacity={0.8} 
              emissive={b.color} 
              emissiveIntensity={0.3}
            />
            {/* Wireframe edge effect */}
            <lineSegments>
               <edgesGeometry args={[new THREE.BoxGeometry(b.scale[0], b.scale[1], b.scale[2])]} />
               <lineBasicMaterial color={color} linewidth={2} />
            </lineSegments>
         </mesh>
       ))}
    </group>
  );
};

const BridgeStructure = ({ color }: { color: string }) => {
    return (
        <group>
            {/* The Arch */}
            <mesh rotation={[Math.PI, 0, 0]} position={[0, 0, 0]}>
                <torusGeometry args={[15, 1, 16, 100, Math.PI]} />
                <meshStandardMaterial 
                    color={color} 
                    emissive={color} 
                    emissiveIntensity={1}
                    roughness={0.2}
                    metalness={1}
                />
            </mesh>
            {/* Base pillars */}
            <mesh position={[-15, -5, 0]}>
                <cylinderGeometry args={[2, 3, 10, 8]} />
                <meshStandardMaterial color="#333" />
            </mesh>
             <mesh position={[15, -5, 0]}>
                <cylinderGeometry args={[2, 3, 10, 8]} />
                <meshStandardMaterial color="#333" />
            </mesh>
        </group>
    );
};

export const Planet: React.FC<PlanetProps> = ({ data, showData, filter, txStyle }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  // Load texture ONLY if it's a planet type
  const isPlanet = !data.entityType || data.entityType === 'planet';
  const textureUrl = isPlanet ? data.textureUrl : PLANETS[0].textureUrl; // Fallback to avoid hook error
  const [colorMap, cloudsMap] = useLoader(TextureLoader, [
    textureUrl, 
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png"
  ]);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Traffic Simulation Engine
  useEffect(() => {
    if (!showData) {
        setTransactions([]); 
        return;
    }

    // Traffic Intensity settings
    let generationRate = 600; 
    let batchSize = 1;

    if (data.entityType === 'exchange') {
        generationRate = 200;
        batchSize = 5;
    } else if (data.entityType === 'bridge') {
        generationRate = 800;
        batchSize = 2;
    } else {
        // Existing Planet Logic
        switch(data.id) {
            case 'solana': generationRate = 50; batchSize = 8; break;
            case 'bitcoin': generationRate = 800; batchSize = 1; break;
            default: generationRate = 200; batchSize = 2; break;
        }
    }

    const interval = setInterval(() => {
      const newTxs: Transaction[] = [];

      for(let i=0; i<batchSize; i++) {
          const isWhale = Math.random() > 0.95; 
          const amount = isWhale ? Math.floor(Math.random() * 1000000) : Math.floor(Math.random() * 5000) + 100;
          
          const txId = Math.random().toString(36).substr(2, 9);
          
          // LOGIC BRANCH: Inter-Planetary vs Internal
          if (data.entityType === 'exchange' || data.entityType === 'bridge') {
              // Pick a random partner planet to send/receive funds from
              const partnerPlanet = PLANETS.filter(p => p.id !== data.id && (!p.entityType || p.entityType === 'planet'))[Math.floor(Math.random() * 8)]; // Only pick first few major planets
              
              if (!partnerPlanet) continue;

              const isDeposit = Math.random() > 0.5;
              
              // Exchange/Bridge Position
              const entityPos = new THREE.Vector3(...data.position);
              // Partner Position
              const partnerPos = new THREE.Vector3(...partnerPlanet.position);

              // If it's a bridge, we might visualize Planet A -> Bridge -> Planet B in one go, 
              // but for simplicity, let's just show flow To/From the Bridge.
              
              newTxs.push({
                id: txId,
                amount,
                currency: 'USD',
                startPos: isDeposit ? partnerPos : entityPos,
                endPos: isDeposit ? entityPos : partnerPos,
                isInterplanetary: true,
                timestamp: Date.now(),
                isWhale
              });

          } else {
             // INTERNAL PLANET FLOW (City to City)
             const source = CITIES[Math.floor(Math.random() * CITIES.length)];
             let dest = CITIES[Math.floor(Math.random() * CITIES.length)];
             while(dest.name === source.name) dest = CITIES[Math.floor(Math.random() * CITIES.length)];

             newTxs.push({
                id: txId,
                amount,
                currency: data.name.split(' ')[1]?.replace(/[()]/g, '') || 'COIN',
                fromLat: source.lat,
                fromLon: source.lon,
                toLat: dest.lat,
                toLon: dest.lon,
                timestamp: Date.now(),
                isWhale
             });
          }
      }

      setTransactions(prev => {
          const updated = [...prev, ...newTxs];
          const limit = data.id === 'solana' ? 150 : 60;
          return updated.slice(-limit); 
      });
    }, generationRate);

    return () => clearInterval(interval);
  }, [showData, data.id, data.entityType, data.name, data.position]);

  useFrame((state, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.02;
    }
    if (meshRef.current && isPlanet) {
        meshRef.current.rotation.y += delta * 0.005;
    }
    if (groupRef.current && data.entityType === 'exchange') {
        // Slowly rotate the whole exchange city
        groupRef.current.rotation.y -= delta * 0.05;
    }
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filter.showLargeWhalesOnly && !t.isWhale) return false;
      if (t.amount < filter.minAmount) return false;
      return true;
    });
  }, [transactions, filter]);

  const planetColor = new THREE.Color(data.color);

  // RENDER SWITCH
  const renderGeometry = () => {
      if (data.entityType === 'exchange') {
          return <CityBlock color={data.color} />;
      }
      if (data.entityType === 'bridge') {
          return <BridgeStructure color={data.color} />;
      }

      // Default: Planet Sphere
      return (
        <>
            {/* Atmosphere Glow */}
            <mesh scale={[1.2, 1.2, 1.2]}>
                <sphereGeometry args={[1.05, 32, 32]} />
                <meshBasicMaterial 
                color={data.color} 
                transparent 
                opacity={showData ? 0.15 : 0.02} 
                side={THREE.BackSide} 
                blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Surface */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial 
                map={colorMap} 
                color={planetColor} 
                roughness={0.7}
                metalness={0.3}
                emissive={planetColor}
                emissiveIntensity={showData ? 0.2 : 0.05}
                />
            </mesh>

            {/* Clouds */}
            <mesh ref={cloudsRef} scale={[1.01, 1.01, 1.01]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial 
                map={cloudsMap} 
                transparent 
                opacity={0.15} 
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
                alphaMap={cloudsMap}
                />
            </mesh>
        </>
      );
  };

  return (
    <group position={data.position} ref={groupRef}>
      
      {renderGeometry()}

      {/* Transactions */}
      {showData && filteredTransactions.map((tx) => {
          if (tx.isInterplanetary) {
             // We need to convert world coordinates to local coordinates if we render inside the group
             // Actually, InterPlanetaryFlow expects World Coordinates. 
             // But we are inside a <group position={...}> so local 0,0,0 is the planet center.
             // It's easier to render inter-planetary flows in the global Scene, OR
             // Inverse transform the points to local space.
             
             // To fix this simply: transform the start/end points relative to THIS group position
             // Start (World) - MyPosition (World) = Start (Local)
             const myPos = new THREE.Vector3(...data.position);
             const localStart = tx.startPos!.clone().sub(myPos);
             const localEnd = tx.endPos!.clone().sub(myPos);
             
             return (
                 <InterPlanetaryFlow 
                    key={tx.id} 
                    transaction={{...tx, startPos: localStart, endPos: localEnd}} 
                    color={data.color} 
                    style={txStyle} 
                 />
             );
          } else {
             return (
                <TransactionFlow 
                    key={tx.id} 
                    transaction={tx} 
                    color={data.color} 
                    radius={1.0} 
                    style={txStyle} 
                />
             );
          }
      })}
    </group>
  );
};