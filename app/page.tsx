"use client"

import React, { useState, useEffect, useRef } from "react"
import { Shield, Bug, AlertTriangle, LayoutDashboard, Settings, Volume2, VolumeX, Loader2, Timer } from "lucide-react"

export default function YaeMikoDashboard() {
  const BOT_TOKEN = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk'; 
  const CHAT_ID = '6481060681';      

  const audioRef = useRef<HTMLAudioElement>(null);
  const triggerAudioRef = useRef<HTMLAudioElement>(null); // For error sounds
  const lastCmdId = useRef(0);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [targetNumber, setTargetNumber] = useState("62xxxxxxxxxx");
  const [bugLimit, setBugLimit] = useState(5);
  
  // Overlay States
  const [showErrorOverlay, setShowErrorOverlay] = useState(false); // Login error
  const [showLimitPopup, setShowLimitPopup] = useState(false); // Limit exceeded
  const [showRestrictedOverlay, setShowRestrictedOverlay] = useState(false); // Restricted number
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeNav, setActiveNav] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);

  const BUG_TYPES = [
    { name: "TUNDA TAK TERLIHAT", code: "delayLow" },
    { name: "CRASH TOTAL", code: "crashHigh" },
    { name: "KLIK KOSONG", code: "blankTap" },
    { name: "TUNDA IOS", code: "delayIOS" },
    { name: "PAKSA BERHENTI WA", code: "forceClose" },
  ];

  // --- BOT ENGINE (LISTENING) ---
  useEffect(() => {
    if (!isMonitoringActive) return;
    const checkCommands = setInterval(async () => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=-1`);
        const data = await res.json();
        if (data.ok && data.result?.length > 0) {
          const latestMsg = data.result[0].message;
          if (latestMsg?.message_id !== lastCmdId.current && latestMsg?.chat.id.toString() === CHAT_ID) {
            lastCmdId.current = latestMsg.message_id;
            if (latestMsg.text === '/resetlimit') {
               setBugLimit(5);
               fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=✅ LIMIT BERHASIL DIRESET!`);
            }
          }
        }
      } catch (e) {}
    }, 3000);
    return () => clearInterval(checkCommands);
  }, [isMonitoringActive]);

  const handleLoginAttempt = () => {
    if (inputUsername === "Selz" && inputPassword === "Freebug") {
      setIsLoggedIn(true);
      setIsMonitoringActive(true);
    } else {
      setShowErrorOverlay(true);
      if (triggerAudioRef.current) triggerAudioRef.current.play().catch(e => console.log(e));
    }
  };

  const handleSendBug = () => {
    if (targetNumber === "6289505198913") {
      setShowRestrictedOverlay(true);
      if (triggerAudioRef.current) triggerAudioRef.current.play().catch(e => console.log(e));
      return;
    }
    if (bugLimit <= 0) {
      setShowLimitPopup(true);
      if (triggerAudioRef.current) triggerAudioRef.current.play().catch(e => console.log(e));
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setBugLimit(prev => prev - 1);
    }, 3000);
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden">
      {/* 1. ANIME VIDEO BACKGROUND (As requested) */}
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover scale-105">
            <source src="/bg-anime.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#050b14]/70 backdrop-blur-[2px]"></div>
      </div>

      {/* 2. OVERLAY LOGIN ERROR (STYLE GLITCH, MERAH WARNING, GETAR) */}
      {showErrorOverlay && (
        <div className="fixed inset-0 z-[999] bg-red-950/90 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md animate-red_glitch_extreme shadow-[0_0_100px_#ff0000]" onClick={() => setShowErrorOverlay(false)}>
           <AlertTriangle className="w-40 h-40 text-red-600 mb-10 animate-shake_violent" />
           <h1 className="font-black text-6xl uppercase italic tracking-tighter leading-tight animate-red_glitch mb-4 text-white">
             LOGIN GAGAL KONTOL!
           </h1>
           <p className="text-white/80 font-bold text-xs uppercase tracking-widest mb-12 animate-pulse">Username/Password Salah. Coba Lagi Bangsat.</p>
           <a href="http://t.me/lalaypo_bot" target="_blank" className="bg-red-600 text-white px-12 py-5 rounded-full font-black uppercase text-sm animate-flicker_fast">CREATE AKUN KE BOT</a>
        </div>
      )}

      {/* 3. OVERLAY LOADING (Normal, but minimalistic) */}
      {isSending && (
        <div className="fixed inset-0 z-[999] bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
          <h2 className="text-white font-black italic uppercase tracking-widest">SENDING BUG...</h2>
        </div>
      )}

      {/* 4. OVERLAY LIMIT HABIS (STYLE GLITCH, MERAH WARNING, GETAR) */}
      {showLimitPopup && (
        <div className="fixed inset-0 z-[999] bg-red-950/90 flex flex-col items-center justify-center p-6 text-center animate-red_glitch_extreme" onClick={() => setShowLimitPopup(false)}>
           <Bug className="w-40 h-40 text-red-600 mb-10 animate-shake_violent" />
           <h2 className="text-white font-black text-4xl mb-4 uppercase italic leading-tight animate-red_glitch">LIMIT ABIS NGENTOD</h2>
           <a href="http://t.me/lalaypo_bot" target="_blank" className="bg-red-600 text-white px-12 py-5 rounded-full font-black uppercase text-sm mb-12 animate-flicker_fast">PREMIUM KE BOT</a>
           <div className="flex items-center gap-2 text-yellow-400 font-black text-[10px] uppercase italic">
             <Timer className="w-4 h-4" /> <span>RESET 24 JAM KEDEPAN</span>
           </div>
        </div>
      )}

      {/* 5. OVERLAY RESTRICTED (STYLE GLITCH, MERAH WARNING, GETAR) */}
      {showRestrictedOverlay && (
        <div className="fixed inset-0 z-[9999] bg-red-950/95 flex flex-col items-center justify-center p-8 text-center animate-red_glitch_extreme">
          <Shield className="w-48 h-48 text-red-600 mb-10 animate-shake_violent" />
          <h1 className="text-white font-black text-6xl uppercase italic leading-tight mb-4 animate-red_glitch">ACCESS RESTRICTED</h1>
          <p className="text-white/80 text-xs uppercase font-bold tracking-[0.2em] mb-12 animate-pulse">NOMOR INI GAK BISA DISERANG TOLOL</p>
          <button onClick={() => setShowRestrictedOverlay(false)} className="bg-white text-black px-8 py-3 rounded-full font-black uppercase text-xs">BACK</button>
        </div>
      )}

      <audio ref={audioRef} src="/audio-yae.mp3" loop />
      <audio ref={triggerAudioRef} src="/trigger-sound.mp3" /> {/* File Suara Error */}

      {/* 6. UI UTAMA */}
      {!isLoggedIn ? (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 animate-fade_in_fast">
          <h1 className="text-4xl font-black italic uppercase mb-12 text-cyan-400 tracking-tighter">YAE MIKO</h1>
          <div className="w-full max-w-sm bg-[#0a1628]/80 border border-cyan-500/20 rounded-[2.5rem] p-10 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.1)]">
            <input value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} className="w-full bg-[#050b14]/50 border border-cyan-500/20 p-4 rounded-2xl mb-4 text-white placeholder-cyan-400/50" placeholder="USERNAME" />
            <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} className="w-full bg-[#050b14]/50 border border-cyan-500/20 p-4 rounded-2xl mb-8 text-white placeholder-cyan-400/50" placeholder="PASSWORD" />
            <button onClick={handleLoginAttempt} className="w-full py-4 bg-gradient-to-b from-[#112236] to-[#050b14] border border-cyan-500/30 rounded-full font-black uppercase text-xs tracking-widest text-white hover:border-cyan-400 transition-all">LOGIN</button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 p-6 max-w-md mx-auto min-h-screen flex flex-col animate-in slide-in-from-bottom-8">
          {currentView === 'dashboard' ? (
             <>
               <div className="flex justify-between items-center mb-8 animate-fade_in"><span className="text-xs font-black uppercase italic tracking-widest text-cyan-400">DASHBOARD</span><span className="text-pink-500 font-black text-xs uppercase italic border border-pink-500/20 px-3 py-1 rounded-full">LIMIT: {bugLimit}/5</span></div>
               <div className="bg-[#0a1628]/40 border border-cyan-500/10 rounded-[2.5rem] p-8 mb-6 text-center animate-in zoom-in-75"><h2 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-tight">{BUG_TYPES[activeNav].name}</h2><p className="text-[10px] font-mono text-cyan-400/50 mt-1 uppercase">{BUG_TYPES[activeNav].code}</p></div>
               <input value={targetNumber} onChange={(e) => setTargetNumber(e.target.value)} className="w-full bg-[#050b14] border border-cyan-500/10 p-5 rounded-2xl mb-6 text-white font-mono text-sm tracking-widest" placeholder="62..." />
               <button onClick={handleSendBug} className="w-full py-6 bg-gradient-to-r from-[#d9166f] to-[#b0105a] rounded-[1.5rem] font-black uppercase italic text-xs tracking-widest text-white shadow-lg shadow-pink-500/10 active:scale-95 transition-all hover:brightness-110">KIRIM BUG</button>
               <div className="flex justify-center gap-2 mt-12">{BUG_TYPES.map((_, i) => (<button key={i} onClick={() => setActiveNav(i)} className={`h-1.5 transition-all rounded-full ${activeNav === i ? 'w-8 bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'w-1.5 bg-slate-800 hover:bg-slate-700'}`} />))}</div>
             </>
          ) : (
             <div className="flex-1 animate-fade_in settings-panel">
               <h2 className="text-2xl font-black uppercase italic mb-8 tracking-tighter text-white">SETTINGS</h2>
               <button onClick={() => setIsLoggedIn(false)} className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500/20 transition-all">LOGOUT SYSTEM</button>
             </div>
          )}
          <div className="fixed bottom-6 left-6 right-6 bg-[#0a1628]/80 border border-cyan-500/20 p-4 rounded-[2rem] flex justify-around backdrop-blur-lg animate-in slide-in-from-bottom-5 duration-300 z-20">
             <button onClick={() => setCurrentView('dashboard')} className={`p-3 rounded-full transition-all ${currentView === 'dashboard' ? 'bg-cyan-900/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'opacity-30'}`}><LayoutDashboard className={`w-6 h-6 ${currentView === 'dashboard' ? 'text-cyan-400' : 'text-white'}`} /></button>
             <button onClick={() => setCurrentView('settings')} className={`p-3 rounded-full transition-all ${currentView === 'settings' ? 'bg-cyan-900/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'opacity-30'}`}><Settings className={`w-6 h-6 ${currentView === 'settings' ? 'text-cyan-400' : 'text-white'}`} /></button>
          </div>
        </div>
      )}

      {/* --- KEHANCURAN CSS (ANIMASI RUSAK GLOBAL) --- */}
      <style jsx global>{`
        /* 1. Flicker Cepat (Tombol Bot) */
        @keyframes flicker_fast {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 10px #ff0000); }
          50% { opacity: 0.5; filter: drop-shadow(0 0 2px #550000); }
          52% { opacity: 1; }
          54% { opacity: 0; }
          56% { opacity: 1; }
        }
        .animate-flicker_fast { animation: flicker_fast 0.2s 10 alternate linear; }

        /* 2. Getar Brutal */
        @keyframes shake_violent {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake_violent { animation: shake_violent 0.1s infinite; }

        /* 3. Glitch Text Merah */
        @keyframes red_glitch {
          0% { text-shadow: 0.5px 0 0 #00ffff, -0.5px 0 0 #ff00ff; }
          4% { text-shadow: 0.5px 0 0 #00ffff, -0.5px 0 0 #ff00ff; }
          5% { text-shadow: -0.5px 0 0 #00ffff, 0.5px 0 0 #ff00ff; }
          100% { text-shadow: -0.5px 0 0 #00ffff, 0.5px 0 0 #ff00ff; }
        }
        .animate-red_glitch { animation: red_glitch 1s skew(3deg) infinite; }

        /* 4. Glitch Extreme Warna Merah-Warning */
        @keyframes red_glitch_extreme {
          0% { filter: contrast(150%) brightness(120%) hue-rotate(0deg); }
          10% { filter: contrast(200%) brightness(150%) hue-rotate(10deg); }
          20% { filter: contrast(150%) brightness(120%) hue-rotate(-10deg); transform: scale(1.02); }
          30% { filter: contrast(180%) brightness(130%) hue-rotate(0deg); }
          31% { transform: scale(0.98) skew(5deg); opacity: 0.8; }
          32% { transform: scale(1.0) skew(0deg); opacity: 1; }
          100% { filter: contrast(150%) brightness(120%) hue-rotate(0deg); }
        }
        .animate-red_glitch_extreme { animation: red_glitch_extreme 0.3s infinite; }
        
        .animate-fade_in_fast { animation: fade-in 0.3s ease-out; }
        .animate-fade_in { animation: fade-in 0.5s ease-out; }
        
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
      `}</style>
    </div>
  )
  }
