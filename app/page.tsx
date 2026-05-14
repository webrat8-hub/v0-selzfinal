"use client"

import React, { useState, useEffect, useRef } from "react"
import { Shield, Bug, AlertTriangle, LayoutDashboard, Settings, Volume2, VolumeX } from "lucide-react"

export default function YaeMikoDashboard() {
  const BOT_TOKEN = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk'; 
  const CHAT_ID = '6481060681';      

  const audioRef = useRef<HTMLAudioElement>(null);
  const triggerAudioRef = useRef<HTMLAudioElement>(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(true) // State buat Music
  const [targetNumber, setTargetNumber] = useState("62xxxxxxxxxx")
  const [activeNav, setActiveNav] = useState(0)
  const [bugLimit, setBugLimit] = useState(5)
  const [currentView, setCurrentView] = useState('dashboard')
  
  const [isMaintenance, setIsMaintenance] = useState(false)
  const [showPairModal, setShowPairModal] = useState(false)
  const [pairingCode, setPairingCode] = useState("")

  // --- MUSIC TOGGLE LOGIC ---
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) { audioRef.current.pause(); } 
      else { audioRef.current.play().catch(e => console.log(e)); }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const notifyBot = (message: string) => {
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`);
  };

  useEffect(() => {
    const checkBotCommands = setInterval(async () => {
      try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=-1`);
        const data = await response.json();
        if (data.result.length > 0) {
          const cmd = data.result[0].message?.text || "";
          if (cmd.startsWith('/pair')) { setPairingCode(cmd.split(' ')[1]); setShowPairModal(true); }
          else if (cmd === '/lockdown') setIsMaintenance(true);
          else if (cmd === '/unlock') setIsMaintenance(false);
        }
      } catch (e) {}
    }, 3000);
    return () => clearInterval(checkBotCommands);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden">
      <audio ref={audioRef} src="/audio-yae.mp3" loop />
      
      {/* MAINTENANCE & PAIRING LAYERS */}
      {isMaintenance && <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center text-red-500 font-black text-2xl animate-pulse">SYSTEM LOCKED</div>}
      
      {showPairModal && (
        <div className="fixed inset-0 z-[8888] flex items-center justify-center p-6">
          <div className="relative w-[300px] p-6 rounded-[2.5rem] bg-gradient-to-br from-pink-500/20 to-cyan-500/20 border border-white/20 backdrop-blur-2xl overflow-hidden text-center">
            <h3 className="text-white/70 font-black text-[9px] uppercase tracking-[0.2em] mb-2">Pairing Active</h3>
            <div className="text-5xl font-black mb-6 font-mono">{pairingCode}</div>
            <button onClick={() => setShowPairModal(false)} className="w-full py-3 bg-white/10 rounded-xl text-[10px] font-black uppercase">Dismiss</button>
          </div>
        </div>
      )}

      {isLoggedIn ? (
        <div className="pb-32">
          {currentView === 'dashboard' ? (
             <div className="p-6 mt-10">
                <h2 className="text-2xl font-black italic mb-4">CONTROL CENTER</h2>
                <input value={targetNumber} onChange={(e) => setTargetNumber(e.target.value)} className="w-full bg-[#050b14] p-4 rounded-2xl mb-4 text-white" />
             </div>
          ) : (
             <div className="p-6 mt-10 animate-in fade-in duration-500">
                <h2 className="text-2xl font-black italic mb-8 uppercase">Settings</h2>
                
                {/* Music Toggle */}
                <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 mb-6 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Background Music</span>
                  <button onClick={toggleMusic} className="p-3 bg-white/10 rounded-full">
                    {isMusicPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-red-500" />}
                  </button>
                </div>

                {/* Pairing */}
                <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 mb-6">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">WhatsApp Pairing</span>
                   <button onClick={() => notifyBot(`🔗 PAIRING REQUEST: ${targetNumber}`)} className="w-full py-4 mt-4 bg-green-600 rounded-2xl font-black text-xs uppercase">Link WhatsApp</button>
                </div>

                <button onClick={() => setIsLoggedIn(false)} className="w-full py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase">Logout System</button>
             </div>
          )}

          {/* FOOTER NAV */}
          <div className="fixed bottom-6 left-6 right-6 bg-[#0a1628]/80 border border-cyan-500/20 p-4 rounded-[2rem] backdrop-blur-xl flex justify-around">
            <button onClick={() => setCurrentView('dashboard')} className="flex flex-col items-center gap-1">
              <LayoutDashboard className={`w-6 h-6 ${currentView === 'dashboard' ? 'text-cyan-400' : 'text-white/30'}`} />
            </button>
            <button onClick={() => setCurrentView('settings')} className="flex flex-col items-center gap-1">
              <Settings className={`w-6 h-6 ${currentView === 'settings' ? 'text-cyan-400' : 'text-white/30'}`} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <button onClick={() => setIsLoggedIn(true)} className="px-10 py-5 bg-blue-700 rounded-full font-black">LOGIN</button>
        </div>
      )}
    </div>
  )
            }
