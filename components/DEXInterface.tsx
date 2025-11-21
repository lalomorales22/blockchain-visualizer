import React, { useState, useEffect } from 'react';
import { PLANETS } from '../constants';
import { WalletState, InteractionTarget, PlanetBalanceMap } from '../types';

interface DEXInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
  onConnect: () => void;
  onSend: (amount: number, from: string, to: string) => void;
  sourceTarget: InteractionTarget | null;
  planetBalances: PlanetBalanceMap;
}

export const DEXInterface: React.FC<DEXInterfaceProps> = ({ isOpen, onClose, wallet, onConnect, onSend, sourceTarget, planetBalances }) => {
  const [selectedPlanetId, setSelectedPlanetId] = useState(PLANETS[0].id);
  const [amount, setAmount] = useState("1000");
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastHash, setLastHash] = useState("");

  // Mode: 'wallet_to_chain' (DEX) or 'chain_to_chain' (P2P)
  const mode = sourceTarget?.type === 'exchange' ? 'wallet_to_chain' : 'chain_to_chain';
  const availableBalance = mode === 'wallet_to_chain' 
      ? wallet.balanceUSDT 
      : (sourceTarget ? (planetBalances[sourceTarget.id] || 0) : 0);

  const handleSend = () => {
    if (Number(amount) > availableBalance) return;
    setIsSending(true);
    setTimeout(() => {
        setIsSending(false);
        onSend(Number(amount), mode === 'wallet_to_chain' ? 'wallet' : sourceTarget?.id || 'wallet', selectedPlanetId);
        setLastHash("0x" + Math.random().toString(16).substr(2, 40));
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            onClose();
        }, 2500);
    }, 1500);
  };

  if (!isOpen || !sourceTarget) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-cyan-500 rounded-2xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(0,255,255,0.3)] relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        
        <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-2 text-center tracking-widest uppercase">
            {sourceTarget.type === 'exchange' ? 'GALACTIC EXCHANGE' : `NODE: ${sourceTarget.name}`}
        </h2>
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-6" />

        {mode === 'wallet_to_chain' && !wallet.isConnected ? (
            <div className="text-center py-10">
                <div className="text-6xl mb-6">🦊</div>
                <p className="text-gray-300 mb-8">Connect your Galactic Wallet to access the liquidity pool.</p>
                <button 
                    onClick={onConnect}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105"
                >
                    CONNECT WALLET
                </button>
            </div>
        ) : showSuccess ? (
            <div className="text-center py-10 animate-pulse">
                <div className="text-6xl mb-4 text-green-400">✓</div>
                <h3 className="text-2xl font-bold text-green-400 mb-2">TRANSACTION SENT</h3>
                <p className="text-xs font-mono text-gray-500 break-all">{lastHash}</p>
                <p className="mt-4 text-white">Funds warping to {PLANETS.find(p=>p.id===selectedPlanetId)?.name}...</p>
            </div>
        ) : (
            <div className="space-y-6">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                     <p className="text-gray-400 font-mono text-xs mb-1 uppercase">SOURCE: {mode === 'wallet_to_chain' ? 'MY WALLET' : sourceTarget.name}</p>
                     <div className="flex justify-between items-center">
                         <span className="text-xl font-bold text-white">{mode === 'wallet_to_chain' ? 'USDT' : sourceTarget.name.split(' ')[1]}</span>
                         <span className={`text-xl font-bold ${availableBalance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                             ${availableBalance.toLocaleString()}
                         </span>
                     </div>
                </div>

                <div>
                    <label className="block text-xs font-mono text-cyan-500 mb-2">DESTINATION NODE</label>
                    <select 
                        value={selectedPlanetId}
                        onChange={(e) => setSelectedPlanetId(e.target.value)}
                        className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-cyan-500 outline-none"
                    >
                        {PLANETS.filter(p => p.id !== sourceTarget.id && p.entityType === 'planet').map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-mono text-cyan-500 mb-2">AMOUNT</label>
                    <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-cyan-500 outline-none font-mono text-right"
                    />
                </div>

                <button 
                    onClick={handleSend}
                    disabled={isSending || availableBalance <= 0}
                    className={`w-full py-4 rounded-lg font-bold tracking-widest mt-4 transition-all ${isSending || availableBalance <= 0 ? 'bg-gray-700 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(0,255,255,0.4)]'}`}
                >
                    {isSending ? 'INITIATING WARP...' : availableBalance <= 0 ? 'INSUFFICIENT FUNDS' : 'INITIATE TRANSFER'}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};