import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { QuadraticBezierLine } from '@react-three/drei';
import { Transaction, TransactionStyle } from '../types';

interface InterPlanetaryFlowProps {
  transaction: Transaction;
  color: string;
  style: TransactionStyle;
}

export const InterPlanetaryFlow: React.FC<InterPlanetaryFlowProps> = ({ transaction, color, style }) => {
  const start = transaction.startPos!;
  const end = transaction.endPos!;
  
  const mid = useMemo(() => {
    // Calculate a control point that creates an arc away from the center of the galaxy to look nice
    const midPoint = start.clone().add(end).multiplyScalar(0.5);
    // Add upward/outward arch
    midPoint.y += 20; 
    return midPoint;
  }, [start, end]);

  const [progress, setProgress] = React.useState(0);
  const [opacity, setOpacity] = React.useState(1);

  useFrame((state, delta) => {
    const speed = transaction.isWhale ? 0.3 : 0.8; // Space travel takes longer
    setProgress(prev => Math.min(1, prev + delta * speed));
    
    if (progress >= 0.95) {
        setOpacity(prev => Math.max(0, prev - delta * 2));
    }
  });

  if (opacity <= 0.01) return null;

  const arcColor = transaction.isWhale ? '#ffffff' : color;

  if (style === 'particles') {
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const currentPos = curve.getPoint(progress);
      return (
          <mesh position={currentPos}>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshBasicMaterial color={arcColor} transparent opacity={opacity} />
          </mesh>
      );
  }

  if (style === 'bolts') {
    const flicker = Math.random() > 0.5 ? 1 : 0.3;
    return (
        <QuadraticBezierLine
            start={start}
            end={end}
            mid={mid}
            color={transaction.isWhale ? '#ffff00' : '#00ffff'}
            lineWidth={transaction.isWhale ? 4 : 2}
            transparent
            opacity={opacity * flicker}
        />
    );
  }

  // Default Lines
  return (
    <group>
        <QuadraticBezierLine
            start={start}
            end={end}
            mid={mid}
            color={arcColor}
            lineWidth={transaction.isWhale ? 5 : 2}
            transparent
            opacity={opacity * 0.6}
        />
        <mesh position={start.clone().lerp(end, progress)}>
             {/* Energy packet payload */}
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshBasicMaterial color={arcColor} transparent opacity={opacity} />
        </mesh>
    </group>
  );
};