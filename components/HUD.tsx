import React, { useState } from 'react';
import { PlanetData, TransactionFilter, ChatMessage, UserProfile, ViewMode, TransactionStyle } from '../types';
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
    setTxStyle
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

    // Context is general here since we aren't focused on one planet
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

            {/* Filter Controls Moved Here */}
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

      {/* Bottom Controls & Info */}
      <div className="absolute bottom-0 w-full p-6 flex flex-col md:flex-row justify-between items-end bg-gradient-to-t from-black/90 to-transparent pointer-events-auto gap-4">
        
        {/* Controls Info (Left) */}
        <div className="hidden md:block text-gray-500 font-mono text-xs">
            <p>[W][A][S][D] THRUSTERS</p>
            <p>[SHIFT] BOOST</p>
            <p>[MOUSE] LOOK</p>
            <p>[CLICK] ENGAGE</p>
        </div>

        {/* AI Chat Toggle */}
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
                        {isAiLoading && <div className="text-xs text-cyan-500 animate-pulse">Processing query...</div>}
                    </div>
                    <div className="p-3 border-t border-white/10 flex gap-2">
                        <input 
                            className="flex-1 bg-transparent border border-gray-600 rounded px-2 py-1 text-sm focus:border-cyan-400 outline-none text-white"
                            placeholder="Ask Gemini..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button onClick={handleSendMessage} className="text-cyan-400 hover:text-white">
                            SEND
                        </button>
                    </div>
                </div>
            )}
            <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
            </button>
        </div>
      </div>
    </div>
  );
};