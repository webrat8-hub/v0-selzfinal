"use client"

import React, { useState, useEffect, useRef } from "react"
import { Shield, Bug, LayoutDashboard, Settings, Loader2, Music, RotateCcw, ChevronLeft, ChevronRight, Volume2, VolumeX, Zap, EyeOff, Copy, CheckCircle2, AlertTriangle, ExternalLink, LogOut, Lock } from "lucide-react"

export default function YaeMikoDashboard() {
  const BOT_TOKEN = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk';
  const CHAT_ID = '6481060681';

  // --- LOGIN STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showErrorOverlay, setShowErrorOverlay] = useState(false);

  // --- ENGINE STATES ---
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

  useEffect(() => { localStorage.setItem('bugLimit', bugLimit.toString()); }, [bugLimit]);

  // LOGIN LOGIC
  const handleLogin = () => {
    if (username === "Selz" && password === "Freebug") {
      setIsLoggedIn(true);
      setShowErrorOverlay(false);
    } else {
      setShowErrorOverlay(true);
    }
  };

  // BOT COMMAND LOGIC (RESET LIMIT)
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
            setShowLimitPopup(false);
          }
        }
      } catch (e) {}
    }, 3500);
    return () => clearInterval(checkCommands);
  }, [isLoggedIn]);

  // SEND BUG LOGIC
  const handleSendBug = () => {
    if (targetNumber === "6289505198913") { setShowRestrictedOverlay(true); return; }
    if (bugLimit <= 0) { setShowLimitPopup(true); return; }
    setIsSending(true);
    const delay = engineSpeed === "Instant" ? 500 : engineSpeed === "Fast" ? 1500 : 3000;
    setTimeout(() => { setIsSending(false); setBugLimit(prev => prev - 1); }, delay);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(targetNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`relative min-h-screen bg-black text-white font-sans overflow-hidden transition-opacity duration-500 ${isStealth ? 'opacity-30' : 'opacity-100'}`}>
      
      {/* BACKGROUND VIDEO */}
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-50"><source src="/bg-anime.mp4" type="video/mp4" /></video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050b14]/50 to-black"></div>
      </div>
      <audio ref={bgMusicRef} src="/bg-music.mp3" loop autoPlay={isMusicOn} />

      {/* --- OVERLAY: LOGIN ERROR (GLITCH & SHAKE VERSION) --- */}
      {showErrorOverlay && (
        <div className="fixed inset-0 z-[10005] bg-red-950/90 flex flex-col items-center justify-center p-8 text-center backdrop-blur-3xl animate-bg_rumble">
          <div className="animate-shake_violent">
            <AlertTriangle className="w-32 h-32 text-red-500 mb-8 mx-auto drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]" />
            <h1 className="text-5xl font-black italic uppercase text-white animate-glitch_extreme tracking-tighter">LOGIN GAGAL, BABIK!</h1>
            <p className="text-white/60 text-[10px] mt-4 mb-10 tracking-[0.3em] font-bold">WRONG CREDENTIALS DETECTED</p>
          </div>
          <div className="flex flex-col gap-4 w-full max-w-xs animate-in fade-in duration-1000">
            <a href="https://t.me/lalaypo_bot" target="_blank" className="bg-white text-black py-5 rounded-full font-black uppercase text-xs shadow-[0_0_20px_#fff] hover:scale-105 transition-transform active:scale-95">HUBUNGI ADMIN</a>
            <button onClick={() => setShowErrorOverlay(false)} className="text-white/20 font-bold uppercase text-[9px] hover:text-white transition-colors">COBA LAGI</button>
          </div>
        </div>
      )}

      {/* --- OVERLAY: LIMIT EXHAUSTED --- */}
      {showLimitPopup && (
        <div className="fixed inset-0 z-[10001] bg-black/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
          <Bug className="w-32 h-32 text-red-600 mx-auto mb-6 animate-shake_violent" />
          <h2 className="text-4xl font-black italic uppercase text-red-500 mb-2">LIMIT ABIS NGENTOD</h2>
          <div className="flex flex-col gap-4 w-full max-w-xs mt-10">
            <a href="https://t.me/lalaypo_bot" target="_blank" className="flex items-center justify-center gap-3 bg-white text-black py-6 rounded-3xl font-black uppercase text-xs shadow-2xl transition-all active:scale-95"><ExternalLink size={18} /> RESET LIMIT VIA BOT</a>
            <button onClick={() => setShowLimitPopup(false)} className="py-4 text-white/20 font-black uppercase text-[9px]">TUTUP</button>
          </div>
        </div>
      )}

      {/* --- MENU LOGIN --- */}
      {!isLoggedIn ? (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 animate-in slide-in-from-top-10 duration-700">
          <h1 className="text-6xl font-black italic uppercase text-cyan-400 mb-10 tracking-tighter drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">YAE MIKO</h1>
          <div className="w-full max-w-sm bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[3rem] p-10 shadow-2xl border-t-white/20">
            <div className="flex flex-col gap-4">
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black/60 border border-white/10 p-5 rounded-2xl text-center font-bold text-xs outline-none focus:border-cyan-500 transition-all text-white" placeholder="USERNAME" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/60 border border-white/10 p-5 rounded-2xl text-center font-bold text-xs outline-none focus:border-cyan-500 transition-all text-white" placeholder="PASSWORD" />
              <button onClick={handleLogin} className="w-full py-5 bg-cyan-600 rounded-full font-black uppercase italic text-xs shadow-lg shadow-cyan-900/40 active:scale-95 transition-all mt-4 flex items-center justify-center gap-3 text-white">
                <Lock size={16}/> ACCESS SYSTEM
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* --- MAIN CONTENT (DASHBOARD & SETTINGS) --- */
        <div className="relative z-10 p-6 max-w-md mx-auto min-h-screen">
          {currentView === 'dashboard' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">SPEED: {engineSpeed}</span>
                <span className={`text-[10px] font-black uppercase px-4 py-1 rounded-full border ${bugLimit > 0 ? 'text-pink-500 border-pink-500/20 bg-pink-500/10' : 'text-red-500 border-red-500/20 bg-red-500/10'}`}>LIMIT: {bugLimit}</span>
              </div>

              <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-[2.5rem] p-8 mb-8 text-center backdrop-blur-md relative shadow-2xl">
                <div className="flex justify-between items-center absolute inset-x-4 top-1/2 -translate-y-1/2">
                   <button onClick={() => setActiveNav(prev => (prev - 1 + BUG_TYPES.length) % BUG_TYPES.length)} className="p-3 bg-black/40 rounded-full hover:bg-cyan-500"><ChevronLeft size={24}/></button>
                   <button onClick={() => setActiveNav(prev => (prev + 1) % BUG_TYPES.length)} className="p-3 bg-black/40 rounded-full hover:bg-cyan-500"><ChevronRight size={24}/></button>
                </div>
                <Bug className="w-14 h-14 text-red-500 mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl font-black italic uppercase mb-6 tracking-tighter">{BUG_TYPES[activeNav].name}</h2>
              </div>

              <div className="relative mb-6">
                <input value={targetNumber} onChange={(e) => setTargetNumber(e.target.value)} className="w-full bg-black/60 border border-white/10 p-6 rounded-3xl text-center font-black italic text-xl text-cyan-400 pr-16 focus:border-cyan-500 outline-none" placeholder="628XXXXXXXX" />
                <button onClick={copyToClipboard} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-cyan-400">
                  {isCopied ? <CheckCircle2 size={24} className="text-green-500" /> : <Copy size={24} />}
                </button>
              </div>
              <button onClick={handleSendBug} className="w-full py-6 bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 rounded-[2.5rem] font-black uppercase italic text-sm tracking-[0.2em] shadow-xl active:scale-95 transition-all text-white">KIRIM KUMBANG</button>
            </div>
          ) : (
            /* --- SETTINGS VIEW --- */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-black italic uppercase mb-10 border-b border-white/10 pb-4 text-cyan-400">Settings</h2>
              <div className="space-y-5">
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 backdrop-blur-lg">
                  <div className="flex items-center gap-3 mb-5 text-[10px] font-black uppercase text-white/60"><Zap size={16} className="text-cyan-400"/> Turbo Speed</div>
                  <div className="flex gap-2">
                    {["Normal", "Fast", "Instant"].map((speed) => (
                      <button key={speed} onClick={() => setEngineSpeed(speed)} className={`flex-1 py-4 rounded-xl text-[9px] font-black transition-all ${engineSpeed === speed ? 'bg-cyan-500 text-black' : 'bg-black/40 text-white/40'}`}>{speed}</button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white/5 p-6 rounded-[2rem] border border-white/5">
                  <div className="flex items-center gap-4"><EyeOff className="text-pink-500" size={22} /><span className="text-xs font-black uppercase italic">Stealth Mode</span></div>
                  <button onClick={() => setIsStealth(!isStealth)} className={`w-14 h-7 rounded-full relative transition-all ${isStealth ? 'bg-cyan-500' : 'bg-white/10'}`}><div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${isStealth ? 'right-1' : 'left-1'}`}></div></button>
                </div>

                <button onClick={() => { setIsLoggedIn(false); setUsername(""); setPassword(""); }} className="w-full flex items-center justify-center gap-4 py-6 bg-red-600/10 border border-red-600/20 rounded-[2.5rem] text-[10px] font-black uppercase italic text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-lg">
                  <LogOut size={18} /> TERMINATE & LOG OUT SESSION
                </button>
              </div>
            </div>
          )}

          {/* BOTTOM NAV */}
          <div className="fixed bottom-10 left-10 right-10 bg-[#0a1628]/95 border border-white/10 p-6 rounded-[3rem] flex justify-around backdrop-blur-3xl z-20 shadow-2xl">
            <button onClick={() => setCurrentView('dashboard')} className={`p-2 transition-all ${currentView === 'dashboard' ? 'text-cyan-400 scale-125' : 'text-white/20'}`}><LayoutDashboard size={28}/></button>
            <button onClick={() => setCurrentView('settings')} className={`p-2 transition-all ${currentView === 'settings' ? 'text-cyan-400 scale-125' : 'text-white/20'}`}><Settings size={28}/></button>
          </div>
        </div>
      )}

      {/* --- OVERLAY: INJECTING LOADER --- */}
      {isSending && (
        <div className="fixed inset-0 z-[10002] bg-black/95 flex flex-col items-center justify-center backdrop-blur-2xl">
          <Loader2 className="w-20 h-20 text-cyan-400 animate-spin mb-6" />
          <p className="font-black italic uppercase text-xs tracking-[0.5em] animate-pulse text-cyan-400">INJECTING...</p>
        </div>
      )}

      {/* --- GLOBAL STYLES & ANIMATIONS --- */}
      <style jsx global>{`
        @keyframes shake {
          0% { transform: translate(4px, 4px) rotate(0deg); }
          10% { transform: translate(-3px, -5px) rotate(-1deg); }
          20% { transform: translate(-8px, 1px) rotate(1deg); }
          30% { transform: translate(4px, 5px) rotate(0deg); }
          40% { transform: translate(1px, -4px) rotate(1deg); }
          50% { transform: translate(-5px, 5px) rotate(-1deg); }
          100% { transform: translate(0); }
        }
        .animate-shake_violent { animation: shake 0.1s infinite; }

        @keyframes glitch {
          0% { text-shadow: 2px 0 #ff0000, -2px 0 #00ffff; }
          25% { text-shadow: -2px 0 #ff0000, 2px 0 #00ffff; }
          50% { text-shadow: 2px -2px #ff0000, -2px 2px #00ffff; }
          75% { text-shadow: -2px 2px #ff0000, 2px -2px #00ffff; }
          100% { text-shadow: 2px 0 #ff0000, -2px 0 #00ffff; }
        }
        .animate-glitch_extreme { animation: glitch 0.2s infinite; }

        @keyframes rumble {
          0%, 100% { background-color: rgba(69, 10, 10, 0.9); }
          50% { background-color: rgba(127, 29, 29, 0.95); }
        }
        .animate-bg_rumble { animation: rumble 0.15s infinite; }

        .animate-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
                     }
