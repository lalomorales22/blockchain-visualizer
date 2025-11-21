import React, { useState } from 'react';
import { PlanetData, TransactionFilter, ChatMessage, UserProfile, ViewMode, TransactionStyle, WalletState, UserTransaction } from '../types';
import { PLANETS } from '../constants';
import { askGeminiAboutCrypto } from '../services/geminiService';

interface HUDProps {
  visiblePlanetIds: string[];
  onTogglePlanet: (id: string) => void;
  filter: TransactionFilter;
  setFilter: (f: TransactionFilter) => void;
  user: UserProfile;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  txStyle: TransactionStyle;
  setTxStyle: (s: TransactionStyle) => void;
  wallet: WalletState;
  userTransactions: UserTransaction[];
  isEditMode: boolean;
  setIsEditMode: (v: boolean) => void;
}

export const HUD: React.FC<HUDProps> = ({ 
    visiblePlanetIds, 
    onTogglePlanet, 
    filter, 
    setFilter, 
    user,
    viewMode,
    setViewMode,
    txStyle,
    setTxStyle,
    wallet,
    userTransactions,
    isEditMode,
    setIsEditMode
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiLoading(true);

    const contextPlanet = PLANETS.find(p => visiblePlanetIds.includes(p.id)) || PLANETS[0];
    const response = await askGeminiAboutCrypto(userMsg, contextPlanet);
    setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    setIsAiLoading(false);
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
        <div>
          <h1 className="text-4xl font-bold tracking-widest font-mono text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            BLOCKCHAIN<span className="text-cyan-400">VISUALIZER</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             <p className="text-gray-400 text-xs font-mono">PILOT: <span className="text-cyan-300 uppercase">{user.username}</span> // SYS_READY</p>
          </div>
        </div>

        {/* View & Visuals Toggles & Filters (Top Right) */}
        <div className="flex flex-col gap-2 items-end">
            {/* Edit Galaxy Toggle */}
            <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-4 py-2 rounded-lg font-bold font-mono border transition-all ${isEditMode ? 'bg-yellow-600 border-yellow-400 text-white animate-pulse' : 'bg-gray-900/80 border-gray-600 text-gray-400 hover:bg-gray-800'}`}
            >
                {isEditMode ? '⚠ GALAXY BUILDER ACTIVE ⚠' : '🛠 EDIT GALAXY'}
            </button>

            <div className="bg-black/60 border border-white/10 rounded-lg p-2 flex gap-2 backdrop-blur-md">
                <button 
                    onClick={() => setViewMode('third')}
                    className={`px-3 py-1 rounded text-xs font-mono uppercase transition-all ${viewMode === 'third' ? 'bg-cyan-600 text-white' : 'hover:bg-white/10 text-gray-400'}`}
                >
                    3RD PERSON
                </button>
                <button 
                    onClick={() => setViewMode('first')}
                    className={`px-3 py-1 rounded text-xs font-mono uppercase transition-all ${viewMode === 'first' ? 'bg-cyan-600 text-white' : 'hover:bg-white/10 text-gray-400'}`}
                >
                    COCKPIT
                </button>
            </div>

            <div className="bg-black/60 border border-white/10 rounded-lg p-2 flex gap-2 backdrop-blur-md mt-1">
                {(['lines', 'particles', 'bolts'] as TransactionStyle[]).map(style => (
                    <button 
                        key={style}
                        onClick={() => setTxStyle(style)}
                        className={`px-3 py-1 rounded text-xs font-mono uppercase transition-all ${txStyle === style ? 'bg-purple-600 text-white' : 'hover:bg-white/10 text-gray-400'}`}
                    >
                        {style}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-2 bg-black/60 border border-white/10 p-4 rounded-xl backdrop-blur-md mt-1 w-64">
                <label className="flex items-center gap-2 text-sm font-mono text-cyan-400 cursor-pointer hover:text-cyan-300 select-none">
                    <input 
                        type="checkbox" 
                        checked={filter.showLargeWhalesOnly}
                        onChange={(e) => setFilter({...filter, showLargeWhalesOnly: e.target.checked})}
                        className="form-checkbox bg-transparent border-cyan-500 text-cyan-500 rounded focus:ring-0"
                    />
                    WHALE TRACKING MODE
                </label>
                
                <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Min Transaction Value: ${filter.minAmount}</p>
                    <input 
                        type="range" 
                        min="100" 
                        max="50000" 
                        step="100"
                        value={filter.minAmount}
                        onChange={(e) => setFilter({...filter, minAmount: Number(e.target.value)})}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </div>
            </div>
        </div>
      </div>

      {/* Planet Visibility Toggles (Left Sidebar) */}
      <div className="absolute top-1/4 left-6 flex flex-col gap-2 pointer-events-auto pb-6">
        <p className="text-xs font-mono text-gray-500 mb-1 uppercase tracking-widest">Data Streams</p>
        {PLANETS.map(planet => {
            const isVisible = visiblePlanetIds.includes(planet.id);
            return (
                <button
                    key={planet.id}
                    onClick={() => onTogglePlanet(planet.id)}
                    className={`
                    group relative flex items-center gap-3 p-2 pr-6 rounded-lg transition-all duration-200 border border-transparent
                    ${isVisible ? 'bg-white/10 border-cyan-500/30' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}
                    `}
                >
                    <div className="relative">
                        <div 
                            className={`w-4 h-4 rounded-full border transition-all ${isVisible ? 'scale-110 shadow-[0_0_10px_currentColor]' : 'scale-90'}`}
                            style={{ backgroundColor: planet.color, borderColor: isVisible ? '#fff' : 'transparent', color: planet.color }} 
                        />
                    </div>
                    <div className="text-left">
                        <p className={`font-bold font-mono text-sm uppercase ${isVisible ? 'text-white' : 'text-gray-400'}`}>{planet.name}</p>
                    </div>
                    {isVisible && <div className="absolute right-2 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />}
                </button>
            );
        })}
      </div>

      {/* Galactic Wallet Widget (Right Sidebar) */}
      <div className="absolute top-1/2 right-6 transform -translate-y-1/2 pointer-events-auto">
         <div className="w-72 bg-black/80 border border-cyan-500/40 rounded-2xl overflow-hidden backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-cyan-900/20 to-transparent">
                <h3 className="text-cyan-400 font-bold font-mono tracking-widest flex items-center gap-2">
                    <span className="text-xl">❖</span> GALACTIC WALLET
                </h3>
            </div>
            <div className="p-4 space-y-4">
                <div className="bg-gray-900/50 rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">STATUS</p>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${wallet.isConnected ? 'bg-green-500 shadow-[0_0_8px_#0f0]' : 'bg-red-500'}`} />
                        <span className="text-sm font-mono text-white">{wallet.isConnected ? 'CONNECTED' : 'OFFLINE'}</span>
                    </div>
                    {wallet.isConnected && <p className="text-xs font-mono text-gray-500 mt-1 truncate">{wallet.address}</p>}
                </div>

                <div className="bg-gray-900/50 rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">TOTAL BALANCE</p>
                    <p className="text-2xl font-bold text-white">${wallet.balanceUSDT.toLocaleString()}</p>
                </div>

                <div className="max-h-40 overflow-y-auto">
                    <p className="text-xs text-gray-500 mb-2 uppercase">Recent Activity</p>
                    {userTransactions.length === 0 ? (
                        <p className="text-xs text-gray-600 italic">No recent transmissions.</p>
                    ) : (
                        <div className="space-y-2">
                            {userTransactions.map(tx => (
                                <div key={tx.hash} className="bg-white/5 p-2 rounded flex justify-between items-center text-xs">
                                    <div className="flex flex-col">
                                        <span className="text-cyan-400 font-mono">SENT USDT</span>
                                        <span className="text-gray-500 scale-75 origin-left">TO: {PLANETS.find(p=>p.id===tx.toPlanetId)?.name.split(' ')[0]}</span>
                                    </div>
                                    <span className="text-red-400 font-bold">-${tx.amount}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
         </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 w-full p-6 flex flex-col md:flex-row justify-between items-end bg-gradient-to-t from-black/90 to-transparent pointer-events-auto gap-4">
        <div className="hidden md:block text-gray-500 font-mono text-xs">
            {isEditMode ? (
                <p className="text-yellow-400 animate-pulse">DRAG PLANETS TO REARRANGE GALAXY</p>
            ) : (
                <>
                    <p>[W][A][S][D] THRUSTERS</p>
                    <p>[SHIFT] BOOST</p>
                    <p>[MOUSE] LOOK (CLICK TO LOCK)</p>
                    <p>[SCROLL] TIME WARP</p>
                </>
            )}
        </div>

        {/* AI Chat */}
        <div className="relative">
            {isChatOpen && (
                <div className="absolute bottom-14 right-0 w-80 bg-black/90 border border-cyan-500/50 rounded-xl overflow-hidden flex flex-col shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                    <div className="p-3 bg-cyan-900/20 border-b border-cyan-500/20">
                        <p className="text-xs font-mono text-cyan-300">GEMINI COMMAND LINK</p>
                    </div>
                    <div className="h-64 overflow-y-auto p-3 flex flex-col gap-3">
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`p-2 rounded-lg text-sm max-w-[85%] ${msg.role === 'user' ? 'bg-cyan-900/40 ml-auto text-white' : 'bg-gray-800 text-gray-200'}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="p-3 border-t border-white/10 flex gap-2">
                        <input 
                            className="flex-1 bg-transparent border border-gray-600 rounded px-2 py-1 text-sm focus:border-cyan-400 outline-none text-white"
                            placeholder="Ask Gemini..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button onClick={handleSendMessage} className="text-cyan-400 hover:text-white">SEND</button>
                    </div>
                </div>
            )}
            <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
            >
               <span className="text-2xl">💬</span>
            </button>
        </div>
      </div>
    </div>
  );
};