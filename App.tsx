import React, { useState, useCallback } from 'react';
import { Scene } from './components/Scene';
import { HUD } from './components/HUD';
import { Login } from './components/Login';
import { TransactionFilter, UserProfile, ViewMode, TransactionStyle } from './types';
import { PLANETS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  // All planets visible by default now
  const [visiblePlanetIds, setVisiblePlanetIds] = useState<string[]>(PLANETS.map(p => p.id));
  const [filter, setFilter] = useState<TransactionFilter>({ minAmount: 1000, showLargeWhalesOnly: false });
  const [viewMode, setViewMode] = useState<ViewMode>('third');
  const [txStyle, setTxStyle] = useState<TransactionStyle>('lines');

  const handleLogin = (profile: UserProfile) => {
    setUser(profile);
  };

  const handleTogglePlanet = useCallback((id: string) => {
    setVisiblePlanetIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(pId => pId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

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
      />
    </div>
  );
};

export default App;