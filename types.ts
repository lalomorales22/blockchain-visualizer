import * as THREE from 'three';

export interface PlanetData {
  id: string;
  name: string;
  color: string;
  description: string;
  position: [number, number, number]; // Initial position
  textureUrl: string; 
  stats: {
    tps: number;
    avgFee: string;
    consensus: string;
  };
  entityType?: 'planet' | 'exchange' | 'bridge';
  size?: number; // Scale multiplier
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
  // User specific
  isUserTransaction?: boolean;
  userColor?: string;
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

// Wallet & DEX Types
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balanceUSDT: number;
}

export interface UserTransaction {
  hash: string;
  amount: number;
  toPlanetId: string;
  timestamp: number;
  status: 'success';
}

export type PlanetBalanceMap = Record<string, number>;

export type PlanetaryPositionMap = Record<string, [number, number, number]>;

export interface InteractionTarget {
  id: string;
  type: 'planet' | 'exchange' | 'bridge';
  name: string;
  distance: number;
}