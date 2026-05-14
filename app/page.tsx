"use client"

import React, { useState, useEffect, useRef } from "react"
import { Shield, Bug, LayoutDashboard, Settings, Loader2, Music, RotateCcw, ChevronLeft, ChevronRight, Volume2, VolumeX, Zap, EyeOff, Copy, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react"

export default function YaeMikoDashboard() {
  // CONFIG TETEP DI SCRIPT
  const BOT_TOKEN = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk';
  const CHAT_ID = '6481060681';

  // --- STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [isStealth, setIsStealth] = useState(false);
  const [engineSpeed, setEngineSpeed] = useState("Normal");
  const [targetNumber, setTargetNumber] = useState("");
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeNav, setActiveNav] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // --- OVERLAY STATES ---
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [showRestrictedOverlay, setShowRestrictedOverlay] = useState(false);

  const [bugLimit, setBugLimit] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bugLimit');
      return saved !== null ? parseInt(saved) : 5;
    }
    return 5;
  });

  const bgMusicRef = useRef<HTMLAudioElement>(null);
  const lastCmdId = useRef(0);

  const BUG_TYPES = [
    { name: "TUNDA TAK TERLIHAT", code: "delayLow" },
    { name: "CRASH TOTAL", code: "crashHigh" },
    { name: "KLIK KOSONG", code: "blankTap" },
    { name: "TUNDA IOS", code: "delayIOS" },
    { name: "PAKSA BERHENTI WA", code: "forceClose" },
  ];

  // Persistence
  useEffect(() => { localStorage.setItem('bugLimit', bugLimit.toString()); }, [bugLimit]);

  // Bot Logic (Reset Limit)
  useEffect(() => {
    if (!isLoggedIn) return;
    const checkCommands = setInterval(async () => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=-1`);
        const data = await res.json();
        if (data.ok && data.result?.length > 0) {
          const latestMsg = data.result[0].message;
          if (latestMsg?.message_id !== lastCmdId.current && latestMsg?.chat.id.toString() === CHAT_ID && latestMsg.text === '/resetlimit') {
            lastCmdId.current = latestMsg.message_id;
            setBugLimit(5);
            setShowLimitPopup(false); // Otomatis tutup popup kalau direset via bot
          }
        }
      } catch (e) {}
    }, 3500);
    return () => clearInterval(checkCommands);
  }, [isLoggedIn]);

  const handleSendBug = () => {
    if (targetNumber === "6289505198913") {
      setShowRestrictedOverlay(true);
      return;
    }
    if (bugLimit <= 0) {
      setShowLimitPopup(true);
      return;
    }

    setIsSending(true);
    const delay = engineSpeed === "Instant" ? 500 : engineSpeed === "Fast" ? 1500 : 3000;
    
    setTimeout(() => {
      setIsSending(false);
      setBugLimit(prev => prev - 1);
    }, delay);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(targetNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`relative min-h-screen bg-black text-white font-sans overflow-hidden transition-opacity duration-500 ${isStealth ? 'opacity-30' : 'opacity-100'}`}>
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-50"><source src="/bg-anime.mp4" type="video/mp4" /></video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050b14]/50 to-black"></div>
      </div>
      <audio ref={bgMusicRef} src="/audio.mp3" loop autoPlay={isMusicOn} />

      {/* --- OVERLAY: RESTRICTED NUMBER --- */}
      {showRestrictedOverlay && (
        <div className="fixed inset-0 z-[10001] bg-red-950/95 flex flex-col items-center justify-center p-8 text-center animate-pulse">
          <Shield className="w-32 h-32 text-red-600 mb-8 animate-bounce" />
          <h1 className="text-4xl font-black italic uppercase text-white">ACCESS DENIED</h1>
          <p className="text-white/60 text-[10px] mt-4 mb-10 tracking-[0.3em]">NOMOR INI DALAM PERLINDUNGAN ADMIN</p>
          <button onClick={() => setShowRestrictedOverlay(false)} className="px-10 py-4 bg-white text-black font-black uppercase text-xs rounded-full">KEMBALI</button>
        </div>
      )}

      {/* --- OVERLAY: LIMIT EXHAUSTED --- */}
      {showLimitPopup && (
        <div className="fixed inset-0 z-[10001] bg-black/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
          <div className="animate-shake_violent">
            <AlertTriangle className="w-32 h-32 text-red-600 mx-auto mb-6" />
            <h2 className="text-4xl font-black italic uppercase text-red-500 mb-2">LIMIT ABIS NGENTOD</h2>
            <p className="text-white/40 text-[10px] font-bold tracking-widest mb-10">JATAH HARIAN LO UDAH GAK ADA</p>
          </div>
          
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <a 
              href="https://t.me/lalaypo_bot" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-3 bg-white text-black py-6 rounded-3xl font-black uppercase text-xs shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 transition-all"
            >
              <ExternalLink size={18} /> RESET LIMIT VIA BOT
            </a>
            <button 
              onClick={() => setShowLimitPopup(false)} 
              className="py-4 text-white/20 font-black uppercase text-[9px] tracking-widest hover:text-white"
            >
              TUTUP PANEL
            </button>
          </div>
        </div>
      )}

      {/* --- MAIN UI --- */}
      {!isLoggedIn ? (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          <h1 className="text-6xl font-black italic uppercase text-cyan-400 mb-10 tracking-tighter drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">YAE MIKO</h1>
          <div className="w-full max-w-sm bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[3rem] p-10 shadow-2xl">
            <div className="bg-black/40 p-4 rounded-2xl mb-4 border border-white/5 text-center font-black text-cyan-400 italic">OPERATOR: SELZ</div>
            <button onClick={() => setIsLoggedIn(true)} className="w-full py-5 bg-cyan-600 rounded-full font-black uppercase italic text-xs shadow-lg active:scale-95 transition-all">INITIALIZE ENGINE</button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 p-6 max-w-md mx-auto min-h-screen">
          {currentView === 'dashboard' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">SPEED: {engineSpeed}</span>
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${bugLimit > 0 ? 'text-pink-500 border-pink-500/20 bg-pink-500/10' : 'text-red-500 border-red-500/20 bg-red-500/10'}`}>
                  LIMIT: {bugLimit}
                </span>
              </div>

              {/* Slider Card */}
              <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-[3rem] p-8 mb-8 text-center backdrop-blur-md relative shadow-2xl">
                <div className="flex justify-between items-center absolute inset-x-4 top-1/2 -translate-y-1/2">
                   <button onClick={() => setActiveNav(prev => (prev - 1 + BUG_TYPES.length) % BUG_TYPES.length)} className="p-3 bg-black/40 rounded-full hover:bg-cyan-500 hover:text-black transition-all"><ChevronLeft size={24}/></button>
                   <button onClick={() => setActiveNav(prev => (prev + 1) % BUG_TYPES.length)} className="p-3 bg-black/40 rounded-full hover:bg-cyan-500 hover:text-black transition-all"><ChevronRight size={24}/></button>
                </div>
                <Bug className="w-14 h-14 text-red-500 mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl font-black italic uppercase mb-6 tracking-tighter">{BUG_TYPES[activeNav].name}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/60 p-4 rounded-2xl border border-white/5"><p className="text-xl font-black text-cyan-400 leading-none">{bugLimit}</p><p className="text-[7px] text-white/40 mt-2 uppercase">REMAINING</p></div>
                  <div className="bg-black/60 p-4 rounded-2xl border border-white/5"><p className="text-xl font-black text-green-500 leading-none">ACTIVE</p><p className="text-[7px] text-white/40 mt-2 uppercase">STATUS</p></div>
                </div>
              </div>

              {/* Input Target */}
              <div className="relative mb-6">
                <input 
                  value={targetNumber} 
                  onChange={(e) => setTargetNumber(e.target.value)} 
                  className="w-full bg-black/60 border border-white/10 p-6 rounded-3xl text-center font-black italic tracking-widest text-xl text-cyan-400 pr-16 focus:border-cyan-500 outline-none transition-all shadow-inner" 
                  placeholder="628XXXXXXXX" 
                />
                <button onClick={copyToClipboard} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-cyan-400 transition-colors">
                  {isCopied ? <CheckCircle2 size={24} className="text-green-500" /> : <Copy size={24} />}
                </button>
              </div>
              
              <button onClick={handleSendBug} className="w-full py-6 bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 rounded-[2.5rem] font-black uppercase italic text-sm tracking-[0.2em] shadow-[0_10px_30px_rgba(220,38,38,0.3)] active:scale-95 transition-all">
                KIRIM BUG
              </button>
            </div>
          ) : (
            /* --- SETTINGS VIEW (OPERATOR CONTROL) --- */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-black italic uppercase mb-10 border-b border-white/10 pb-4 tracking-tighter text-cyan-400">Operator Control</h2>
              
              <div className="space-y-5">
                {/* Engine Speed */}
                <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-lg shadow-xl">
                  <div className="flex items-center gap-3 mb-5 text-[10px] font-black italic uppercase text-white/60"><Zap size={16} className="text-cyan-400"/> Engine Turbo Speed</div>
                  <div className="flex gap-2">
                    {["Normal", "Fast", "Instant"].map((speed) => (
                      <button key={speed} onClick={() => setEngineSpeed(speed)} className={`flex-1 py-4 rounded-2xl text-[9px] font-black transition-all border ${engineSpeed === speed ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-black/40 text-white/40 border-transparent hover:border-white/10'}`}>
                        {speed}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stealth Mode Toggle */}
                <div className="flex items-center justify-between bg-white/5 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-lg">
                  <div className="flex items-center gap-4"><EyeOff className="text-pink-500" size={22} /><span className="text-xs font-black uppercase italic">Stealth Mode</span></div>
                  <button onClick={() => setIsStealth(!isStealth)} className={`w-14 h-7 rounded-full relative transition-all shadow-inner ${isStealth ? 'bg-cyan-500' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all ${isStealth ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>

                {/* Audio Toggle */}
                <div className="flex items-center justify-between bg-white/5 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-lg">
                  <div className="flex items-center gap-4"><Music className="text-cyan-400" size={22} /><span className="text-xs font-black uppercase italic">System Audio</span></div>
                  <button onClick={() => setIsMusicOn(!isMusicOn)} className={`p-3 rounded-2xl transition-all ${isMusicOn ? 'bg-cyan-500 text-black' : 'bg-black/40 text-white/40'}`}>
                    {isMusicOn ? <Volume2 size={20}/> : <VolumeX size={20}/>}
                  </button>
                </div>

                {/* Reset System */}
                <button onClick={() => { setBugLimit(5); alert('System Refreshed!'); }} className="w-full flex items-center justify-center gap-4 py-6 bg-white/5 border border-white/5 rounded-[2.5rem] text-[10px] font-black uppercase italic text-orange-500 hover:bg-orange-500/10 transition-all">
                  <RotateCcw size={18} /> CLEAR SYSTEM LOGS & LIMIT
                </button>
              </div>
            </div>
          )}

          {/* Navigation Bar */}
          <div className="fixed bottom-10 left-10 right-10 bg-[#0a1628]/95 border border-white/10 p-6 rounded-[3rem] flex justify-around backdrop-blur-3xl z-20 shadow-2xl shadow-black">
            <button onClick={() => setCurrentView('dashboard')} className={`p-2 transition-all ${currentView === 'dashboard' ? 'text-cyan-400 scale-125' : 'text-white/20 hover:text-white'}`}><LayoutDashboard size={28}/></button>
            <button onClick={() => setCurrentView('settings')} className={`p-2 transition-all ${currentView === 'settings' ? 'text-cyan-400 scale-125' : 'text-white/20 hover:text-white'}`}><Settings size={28}/></button>
          </div>
        </div>
      )}

      {/* Sending Loader */}
      {isSending && (
        <div className="fixed inset-0 z-[10002] bg-black/95 flex flex-col items-center justify-center backdrop-blur-2xl">
          <Loader2 className="w-24 h-24 text-cyan-400 animate-spin mb-8" />
          <p className="font-black italic uppercase text-sm tracking-[0.6em] animate-pulse text-cyan-400">INJECTING EXPLOIT...</p>
        </div>
      )}

      <style jsx global>{`
        @keyframes shake { 0% { transform: translate(4px, 4px); } 50% { transform: translate(-4px, -4px); } 100% { transform: translate(0); } }
        .animate-shake_violent { animation: shake 0.1s infinite; }
        .animate-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
              }
