import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetData, Transaction, TransactionFilter, TransactionStyle, UserTransaction } from '../types';
import { TransactionFlow } from './TransactionFlow';
import { InterPlanetaryFlow } from './InterPlanetaryFlow';
import { CITIES, PLANETS } from '../constants';

interface PlanetProps {
  data: PlanetData;
  showData: boolean;
  filter: TransactionFilter;
  txStyle: TransactionStyle;
  userBalance?: number;
  userTransactions?: UserTransaction[];
  userColor?: string;
  dynamicPosition?: [number, number, number];
}

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
        2 + Math.random() * 8, 
        0.5 + Math.random() * 1.5
      ] as [number, number, number],
      color: Math.random() > 0.8 ? '#ffffff' : color
    }));
  }, [count, color]);

  return (
    <group>
       <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[6, 6, 1, 6]} />
          <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
          <mesh position={[0, 0.1, 0]}>
             <ringGeometry args={[5.8, 6, 32]} />
             <meshBasicMaterial color={color} side={THREE.DoubleSide} />
          </mesh>
       </mesh>
       
       {buildings.map((b, i) => (
         <mesh key={i} position={[b.position[0], b.scale[1]/2, b.position[2]]}>
            <boxGeometry args={[b.scale[0], b.scale[1], b.scale[2]]} />
            <meshStandardMaterial color={b.color} transparent opacity={0.8} emissive={b.color} emissiveIntensity={0.3} />
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
            <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
                {/* Adjusted Geometry for Arch Shape (Not U-Shape) */}
                <torusGeometry args={[15, 1, 16, 100, Math.PI]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} roughness={0.2} metalness={1} />
            </mesh>
            <mesh position={[-15, -5, 0]}><cylinderGeometry args={[2, 3, 10, 8]} /><meshStandardMaterial color="#333" /></mesh>
            <mesh position={[15, -5, 0]}><cylinderGeometry args={[2, 3, 10, 8]} /><meshStandardMaterial color="#333" /></mesh>
        </group>
    );
};

export const Planet: React.FC<PlanetProps> = ({ data, showData, filter, txStyle, userBalance = 0, userTransactions = [], userColor = '#00ffff', dynamicPosition }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  const isPlanet = !data.entityType || data.entityType === 'planet';
  const textureUrl = isPlanet ? data.textureUrl : PLANETS[0].textureUrl;
  const [colorMap, cloudsMap] = useLoader(TextureLoader, [
    textureUrl, 
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png"
  ]);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const currentPosition = dynamicPosition || data.position;

  // Handle USER Transactions (Beams from DEX)
  useEffect(() => {
    if (userTransactions.length > 0) {
        // Create visual flow for new user tx
        // NOTE: In a real generic transfer, startPos would be dynamic. For now we assume flow TO this planet.
        // To visualize internal flows or flows from other planets properly, we'd need a global context of positions.
        // Here we just visualize incoming user TXs.
        
        const newUserTxs = userTransactions.map(tx => ({
             id: 'user-' + tx.hash,
             amount: tx.amount,
             currency: 'USDT',
             // We need to find where it came from. Since we don't have full galaxy map inside Planet, 
             // we approximate startPos as "Up High" if unknown, or we rely on parent to pass flows.
             // For simplicity in this component, we start flows high up.
             startPos: new THREE.Vector3(currentPosition[0], currentPosition[1] + 50, currentPosition[2]), 
             endPos: new THREE.Vector3(...currentPosition),
             isInterplanetary: true,
             timestamp: Date.now(),
             isWhale: true,
             isUserTransaction: true,
             userColor: userColor
        }));
        setTransactions(prev => [...prev, ...newUserTxs]);
    }
  }, [userTransactions, userColor, currentPosition]);

  useEffect(() => {
    if (!showData) {
        setTransactions([]); 
        return;
    }

    let generationRate = 600; 
    let batchSize = 1;

    if (data.entityType === 'exchange') { generationRate = 200; batchSize = 5; } 
    else if (data.entityType === 'bridge') { generationRate = 800; batchSize = 2; } 
    else {
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
          
          if (data.entityType === 'exchange' || data.entityType === 'bridge') {
              // Mock external flows for structures
              const offset = new THREE.Vector3((Math.random()-0.5)*50, (Math.random()-0.5)*50, (Math.random()-0.5)*50);
              const entityPos = new THREE.Vector3(...currentPosition);
              
              newTxs.push({
                id: txId,
                amount,
                currency: 'USD',
                startPos: entityPos.clone().add(offset),
                endPos: entityPos,
                isInterplanetary: true,
                timestamp: Date.now(),
                isWhale
              });
          } else {
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
  }, [showData, data.id, data.entityType, data.name, currentPosition]);

  useFrame((state, delta) => {
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.02;
    if (meshRef.current && isPlanet) meshRef.current.rotation.y += delta * 0.005;
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.isUserTransaction) return true; 
      if (filter.showLargeWhalesOnly && !t.isWhale) return false;
      if (t.amount < filter.minAmount) return false;
      return true;
    });
  }, [transactions, filter]);

  const planetColor = new THREE.Color(data.color);
  const planetScale = data.size || 1;

  const renderGeometry = () => {
      if (data.entityType === 'exchange') return <CityBlock color={data.color} />;
      if (data.entityType === 'bridge') return <BridgeStructure color={data.color} />;
      return (
        <group scale={[planetScale, planetScale, planetScale]}>
            <mesh scale={[1.2, 1.2, 1.2]}>
                <sphereGeometry args={[1.05, 32, 32]} />
                <meshBasicMaterial color={data.color} transparent opacity={showData ? 0.15 : 0.02} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh ref={meshRef}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial map={colorMap} color={planetColor} roughness={0.7} metalness={0.3} emissive={planetColor} emissiveIntensity={showData ? 0.2 : 0.05} />
            </mesh>
            <mesh ref={cloudsRef} scale={[1.01, 1.01, 1.01]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial map={cloudsMap} transparent opacity={0.15} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} alphaMap={cloudsMap} />
            </mesh>
        </group>
      );
  };

  return (
    <group position={currentPosition} ref={groupRef}>
      {renderGeometry()}
      
      {/* MASSIVE Floating Label */}
      <Html position={[0, (planetScale) + 5, 0]} center distanceFactor={50} zIndexRange={[100, 0]}>
         <div className="flex flex-col items-center pointer-events-none" style={{ width: '300px' }}>
             <h1 className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] uppercase text-center leading-none">
                 {data.name.split('(')[0]}
             </h1>
             <h2 className="text-2xl font-bold text-cyan-300 drop-shadow-[0_0_5px_#000]">
                 {data.name.match(/\(([^)]+)\)/)?.[1] || ''}
             </h2>
             {userBalance > 0 && (
                 <div className="mt-2 bg-black/80 border border-green-500 px-4 py-1 rounded-full">
                     <span className="text-green-400 font-mono text-2xl font-bold">+${userBalance.toLocaleString()}</span>
                 </div>
             )}
         </div>
      </Html>

      {showData && filteredTransactions.map((tx) => {
          if (tx.isInterplanetary) {
             // Render local interplanetary flows
             const myPos = new THREE.Vector3(...currentPosition);
             // Recalculate locals relative to this group
             const localStart = tx.startPos!.clone().sub(myPos);
             const localEnd = tx.endPos!.clone().sub(myPos);
             return <InterPlanetaryFlow key={tx.id} transaction={{...tx, startPos: localStart, endPos: localEnd}} color={tx.isUserTransaction ? tx.userColor! : data.color} style={txStyle} />;
          } else {
             return <TransactionFlow key={tx.id} transaction={tx} color={data.color} radius={planetScale} style={txStyle} />;
          }
      })}
    </group>
  );
};