import { PlanetData } from './types';

// Using standard textures from a reliable CDN for earth maps
export const EARTH_TEXTURE_URL = "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg";
export const CLOUDS_TEXTURE_URL = "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png";

// Arrange planets in a wide arc in front of the camera (Camera starts at 0, 10, 80)
export const PLANETS: PlanetData[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin (BTC)',
    color: '#F7931A',
    description: 'The digital gold standard.',
    position: [0, 0, 0], // Center
    textureUrl: EARTH_TEXTURE_URL,
    stats: { tps: 7, avgFee: '$5.50', consensus: 'PoW' },
    entityType: 'planet'
  },
  {
    id: 'ethereum',
    name: 'Ethereum (ETH)',
    color: '#627EEA',
    description: 'The global computer.',
    position: [-30, 5, -10], // Left 1
    textureUrl: EARTH_TEXTURE_URL,
    stats: { tps: 29, avgFee: '$2.10', consensus: 'PoS' },
    entityType: 'planet'
  },
  {
    id: 'solana',
    name: 'Solana (SOL)',
    color: '#14F195',
    description: 'High-speed execution layer.',
    position: [30, 5, -10], // Right 1
    textureUrl: EARTH_TEXTURE_URL,
    stats: { tps: 4500, avgFee: '$0.00025', consensus: 'PoH' },
    entityType: 'planet'
  },
  {
    id: 'bsc',
    name: 'BNB Chain (BSC)',
    color: '#F3BA2F',
    description: 'Binance Smart Chain.',
    position: [-60, -5, 0], // Left 2
    textureUrl: EARTH_TEXTURE_URL,
    stats: { tps: 150, avgFee: '$0.10', consensus: 'PoSA' },
    entityType: 'planet'
  },
  {
    id: 'polygon',
    name: 'Polygon (MATIC)',
    color: '#8247E5',
    description: 'Ethereum sidechain scaling.',
    position: [60, -5, 0], // Right 2
    textureUrl: EARTH_TEXTURE_URL,
    stats: { tps: 65, avgFee: '$0.01', consensus: 'PoS' },
    entityType: 'planet'
  },
  {
    id: 'avalanche',
    name: 'Avalanche (AVAX)',
    color: '#E84142',
    description: 'High-throughput dApps.',
    position: [-90, 10, 10], // Left 3
    textureUrl: EARTH_TEXTURE_URL,
    stats: { tps: 4500, avgFee: '$0.05', consensus: 'Snowman' },
    entityType: 'planet'
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum (ARB)',
    color: '#2D374B',
    description: 'L2 scaling solution.',
    position: [90, 10, 10], // Right 3
    textureUrl: EARTH_TEXTURE_URL,
    stats: { tps: 40, avgFee: '$0.05', consensus: 'L2' },
    entityType: 'planet'
  },
  {
    id: 'optimism',
    name: 'Optimism (OP)',
    color: '#FF0420',
    description: 'Optimistic Rollup L2.',
    position: [-120, -10, 20], // Left 4
    textureUrl: EARTH_TEXTURE_URL,
    stats: { tps: 25, avgFee: '$0.08', consensus: 'L2' },
    entityType: 'planet'
  },
  {
    id: 'fantom',
    name: 'Fantom (FTM)',
    color: '#1969FF',
    description: 'DAG-based smart contracts.',
    position: [120, -10, 20], // Right 4
    textureUrl: EARTH_TEXTURE_URL,
    stats: { tps: 20, avgFee: '$0.01', consensus: 'Lachesis' },
    entityType: 'planet'
  },
  // NEW ENTITIES
  {
    id: 'dex_hub',
    name: 'Galactic Exchange (CEX/DEX)',
    color: '#00ffcc',
    description: 'Central Liquidity Hub',
    position: [160, 5, 40], // Far Right
    textureUrl: '',
    stats: { tps: 10000, avgFee: '0.1%', consensus: 'OrderBook' },
    entityType: 'exchange'
  },
  {
    id: 'bridge',
    name: 'The Quantum Bridge',
    color: '#ffffff',
    description: 'Cross-Chain Interoperability Protocol',
    position: [0, 35, -40], // High Center Back
    textureUrl: '',
    stats: { tps: 500, avgFee: '$10.00', consensus: 'Relayer' },
    entityType: 'bridge'
  }
];

export const CITIES = [
  { name: "New York", lat: 40.7128, lon: -74.0060 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "San Francisco", lat: 37.7749, lon: -122.4194 },
  { name: "Berlin", lat: 52.5200, lon: 13.4050 },
  { name: "Seoul", lat: 37.5665, lon: 126.9780 },
  { name: "Dubai", lat: 25.2048, lon: 55.2708 },
  { name: "Zug", lat: 47.1662, lon: 8.5155 },
  { name: "Lagos", lat: 6.5244, lon: 3.3792 },
  { name: "São Paulo", lat: -23.5505, lon: -46.6333 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { name: "Shanghai", lat: 31.2304, lon: 121.4737 },
  { name: "Toronto", lat: 43.6532, lon: -79.3832 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  { name: "Moscow", lat: 55.7558, lon: 37.6173 },
  { name: "Cape Town", lat: -33.9249, lon: 18.4241 },
  { name: "Hong Kong", lat: 22.3193, lon: 114.1694 },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { name: "Miami", lat: 25.7617, lon: -80.1918 },
  { name: "Tel Aviv", lat: 32.0853, lon: 34.7818 },
  { name: "Amsterdam", lat: 52.3676, lon: 4.9041 },
  { name: "Vancouver", lat: 49.2827, lon: -123.1207 }
];