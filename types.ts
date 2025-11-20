import * as THREE from 'three';

export interface PlanetData {
  id: string;
  name: string;
  color: string;
  description: string;
  position: [number, number, number]; // x, y, z in space
  textureUrl: string; 
  stats: {
    tps: number;
    avgFee: string;
    consensus: string;
  };
  entityType?: 'planet' | 'exchange' | 'bridge';
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  // Planetary coordinates (Internal flows)
  fromLat?: number;
  fromLon?: number;
  toLat?: number;
  toLon?: number;
  fromLocation?: string;
  toLocation?: string;
  // Inter-planetary coordinates (Space flows)
  startPos?: THREE.Vector3;
  endPos?: THREE.Vector3;
  isInterplanetary?: boolean;
  
  timestamp: number;
  isWhale: boolean;
}

export interface TransactionFilter {
  minAmount: number;
  showLargeWhalesOnly: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface CharacterConfig {
  seed: number;
  bodyColor: string;
  accentColor: string;
  headType: number;
}

export interface UserProfile {
  username: string;
  character: CharacterConfig;
}

export type ViewMode = 'first' | 'third';
export type TransactionStyle = 'lines' | 'particles' | 'bolts';