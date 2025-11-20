import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { QuadraticBezierLine, CubicBezierLine } from '@react-three/drei';
import { Transaction, TransactionStyle } from '../types';

const latLonToVector3 = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));

  return new THREE.Vector3(x, y, z);
};

interface TransactionFlowProps {
  transaction: Transaction;
  color: string;
  radius: number;
  style: TransactionStyle;
}

export const TransactionFlow: React.FC<TransactionFlowProps> = ({ transaction, color, radius, style }) => {
  const start = useMemo(() => latLonToVector3(transaction.fromLat, transaction.fromLon, radius), [transaction.fromLat, transaction.fromLon, radius]);
  const end = useMemo(() => latLonToVector3(transaction.toLat, transaction.toLon, radius), [transaction.toLat, transaction.toLon, radius]);
  
  // Calculate trajectory
  const mid = useMemo(() => {
    const height = transaction.isWhale ? 0.6 + Math.random() * 0.4 : 0.2 + Math.random() * 0.2;
    const v = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(radius + height);
    return v;
  }, [start, end, radius, transaction.isWhale]);

  const [progress, setProgress] = React.useState(0); // 0 to 1
  const [opacity, setOpacity] = React.useState(1);

  useFrame((state, delta) => {
    // Lifecycle management
    const speed = transaction.isWhale ? 0.5 : 1.2;
    setProgress(prev => Math.min(1, prev + delta * speed));
    
    if (progress >= 0.9) {
        setOpacity(prev => Math.max(0, prev - delta * 2));
    }
  });

  if (opacity <= 0.01) return null;

  const arcColor = transaction.isWhale ? '#ffffff' : color;

  // ---------------------
  // STYLE: PARTICLES (Clouds/Puffs)
  // ---------------------
  if (style === 'particles') {
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const currentPos = curve.getPoint(progress);
      
      return (
          <mesh position={currentPos}>
              <sphereGeometry args={[transaction.isWhale ? 0.05 : 0.02, 8, 8]} />
              <meshBasicMaterial color={arcColor} transparent opacity={opacity} />
              {/* Trail */}
              <mesh position={[0,0,0]} scale={[2,2,2]}>
                  <sphereGeometry args={[transaction.isWhale ? 0.05 : 0.02, 8, 8]} />
                  <meshBasicMaterial color={arcColor} transparent opacity={opacity * 0.3} />
              </mesh>
          </mesh>
      );
  }

  // ---------------------
  // STYLE: BOLTS
  // ---------------------
  if (style === 'bolts') {
    // Create a jittery path based on the smooth bezier
    // Since we can't easily re-calculate jitter every frame without perf hit, we use a texture or simple line
    // For "Bolts", we can use CubicBezier with a high segment count and rapid opacity flicker
    
    const flicker = Math.random() > 0.5 ? 1 : 0.3;
    
    return (
        <group>
            <QuadraticBezierLine
                start={start}
                end={end}
                mid={mid}
                color={transaction.isWhale ? '#ffff00' : '#00ffff'} // Electric colors
                lineWidth={transaction.isWhale ? 3 : 1.5}
                transparent
                opacity={opacity * flicker}
                dashed={false}
            />
            {/* Flash at endpoints */}
            <mesh position={start}>
                <boxGeometry args={[0.03, 0.03, 0.03]} />
                <meshBasicMaterial color="#fff" />
            </mesh>
        </group>
    );
  }

  // ---------------------
  // STYLE: LINES (Default)
  // ---------------------
  return (
    <group>
        <QuadraticBezierLine
            start={start}
            end={end}
            mid={mid}
            color={arcColor}
            lineWidth={transaction.isWhale ? 3 : 1.2}
            transparent
            opacity={opacity}
        />
        <mesh position={start}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshBasicMaterial color={arcColor} transparent opacity={opacity} />
        </mesh>
    </group>
  );
};