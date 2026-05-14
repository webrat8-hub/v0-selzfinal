"use client"

import React, { useState, useEffect, useRef } from "react"
import { Shield, Bug, AlertTriangle, LayoutDashboard, Settings, Loader2, Timer } from "lucide-react"

export default function YaeMikoDashboard() {
  const BOT_TOKEN = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk'; 
  const CHAT_ID = '6481060681';      

  const audioRef = useRef<HTMLAudioElement>(null);
  const triggerAudioRef = useRef<HTMLAudioElement>(null);
  const lastCmdId = useRef(0);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [targetNumber, setTargetNumber] = useState("62xxxxxxxxxx");
  const [bugLimit, setBugLimit] = useState(() => {
    if (typeof window !== 'undefined') return parseInt(localStorage.getItem('bugLimit') || '5');
    return 5;
  });
  
  const [showErrorOverlay, setShowErrorOverlay] = useState(false);
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [showRestrictedOverlay, setShowRestrictedOverlay] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeNav, setActiveNav] = useState(0);

  const BUG_TYPES = [
    { name: "TUNDA TAK TERLIHAT", code: "delayLow" },
    { name: "CRASH TOTAL", code: "crashHigh" },
    { name: "KLIK KOSONG", code: "blankTap" },
    { name: "TUNDA IOS", code: "delayIOS" },
    { name: "PAKSA BERHENTI WA", code: "forceClose" },
  ];

  // Logic Storage
  useEffect(() => { localStorage.setItem('bugLimit', bugLimit.toString()); }, [bugLimit]);

  // Bot Engine
  useEffect(() => {
    if (!isMonitoringActive) return;
    const checkCommands = setInterval(async () => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=-1`);
        const data = await res.json();
        if (data.ok && data.result?.length > 0) {
          const latestMsg = data.result[0].message;
          if (latestMsg?.message_id !== lastCmdId.current && latestMsg?.chat.id.toString() === CHAT_ID && latestMsg.text === '/resetlimit') {
            lastCmdId.current = latestMsg.message_id;
            setBugLimit(5);
            fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=✅ LIMIT BERHASIL DIRESET!`);
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
    if (targetNumber === "6289505198913") { setShowRestrictedOverlay(true); return; }
    if (bugLimit <= 0) { setShowLimitPopup(true); return; }
    setIsSending(true);
    setTimeout(() => { setIsSending(false); setBugLimit(prev => prev - 1); }, 3000);
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden">
      {/* Background Video */}
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover scale-105"><source src="/bg-anime.mp4" type="video/mp4" /></video>
        <div className="absolute inset-0 bg-[#050b14]/70 backdrop-blur-[2px]"></div>
      </div>

      {/* Overlays */}
      {showErrorOverlay && (
        <div className="fixed inset-0 z-[999] bg-red-950/90 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md animate-red_glitch_extreme" onClick={() => setShowErrorOverlay(false)}>
           <AlertTriangle className="w-40 h-40 text-red-600 mb-10 animate-shake_violent" />
           <h1 className="font-black text-6xl uppercase italic tracking-tighter text-white animate-red_glitch">LOGIN GAGAL!</h1>
           <a href="http://t.me/lalaypo_bot" target="_blank" className="bg-red-600 text-white px-12 py-5 mt-10 rounded-full font-black uppercase text-sm animate-flicker_fast">CREATE AKUN KE BOT</a>
        </div>
      )}

      {isSending && (
        <div className="fixed inset-0 z-[999] bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
          <h2 className="text-white font-black italic uppercase">SENDING BUG...</h2>
        </div>
      )}

      {showLimitPopup && (
        <div className="fixed inset-0 z-[999] bg-red-950/90 flex flex-col items-center justify-center p-6 text-center animate-red_glitch_extreme" onClick={() => setShowLimitPopup(false)}>
           <Bug className="w-40 h-40 text-red-600 mb-10 animate-shake_violent" />
           <h2 className="text-white font-black text-4xl uppercase italic animate-red_glitch">LIMIT ABIS NGENTOD</h2>
           <a href="http://t.me/lalaypo_bot" target="_blank" className="bg-red-600 text-white px-12 py-5 mt-8 rounded-full font-black uppercase text-sm animate-flicker_fast">PREMIUM KE BOT</a>
        </div>
      )}

      {/* Main UI */}
      {!isLoggedIn ? (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          <h1 className="text-4xl font-black italic uppercase mb-12 text-cyan-400 tracking-tighter">YAE MIKO</h1>
          <div className="w-full max-w-sm bg-[#0a1628]/80 border border-cyan-500/20 rounded-[2.5rem] p-10 backdrop-blur-xl">
            <input value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} className="w-full bg-[#050b14]/50 border border-cyan-500/20 p-4 rounded-2xl mb-4 text-white" placeholder="USERNAME" />
            <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} className="w-full bg-[#050b14]/50 border border-cyan-500/20 p-4 rounded-2xl mb-8 text-white" placeholder="PASSWORD" />
            <button onClick={handleLoginAttempt} className="w-full py-4 bg-gradient-to-b from-[#112236] to-[#050b14] rounded-full font-black uppercase text-xs text-white">LOGIN</button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 p-6 max-w-md mx-auto min-h-screen flex flex-col">
          {currentView === 'dashboard' ? (
             <div className="animate-in fade-in">
               <div className="flex justify-between items-center mb-6">
                 <span className="font-black italic uppercase text-xs text-cyan-400">DASHBOARD</span>
                 <span className="bg-[#1a2538] px-3 py-1 rounded-full text-[10px] font-black text-pink-500">LIMIT: {bugLimit}/5</span>
               </div>
               
               <div className="bg-[#0a1628]/60 border border-white/5 rounded-[2.5rem] p-8 mb-8 text-center backdrop-blur-md shadow-2xl">
                  <div className="w-20 h-20 rounded-full border border-red-500/20 flex items-center justify-center mx-auto mb-6 bg-red-500/5">
                    <Bug className="w-8 h-8 text-red-500 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-black uppercase italic text-white mb-6">{BUG_TYPES[activeNav].name}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#050b14]/50 p-4 rounded-2xl border border-white/5"><p className="text-xl font-black text-cyan-400">{bugLimit}</p><p className="text-[8px] uppercase font-bold text-white/40">SISA LIMIT</p></div>
                    <div className="bg-[#050b14]/50 p-4 rounded-2xl border border-white/5"><p className="text-xl font-black text-green-500">READY</p><p className="text-[8px] uppercase font-bold text-white/40">STATUS</p></div>
                  </div>
               </div>

               <input value={targetNumber} onChange={(e) => setTargetNumber(e.target.value)} className="w-full bg-[#050b14] border border-white/10 p-5 rounded-2xl mb-6 text-white text-sm" placeholder="62..." />
               <button onClick={handleSendBug} className="w-full py-6 bg-gradient-to-r from-[#d9166f] to-[#b0105a] rounded-[1.5rem] font-black uppercase italic text-xs text-white">KUMBANG KIRIM</button>
             </div>
          ) : (
             <div className="animate-in fade-in">
               <h2 className="text-2xl font-black uppercase italic mb-8 text-white">SETTINGS</h2>
               <button onClick={() => setIsLoggedIn(false)} className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase text-[10px]">LOGOUT</button>
             </div>
          )}
          <div className="fixed bottom-6 left-6 right-6 bg-[#0a1628]/80 border border-cyan-500/20 p-4 rounded-[2rem] flex justify-around backdrop-blur-lg">
             <button onClick={() => setCurrentView('dashboard')}><LayoutDashboard className="w-6 h-6 text-cyan-400" /></button>
             <button onClick={() => setCurrentView('settings')}><Settings className="w-6 h-6 text-white" /></button>
          </div>
        </div>
      )}
      
      {/* CSS Animasi (Jangan Dihapus) */}
      <style jsx global>{`
        .animate-flicker_fast { animation: flicker_fast 0.2s 10 alternate linear; }
        .animate-shake_violent { animation: shake_violent 0.1s infinite; }
        .animate-red_glitch { animation: red_glitch 1s skew(3deg) infinite; }
        .animate-red_glitch_extreme { animation: red_glitch_extreme 0.3s infinite; }
        @keyframes flicker_fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
        @keyframes shake_violent { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-5px); } }
        @keyframes red_glitch { 0% { text-shadow: 2px 0 red; } 100% { text-shadow: -2px 0 blue; } }
        @keyframes red_glitch_extreme { 0% { filter: hue-rotate(0deg); } 50% { filter: hue-rotate(90deg) contrast(200%); } }
      `}</style>
    </div>
  )
               }
