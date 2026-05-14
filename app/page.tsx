"use client"

import React, { useState, useEffect, useRef } from "react"
import { Shield, Bug, AlertTriangle, LayoutDashboard, Settings, Volume2, VolumeX, Trash2, Info, Loader2, Timer, ChevronLeft, ChevronRight } from "lucide-react"

export default function YaeMikoDashboard() {
  const BOT_TOKEN = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk'; 
  const CHAT_ID = '6481060681';      

  const audioRef = useRef<HTMLAudioElement>(null);
  const lastCmdId = useRef(0);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [targetNumber, setTargetNumber] = useState("62xxxxxxxxxx");
  const [bugLimit, setBugLimit] = useState(5);
  
  // Overlay States
  const [showErrorOverlay, setShowErrorOverlay] = useState(false); // Salah Login
  const [showLimitPopup, setShowLimitPopup] = useState(false); // Limit Habis
  const [showRestrictedOverlay, setShowRestrictedOverlay] = useState(false); // Nomor Terlarang
  
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
    }
  };

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
    setTimeout(() => {
      setIsSending(false);
      setBugLimit(prev => prev - 1);
    }, 3000);
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden">
      
      {/* 1. OVERLAY LOGIN ERROR (With Bot Link) */}
      {showErrorOverlay && (
        <div className="fixed inset-0 z-[999] bg-black/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md" onClick={() => setShowErrorOverlay(false)}>
           <h1 className="text-red-500 font-black text-2xl italic uppercase mb-4">LOGIN FAILED</h1>
           <p className="text-[10px] font-black uppercase italic text-white/50 mb-8">USERNAME/PASSWORD SALAH KONTOL</p>
           <a href="http://t.me/lalaypo_bot" target="_blank" className="bg-white text-black px-10 py-4 rounded-full font-black uppercase text-xs">CREATE/LOGIN BOT</a>
        </div>
      )}

      {/* 2. OVERLAY LOADING */}
      {isSending && (
        <div className="fixed inset-0 z-[999] bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
          <h2 className="text-white font-black italic uppercase tracking-widest">SENDING BUG...</h2>
        </div>
      )}

      {/* 3. OVERLAY LIMIT ABIS (With Bot Link) */}
      {showLimitPopup && (
        <div className="fixed inset-0 z-[999] bg-black/95 flex flex-col items-center justify-center p-6 text-center">
           <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
           <h2 className="text-white font-black text-2xl mb-4 uppercase italic">LIMIT ABIS NGENTOD</h2>
           <a href="http://t.me/lalaypo_bot" target="_blank" className="bg-white text-black px-8 py-3 rounded-full font-black uppercase text-xs mb-6">PREMIUM KE BOT</a>
           <div className="flex items-center gap-2 text-yellow-400 font-black text-[10px] uppercase italic">
             <Timer className="w-4 h-4" /> <span>RESET 24 JAM</span>
           </div>
        </div>
      )}

      {/* 4. OVERLAY RESTRICTED */}
      {showRestrictedOverlay && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-red-600 font-black text-4xl uppercase italic mb-4">ACCESS RESTRICTED</h1>
          <p className="text-white/50 text-[10px] uppercase font-black tracking-[0.3em] mb-8">NOMOR INI GAK BISA DISERANG TOLOL</p>
          <button onClick={() => setShowRestrictedOverlay(false)} className="bg-white text-black px-8 py-3 rounded-full font-black uppercase text-xs">BACK</button>
        </div>
      )}

      {/* UI UTAMA */}
      {!isLoggedIn ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <h1 className="text-4xl font-black italic uppercase mb-12">YAE MIKO</h1>
          <div className="w-full max-w-sm bg-[#0a1628] border border-white/10 rounded-[2rem] p-8">
            <input value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} className="w-full bg-black/50 border border-white/10 p-4 rounded-xl mb-4 text-sm" placeholder="USERNAME" />
            <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 p-4 rounded-xl mb-8 text-sm" placeholder="PASSWORD" />
            <button onClick={handleLoginAttempt} className="w-full py-4 bg-white text-black rounded-full font-black uppercase text-xs">LOGIN</button>
          </div>
        </div>
      ) : (
        <div className="p-6 max-w-md mx-auto min-h-screen flex flex-col">
          {currentView === 'dashboard' ? (
             <>
               <div className="flex justify-between items-center mb-8"><span className="text-xs font-black uppercase italic">DASHBOARD</span><span className="text-xs font-black uppercase italic text-pink-500">LIMIT: {bugLimit}</span></div>
               <div className="bg-[#0a1628] rounded-[2rem] p-8 mb-6 text-center"><h2 className="text-2xl font-black uppercase italic">{BUG_TYPES[activeNav].name}</h2></div>
               <input value={targetNumber} onChange={(e) => setTargetNumber(e.target.value)} className="w-full bg-[#0a1628] border border-white/10 p-4 rounded-xl mb-6 text-sm" />
               <button onClick={handleSendBug} className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase italic text-xs">KIRIM BUG</button>
               <div className="flex justify-center gap-2 mt-8">{BUG_TYPES.map((_, i) => (<button key={i} onClick={() => setActiveNav(i)} className={`h-1.5 transition-all rounded-full ${activeNav === i ? 'w-8 bg-cyan-400' : 'w-1.5 bg-slate-800'}`} />))}</div>
             </>
          ) : (
             <div className="flex-1">
               <h2 className="text-2xl font-black uppercase italic mb-8">SETTINGS</h2>
               <button onClick={() => setIsLoggedIn(false)} className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase text-[10px]">LOGOUT</button>
             </div>
          )}
          <div className="fixed bottom-6 left-6 right-6 bg-[#0a1628] p-4 rounded-[2rem] flex justify-around">
             <button onClick={() => setCurrentView('dashboard')}><LayoutDashboard size={20} /></button>
             <button onClick={() => setCurrentView('settings')}><Settings size={20} /></button>
          </div>
        </div>
      )}
    </div>
  )
    }
