"use client"

import React, { useState, useEffect, useRef } from "react"
import { Shield, Bug, LayoutDashboard, Settings, Loader2, Music, RotateCcw, ChevronLeft, ChevronRight, Volume2, VolumeX, Zap, EyeOff, Copy, CheckCircle2, AlertTriangle, ExternalLink, Lock, UserPlus, Ghost, Skull, ZapOff, Activity, Users } from "lucide-react"

export default function YaeMikoDashboard() {
  const BOT_TOKEN = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk';
  const CHAT_ID = '6481060681';

  // --- STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [isStealth, setIsStealth] = useState(false);
  const [engineSpeed, setEngineSpeed] = useState("Normal");
  const [targetNumber, setTargetNumber] = useState("");
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeNav, setActiveNav] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  
  // Dummy Live User Counter State
  const [onlineUsers, setOnlineUsers] = useState(38);

  // --- OVERLAY STATES ---
  const [showErrorOverlay, setShowErrorOverlay] = useState(false);
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

  // --- BUG TYPES WITH UNIQUE ICONS ---
  const BUG_TYPES = [
    { name: "DELAY INVISIBLE", code: "delayLow", icon: <Ghost className="w-10 h-10 text-cyan-400" /> },
    { name: "FORCE CLOSE INVIS", code: "crashHigh", icon: <Skull className="w-10 h-10 text-red-500" /> },
    { name: "DALAY INVIS IOS", code: "blankTap" , icon: <ZapOff className="w-10 h-10 text-yellow-500" />},
    { name: "BLANK UI", code: "delayIOS", icon: <Activity className="w-10 h-10 text-pink-500" /> },
    { name: "CRASH ANDROID", code: "forceClose", icon: <Bug className="w-10 h-10 text-orange-500" /> },
  ];

  // LOGIKA LIVE USER COUNTER (SLOW MOTION)
  useEffect(() => {
    const updateCounter = () => {
      setOnlineUsers(prev => {
        const direction = Math.random() > 0.5 ? 1 : -1;
        const nextValue = prev + direction;
        // Jaga angka di rentang 15 - 50 biar kelihatan rame tapi logis
        if (nextValue < 15) return prev + 1;
        if (nextValue > 50) return prev - 1;
        return nextValue;
      });

      // Random delay antara 1 menit (60000ms) sampai 3 menit (180000ms)
      const nextDelay = Math.floor(Math.random() * (180000 - 60000 + 1)) + 60000;
      setTimeout(updateCounter, nextDelay);
    };

    const initialTimeout = setTimeout(updateCounter, 5000);
    return () => clearTimeout(initialTimeout);
  }, []);

  useEffect(() => { localStorage.setItem('bugLimit', bugLimit.toString()); }, [bugLimit]);

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

  const handleLogin = () => {
    if (username === "Selz" && password === "Freebug") {
      setIsLoggedIn(true);
      setShowErrorOverlay(false);
    } else {
      setShowErrorOverlay(true);
    }
  };

  const handleSendBug = () => {
    if (targetNumber === "6289505198913") { setShowRestrictedOverlay(true); return; }
    if (bugLimit <= 0) { setShowLimitPopup(true); return; }
    setIsSending(true);
    const delay = engineSpeed === "Instant" ? 1000 : engineSpeed === "Fast" ? 2500 : 4000;
    setTimeout(() => { setIsSending(false); setBugLimit(prev => prev - 1); }, delay);
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
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-40"><source src="/bg-anime.mp4" type="video/mp4" /></video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050b14]/70 to-black"></div>
      </div>
      <audio ref={bgMusicRef} src="/audio.mp3" loop autoPlay={isMusicOn} />

      {/* --- OVERLAY: LOGIN GAGAL --- */}
      {showErrorOverlay && (
        <div className="fixed inset-0 z-[10005] bg-red-950/90 flex flex-col items-center justify-center p-8 text-center backdrop-blur-3xl animate-bg_rumble">
          <div className="animate-shake_violent">
            <AlertTriangle className="w-32 h-32 text-red-500 mb-8 mx-auto drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]" />
            <h1 className="text-5xl font-black italic uppercase text-white animate-glitch_extreme tracking-tighter">CREATE AKUN KE BOT DULU DONGO!</h1>
            <p className="text-white/60 text-[10px] mt-4 mb-10 tracking-[0.3em] font-bold">WRONG CREDENTIALS DETECTED</p>
          </div>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <a href="https://t.me/lalaypo_bot" target="_blank" className="bg-white text-black py-5 rounded-full font-black uppercase text-xs shadow-[0_0_20px_#fff] hover:scale-105 active:scale-95 transition-all">HUBUNGI ADMIN</a>
            <button onClick={() => setShowErrorOverlay(false)} className="text-white/20 font-bold uppercase text-[9px] tracking-widest hover:text-white transition-colors">COBA LAGI</button>
          </div>
        </div>
      )}

      {/* --- OVERLAY: RESTRICTED ADMIN --- */}
      {showRestrictedOverlay && (
        <div className="fixed inset-0 z-[10006] bg-red-900/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-3xl animate-pulse">
          <Shield className="w-40 h-40 text-white mb-6 animate-bounce" />
          <h1 className="text-4xl font-black italic uppercase text-white tracking-tighter">ACCESS DENIED</h1>
          <p className="text-white/70 text-xs mt-4 mb-10 font-bold uppercase tracking-widest">MAU NGAPAIN LU KONTOL,NOMOR INI DALAM PERLINDUNGAN ADMIN SELZ</p>
          <button onClick={() => setShowRestrictedOverlay(false)} className="px-12 py-4 bg-white text-black font-black uppercase text-xs rounded-full shadow-2xl">KEMBALI</button>
        </div>
      )}

      {/* --- OVERLAY: SENDING BUG --- */}
      {isSending && (
        <div className="fixed inset-0 z-[10002] bg-black/80 flex flex-col items-center justify-center backdrop-blur-md">
          <div className="absolute inset-0 rain-glass-effect pointer-events-none opacity-60"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-10">
              <Loader2 className="w-28 h-28 text-pink-500 animate-spin" />
              <Bug className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 w-10 h-10 animate-pulse" />
            </div>
            <p className="font-black italic uppercase text-sm tracking-[0.5em] text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 animate-pulse">
              SEDANG MENGIRIM BUG KE TARGET
            </p>
            <div className="mt-4 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-pink-500 to-cyan-500 animate-progress_bar"></div>
            </div>
          </div>
        </div>
      )}

      {/* --- OVERLAY: LIMIT ABIS --- */}
      {showLimitPopup && (
        <div className="fixed inset-0 z-[10001] bg-black/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md">
          <div className="animate-shake_violent">
            <Bug className="w-32 h-32 text-red-600 mx-auto mb-6" />
            <h2 className="text-4xl font-black italic uppercase text-red-500 mb-2">LIMIT LU ABIS NGENTOD</h2>
            <p className="text-white/40 text-[10px] font-bold tracking-widest mb-10 uppercase">PREMIUM KE BOT LAH NGENTOD KAGA MALU PAKE AKUN FREE MULU😹</p>
          </div>
          <div className="flex flex-col gap-4 w-full max-w-xs mt-10">
            <a href="https://t.me/lalaypo_bot" target="_blank" className="flex items-center justify-center gap-3 bg-white text-black py-6 rounded-3xl font-black uppercase text-xs shadow-2xl transition-all active:scale-95"><ExternalLink size={18} /> RESET LIMIT VIA BOT</a>
            <button onClick={() => setShowLimitPopup(false)} className="py-4 text-white/20 font-black uppercase text-[9px] hover:text-white">LIMIT BAKAL RESET SETELAH 24 JAM</button>
          </div>
        </div>
      )}

      {/* --- MENU LOGIN --- */}
      {!isLoggedIn ? (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 animate-in slide-in-from-top-10 duration-700">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black italic uppercase text-cyan-400 tracking-tighter drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">YAE MIKO</h1>
            <p className="text-[9px] font-black tracking-[0.5em] text-white/30 -mt-1 italic">VERSI 1.5</p>
          </div>
          
          <div className="w-full max-w-sm bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[3rem] p-10 shadow-2xl border-t-white/20">
            <a href="https://t.me/lalaypo_bot" target="_blank" className="block w-full bg-black/40 p-4 rounded-2xl mb-6 border border-white/5 text-center font-black text-cyan-400 italic text-xs hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2">
              <UserPlus size={14} /> CREATE AKUN
            </a>
            <div className="flex flex-col gap-4">
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black/60 border border-white/10 p-5 rounded-2xl text-center font-bold text-xs outline-none focus:border-cyan-500 transition-all text-white shadow-inner" placeholder="USERNAME" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/60 border border-white/10 p-5 rounded-2xl text-center font-bold text-xs outline-none focus:border-cyan-500 transition-all text-white shadow-inner" placeholder="PASSWORD" />
              <button onClick={handleLogin} className="w-full py-5 bg-cyan-600 rounded-full font-black uppercase italic text-xs shadow-lg active:scale-95 transition-all mt-4 flex items-center justify-center gap-3 text-white">
                <Lock size={16}/> INITIALIZE ENGINE
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* --- MAIN DASHBOARD --- */
        <div className="relative z-10 p-6 max-w-md mx-auto min-h-screen">
          {currentView === 'dashboard' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">SPEED: {engineSpeed}</span>
                <span className={`text-[10px] font-black uppercase px-4 py-1 rounded-full border ${bugLimit > 0 ? 'text-pink-500 border-pink-500/20 bg-pink-500/10' : 'text-red-500 border-red-500/20 bg-red-500/10'}`}>LIMIT: {bugLimit}/5</span>
              </div>

              {/* Slider Card */}
              <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-[2.5rem] p-6 mb-6 text-center backdrop-blur-md relative shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center absolute inset-x-2 top-1/2 -translate-y-1/2 z-10">
                   <button onClick={() => setActiveNav(prev => (prev - 1 + BUG_TYPES.length) % BUG_TYPES.length)} className="p-2 bg-black/40 rounded-full hover:bg-cyan-500 transition-all"><ChevronLeft size={20}/></button>
                   <button onClick={() => setActiveNav(prev => (prev + 1) % BUG_TYPES.length)} className="p-2 bg-black/40 rounded-full hover:bg-cyan-500 transition-all"><ChevronRight size={20}/></button>
                </div>
                
                <div className="relative mb-3 flex justify-center">{BUG_TYPES[activeNav].icon}</div>
                <h2 className="text-xl font-black italic uppercase mb-6 tracking-tighter">{BUG_TYPES[activeNav].name}</h2>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-black/60 p-3 rounded-xl border border-white/5">
                    <p className="text-lg font-black text-cyan-400 leading-none">{bugLimit}</p>
                    <p className="text-[6px] text-white/40 mt-1 uppercase font-bold">LIMIT</p>
                  </div>
                  <div className="bg-black/60 p-3 rounded-xl border border-white/5">
                    <p className={`text-lg font-black leading-none ${bugLimit > 0 ? 'text-green-500' : 'text-red-600'}`}>
                      {bugLimit > 0 ? 'ACTIVE' : 'INACTIVE'}
                    </p>
                    <p className="text-[6px] text-white/40 mt-1 uppercase font-bold">STATUS</p>
                  </div>
                  {/* LIVE USER COUNTER PANEL */}
                  <div className="bg-black/60 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center justify-center gap-1">
                      <Users size={10} className="text-cyan-400 animate-pulse" />
                      <p className="text-lg font-black text-white leading-none tracking-tighter">{onlineUsers}</p>
                    </div>
                    <p className="text-[6px] text-white/40 mt-1 uppercase font-bold tracking-tighter">ONLINE</p>
                  </div>
                </div>
              </div>

              {/* Input Target */}
              <div className="relative mb-6">
                <input value={targetNumber} onChange={(e) => setTargetNumber(e.target.value)} className="w-full bg-black/60 border border-white/10 p-5 rounded-[2rem] text-center font-black italic text-lg text-cyan-400 pr-16 focus:border-cyan-500 outline-none transition-all shadow-inner" placeholder="628XXXXXXXX" />
                <button onClick={copyToClipboard} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-cyan-400">
                  {isCopied ? <CheckCircle2 size={24} className="text-green-500" /> : <Copy size={24} />}
                </button>
              </div>
              <button onClick={handleSendBug} className="w-full py-5 bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 rounded-[2.5rem] font-black uppercase italic text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all text-white">KIRIM BUG</button>
            </div>
          ) : (
            /* --- SETTINGS VIEW --- */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-black italic uppercase mb-10 border-b border-white/10 pb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 tracking-tighter">Setting Selz</h2>
              <div className="space-y-5">
                <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-lg shadow-xl">
                  <div className="flex items-center gap-3 mb-5 text-[10px] font-black uppercase text-white/60 italic"><Zap size={16} className="text-cyan-400"/> Engine Speed</div>
                  <div className="flex gap-2">
                    {["Normal", "Fast", "Instant"].map((speed) => (
                      <button key={speed} onClick={() => setEngineSpeed(speed)} className={`flex-1 py-4 rounded-2xl text-[9px] font-black transition-all border ${engineSpeed === speed ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-black/40 text-white/40 border-transparent'}`}>{speed}</button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white/5 p-6 rounded-[2.5rem] border border-white/5">
                  <div className="flex items-center gap-4"><EyeOff className="text-pink-500" size={22} /><span className="text-xs font-black uppercase italic">Stealth Mode</span></div>
                  <button onClick={() => setIsStealth(!isStealth)} className={`w-14 h-7 rounded-full relative transition-all ${isStealth ? 'bg-cyan-500' : 'bg-white/10'}`}><div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${isStealth ? 'right-1' : 'left-1'}`}></div></button>
                </div>

                <div className="flex items-center justify-between bg-white/5 p-6 rounded-[2.5rem] border border-white/5">
                  <div className="flex items-center gap-4"><Music className="text-cyan-400" size={22} /><span className="text-xs font-black uppercase italic">Audio Output</span></div>
                  <button onClick={() => setIsMusicOn(!isMusicOn)} className={`p-3 rounded-2xl transition-all ${isMusicOn ? 'bg-cyan-500 text-black' : 'bg-black/40 text-white/40'}`}>
                    {isMusicOn ? <Volume2 size={20}/> : <VolumeX size={20}/>}
                  </button>
                </div>

                <button onClick={() => { setIsLoggedIn(false); setUsername(""); setPassword(""); }} className="w-full flex items-center justify-center gap-4 py-6 bg-red-600/10 border border-red-600/20 rounded-[2.5rem] text-[10px] font-black uppercase italic text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-lg">
                   TERMINATE SESSION
                </button>
              </div>
            </div>
          )}

          {/* FLOATING NAV (SMALL) */}
          <div className="fixed bottom-8 left-16 right-16 bg-[#0a1628]/95 border border-white/10 p-4 rounded-[2.5rem] flex justify-around backdrop-blur-3xl z-20 shadow-2xl">
            <button onClick={() => setCurrentView('dashboard')} className={`p-1 transition-all ${currentView === 'dashboard' ? 'text-cyan-400 scale-110' : 'text-white/20'}`}><LayoutDashboard size={22}/></button>
            <button onClick={() => setCurrentView('settings')} className={`p-1 transition-all ${currentView === 'settings' ? 'text-cyan-400 scale-110' : 'text-white/20'}`}><Settings size={22}/></button>
          </div>
        </div>
      )}

      {/* --- GLOBAL STYLES --- */}
      <style jsx global>{`
        .rain-glass-effect { background-image: url('https://www.transparenttextures.com/patterns/dark-matter.png'); filter: contrast(150%) brightness(50%); }
        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
        .animate-progress_bar { animation: progress 3s linear infinite; }
        @keyframes shake { 0% { transform: translate(3px, 3px) rotate(0deg); } 10% { transform: translate(-2px, -4px) rotate(-1deg); } 20% { transform: translate(-7px, 1px) rotate(1deg); } 100% { transform: translate(0); } }
        .animate-shake_violent { animation: shake 0.1s infinite; }
        @keyframes glitch { 0% { text-shadow: 2px 0 #ff0000, -2px 0 #00ffff; } 50% { text-shadow: -2px 2px #ff0000, 2px -2px #00ffff; } 100% { text-shadow: 2px 0 #ff0000, -2px 0 #00ffff; } }
        .animate-glitch_extreme { animation: glitch 0.2s infinite; }
        @keyframes rumble { 0%, 100% { background-color: rgba(69, 10, 10, 0.9); } 50% { background-color: rgba(127, 29, 29, 0.95); } }
        .animate-bg_rumble { animation: rumble 0.15s infinite; }
        .animate-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
      }
