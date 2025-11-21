import React, { useState, useCallback, useEffect } from 'react';
import { Scene } from './components/Scene';
import { HUD } from './components/HUD';
import { Login } from './components/Login';
import { DEXInterface } from './components/DEXInterface';
import { TransactionFilter, UserProfile, ViewMode, TransactionStyle, WalletState, UserTransaction, PlanetBalanceMap, PlanetaryPositionMap, InteractionTarget } from './types';
import { PLANETS } from './constants';
import * as THREE from 'three';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [visiblePlanetIds, setVisiblePlanetIds] = useState<string[]>(PLANETS.map(p => p.id));
  const [filter, setFilter] = useState<TransactionFilter>({ minAmount: 1000, showLargeWhalesOnly: false });
  const [viewMode, setViewMode] = useState<ViewMode>('third');
  const [txStyle, setTxStyle] = useState<TransactionStyle>('lines');

  // Galaxy Builder State
  const [isEditMode, setIsEditMode] = useState(false);
  const [planetPositions, setPlanetPositions] = useState<PlanetaryPositionMap>(() => {
    const map: PlanetaryPositionMap = {};
    PLANETS.forEach(p => map[p.id] = p.position);
    return map;
  });

  // Wallet & Dex State
  const [wallet, setWallet] = useState<WalletState>({ isConnected: false, address: null, balanceUSDT: 0 });
  const [userTransactions, setUserTransactions] = useState<UserTransaction[]>([]);
  const [planetBalances, setPlanetBalances] = useState<PlanetBalanceMap>({});
  
  // Interaction State
  const [interactionTarget, setInteractionTarget] = useState<InteractionTarget | null>(null);
  const [isInterfaceOpen, setIsInterfaceOpen] = useState(false);

  const handleLogin = (profile: UserProfile) => {
    setUser(profile);
  };

  // Key listener for Interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'e' && interactionTarget && !isInterfaceOpen && !isEditMode) {
            setIsInterfaceOpen(true);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interactionTarget, isInterfaceOpen, isEditMode]);

  const handleTogglePlanet = useCallback((id: string) => {
    setVisiblePlanetIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(pId => pId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const handlePlanetDrag = (id: string, newPos: THREE.Vector3) => {
      setPlanetPositions(prev => ({
          ...prev,
          [id]: [newPos.x, newPos.y, newPos.z]
      }));
  };

  // DEX/Transfer Handlers
  const handleConnectWallet = () => {
      setWallet({
          isConnected: true,
          address: "0x" + Math.random().toString(16).substr(2, 6) + "..." + Math.random().toString(16).substr(2, 4),
          balanceUSDT: 50000
      });
  };

  const handleSendFunds = (amount: number, fromPlanetId: string | 'wallet', toPlanetId: string) => {
      // Deduct logic
      if (fromPlanetId === 'wallet') {
          if (amount > wallet.balanceUSDT) return;
          setWallet(prev => ({...prev, balanceUSDT: prev.balanceUSDT - amount}));
      } else {
          const balance = planetBalances[fromPlanetId] || 0;
          if (amount > balance) return;
          setPlanetBalances(prev => ({...prev, [fromPlanetId]: prev[fromPlanetId] - amount}));
      }
      
      const newTx: UserTransaction = {
          hash: "0x" + Math.random().toString(16).substr(2, 8),
          amount,
          toPlanetId: toPlanetId,
          timestamp: Date.now(),
          status: 'success'
      };
      
      setUserTransactions(prev => [newTx, ...prev]);
      
      // Add to destination
      if (toPlanetId !== 'wallet') {
        setPlanetBalances(prev => ({
            ...prev,
            [toPlanetId]: (prev[toPlanetId] || 0) + amount
        }));
      } else {
        setWallet(prev => ({...prev, balanceUSDT: prev.balanceUSDT + amount}));
      }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="relative w-full h-full">
      <Scene 
        visiblePlanetIds={visiblePlanetIds} 
        filter={filter}
        userCharacter={user.character}
        viewMode={viewMode}
        txStyle={txStyle}
        onInteractionTarget={setInteractionTarget}
        planetBalances={planetBalances}
        userTransactions={userTransactions}
        isEditMode={isEditMode}
        planetPositions={planetPositions}
        onPlanetPositionChange={handlePlanetDrag}
      />
      <HUD 
        visiblePlanetIds={visiblePlanetIds}
        onTogglePlanet={handleTogglePlanet}
        filter={filter}
        setFilter={setFilter}
        user={user}
        viewMode={viewMode}
        setViewMode={setViewMode}
        txStyle={txStyle}
        setTxStyle={setTxStyle}
        wallet={wallet}
        userTransactions={userTransactions}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
      />

      {/* Interaction Prompt */}
      {interactionTarget && !isInterfaceOpen && !isEditMode && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 animate-bounce">
              <button 
                onClick={() => setIsInterfaceOpen(true)}
                className="bg-cyan-500/80 hover:bg-cyan-500 text-black font-bold py-3 px-8 rounded-full border-2 border-white shadow-[0_0_30px_rgba(0,255,255,0.8)] transition-transform hover:scale-110 backdrop-blur-md"
              >
                  ACCESS {interactionTarget.name} [E]
              </button>
          </div>
      )}

      <DEXInterface 
        isOpen={isInterfaceOpen} 
        onClose={() => setIsInterfaceOpen(false)} 
        wallet={wallet}
        onConnect={handleConnectWallet}
        onSend={handleSendFunds}
        sourceTarget={interactionTarget}
        planetBalances={planetBalances}
      />
    </div>
  );
};

export default App;