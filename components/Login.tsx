import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { UserProfile, CharacterConfig } from '../types';
import { Avatar, generateRandomCharacter } from './Avatar';

interface LoginProps {
  onLogin: (profile: UserProfile) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [character, setCharacter] = useState<CharacterConfig>(generateRandomCharacter());

  const handleEnter = () => {
    if (!username.trim()) return;
    onLogin({ username, character });
  };

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="absolute inset-0 z-0 opacity-30">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/40 to-blue-900/40" />
      </div>

      <div className="z-10 w-full max-w-4xl flex flex-col md:flex-row gap-8 items-center justify-center p-6">
        
        {/* Left: Character Preview */}
        <div className="w-80 h-96 bg-gray-900/50 border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(8,145,178,0.2)] flex flex-col">
            <div className="h-full relative">
                <Canvas camera={{ position: [0, 0, 4] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <Suspense fallback={null}>
                         <Avatar config={character} />
                         <OrbitControls enableZoom={false} autoRotate={false} />
                         <Stars />
                    </Suspense>
                </Canvas>
                <div className="absolute bottom-4 w-full flex justify-center">
                     <button 
                        onClick={() => setCharacter(generateRandomCharacter())}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-sm font-mono transition-all"
                    >
                        RANDOMIZE DNA
                    </button>
                </div>
            </div>
        </div>

        {/* Right: Login Form */}
        <div className="flex flex-col gap-6 max-w-md">
            <div>
                <h1 className="text-5xl font-bold font-mono tracking-tighter mb-2">
                    BLOCKCHAIN<span className="text-cyan-400">_VISUALIZER</span>
                </h1>
                <p className="text-gray-400">Enter the galactic data stream.</p>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-cyan-500 uppercase tracking-widest">Pilot Callsign</label>
                <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
                    placeholder="ENTER_USERNAME"
                    className="bg-black/50 border-2 border-gray-700 focus:border-cyan-500 text-white text-xl px-4 py-3 rounded-lg outline-none font-mono transition-colors"
                    maxLength={15}
                />
            </div>

            <button 
                onClick={handleEnter}
                disabled={!username.trim()}
                className={`
                    group relative overflow-hidden rounded-lg p-4 font-bold tracking-widest text-lg transition-all
                    ${username.trim() ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.6)]' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
                `}
            >
                <span className="relative z-10 flex items-center justify-center gap-2">
                    INITIATE LAUNCH
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </span>
            </button>
        </div>
      </div>
    </div>
  );
};