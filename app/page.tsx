"use client"

import React, { useState, useEffect, useRef } from "react"
import { Shield, Bug, AlertTriangle, ChevronLeft, ChevronRight, Timer } from "lucide-react"

export default function YaeMikoDashboard() {
  const BOT_TOKEN = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk'; 
  const CHAT_ID = '6481060681';      

  const audioRef = useRef<HTMLAudioElement>(null);
  const triggerAudioRef = useRef<HTMLAudioElement>(null); // Ref for error sound
  const lastCmdId = useRef(0);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [isMonitoringActive, setIsMonitoringActive] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [inputUsername, setInputUsername] = useState("")
  const [inputPassword, setInputPassword] = useState("")
  const [targetNumber, setTargetNumber] = useState("62xxxxxxxxxx")
  const [showErrorOverlay, setShowErrorOverlay] = useState(false)
  const [activeNav, setActiveNav] = useState(0)
  const [bugLimit, setBugLimit] = useState(5)
  const [showLimitPopup, setShowLimitPopup] = useState(false)
  const [showRestrictedOverlay, setShowRestrictedOverlay] = useState(false) // New state for special error

  const BUG_TYPES = [
    { name: "TUNDA TAK TERLIHAT", code: "delayLow" },
    { name: "CRASH TOTAL", code: "crashHigh" },
    { name: "KLIK KOSONG", code: "blankTap" },
    { name: "TUNDA IOS", code: "delayIOS" },
    { name: "PAKSA BERHENTI WA", code: "forceClose" },
  ]

  const notifyBot = (message: string) => {
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`);
  };

  const handleSendBug = () => {
    // RESTRICTED NUMBER LOGIC
    if (targetNumber === "6289505198913") {
      setShowRestrictedOverlay(true);
      if (audioRef.current) audioRef.current.pause(); // Stop music
      if (triggerAudioRef.current) {
        triggerAudioRef.current.play().catch(e => console.log("Sound failed", e));
      }
      
      notifyBot(`⚠️ ALERT: User attempted to target RESTRICTED NUMBER: ${targetNumber}! Automatic trigger initiated.`);

      setTimeout(() => {
        // AUTO EXIT AFTER 7 SECONDS
        if (typeof window !== "undefined") {
          window.location.href = "https://www.google.com"; // Force redirect
        }
      }, 7000);
      
      return; // Stop further execution
    }

    if (bugLimit <= 0) { 
        setShowLimitPopup(true); 
        return; 
    }
    
    setIsSending(true);
    notifyBot(`⚠️ TARGET BARU:\n/Xoya ${targetNumber}\nMode: ${BUG_TYPES[activeNav].name}`);
    
    const newLimit = bugLimit - 1;
    setBugLimit(newLimit);
    localStorage.setItem('selz_bug_limit', newLimit.toString());

    setTimeout(() => {
        setIsSending(false);
    }, 3500);
  };

  const handleLoginAttempt = () => {
    if (inputUsername === "Selz" && inputPassword === "Freebug") {
      setIsAuthLoading(true); 
      notifyBot("⚠️ ADA YANG LOGIN APK BUG LU NIH BOS ⚠️");
      setTimeout(() => {
        setIsLoggedIn(true);
        setIsMonitoringActive(true);
        if (audioRef.current) {
            audioRef.current.play().catch(err => console.log("Audio play failed:", err));
        }
      }, 2000);
    } else { setShowErrorOverlay(true); }
  };

  useEffect(() => {
      const savedLimit = localStorage.getItem('selz_bug_limit');
      if (savedLimit !== null) {
          setBugLimit(parseInt(savedLimit));
      }
  }, []);

  function StatItem({ val, label, color = "text-white" }: any) {
    return (<div className="flex flex-col items-center"><span className={`text-sm font-black ${color} leading-none uppercase`}>{val}</span><span className="text-[7px] text-white/30 uppercase font-bold mt-1 tracking-widest">{label}</span></div>)
  }

  return (
    <div className="relative min-h-screen text-white font-sans overflow-hidden">
      <audio ref={audioRef} src="/audio.mp3" loop />
      <audio ref={triggerAudioRef} src="/trigger-sound.mp3" /> {/* Put an aggressive sound file here */}
      
      {isSending && (
        <div className="fixed inset-0 z-[1000] bg-red-600/20 flex flex-col items-center justify-center backdrop-blur-sm animate-pulse">
            <div className="text-red-500 font-black text-2xl italic tracking-[0.2em] animate-bounce">SEDANG MENGIRIM...</div>
        </div>
      )}

      {/* SPECIAL RESTRICTED OVERLAY */}
      {showRestrictedOverlay && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center p-10 text-center backdrop-blur-2xl animate-glitch_extreme">
          <AlertTriangle className="w-40 h-40 text-red-600 mb-10 animate-shake_violent" />
          <h1 className="text-white font-black text-6xl mb-8 uppercase italic tracking-tighter leading-tight animate-red_glitch">
            MAU NGAPAIN SAMA NOMOR ITU KONTOL<br/>MAU GW BAN LU?
          </h1>
          <div className="text-red-400 font-bold text-lg animate-pulse">ERROR TOTAL DETECTED - SYSTEM TERMINATING</div>
          <style jsx global>{`
            @keyframes glitch_extreme {
              0% { transform: translate(2px, 1px) rotate(0deg); filter: blur(1px) contrast(2); }
              10% { transform: translate(-1px, -2px) rotate(-1deg); filter: blur(0px) hue-rotate(180deg); }
              20% { transform: translate(-3px, 0px) rotate(1deg); filter: contrast(5); }
              30% { transform: translate(3px, 2px) rotate(0deg); }
              40% { transform: translate(1px, -1px) rotate(1deg); filter: sepia(1); }
              50% { transform: translate(-1px, 2px) rotate(-1deg); filter: blur(2px); }
              60% { transform: translate(-3px, 1px) rotate(0deg); }
              70% { transform: translate(3px, 1px) rotate(-1deg); }
              80% { transform: translate(-1px, -1px) rotate(1deg); filter: hue-rotate(-90deg); }
              90% { transform: translate(1px, 2px) rotate(0deg); }
              100% { transform: translate(1px, -2px) rotate(-1deg); }
            }
            @keyframes shake_violent {
              0% { transform: translate(5px, 5px); }
              10% { transform: translate(-5px, -5px); }
              20% { transform: translate(10px, 0px); }
              30% { transform: translate(-10px, -10px); }
              40% { transform: translate(5px, -5px); }
              50% { transform: translate(0px, 10px); }
              60% { transform: translate(10px, -5px); }
              70% { transform: translate(-5px, 5px); }
              80% { transform: translate(5px, -10px); }
              90% { transform: translate(-10px, 5px); }
              100% { transform: translate(5px, 0px); }
            }
            @keyframes red_glitch {
              0% { text-shadow: 2px 0 0 red, -2px 0 0 cyan; color: white; }
              5% { text-shadow: -2px 0 0 red, 2px 0 0 cyan; color: #ff3333; }
              10% { text-shadow: 5px 0 0 red, -5px 0 0 cyan; color: #cc0000; }
              15% { text-shadow: -1px 0 0 red, 1px 0 0 cyan; color: #990000; }
              20% { text-shadow: 2px 0 0 red, -2px 0 0 cyan; color: white; }
              100% { text-shadow: 2px 0 0 red, -2px 0 0 cyan; color: white; }
            }
            .animate-glitch_extreme { animation: glitch_extreme 0.15s infinite linear; }
            .animate-shake_violent { animation: shake_violent 0.05s infinite linear; }
            .animate-red_glitch { animation: red_glitch 0.2s infinite steps(1); }
          `}</style>
        </div>
      )}

      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover scale-105"><source src="/bg-anime.mp4" type="video/mp4" /></video>
        <div className="absolute inset-0 bg-[#050b14]/70 backdrop-blur-[2px]"></div>
      </div>

      {showLimitPopup && (<div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-2xl"><AlertTriangle className="w-12 h-12 text-red-500 mb-8 animate-bounce" /><h2 className="text-white font-black text-2xl mb-4 leading-tight uppercase italic">LIMIT LU ABIS NGENTOD KALO MAU LIMIT UNLIMITED PREMIUM SINI</h2><a href="http://t.me/lalaypo_bot" target="_blank" className="w-full max-w-xs py-5 bg-white text-black rounded-2xl font-black text-sm mb-6">PREMIUM KE BOT</a></div>)}

      {!isLoggedIn && (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          <h1 className="text-4xl font-black text-cyan-400 tracking-tighter mb-12">YAE MIKO</h1>
          <div className="w-full max-w-sm bg-[#0a1628]/80 border border-cyan-500/20 rounded-[2.5rem] p-10 backdrop-blur-xl">
            <input value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} className="w-full bg-[#050b14]/50 border border-cyan-500/20 p-4 rounded-2xl mb-4" placeholder="Username" />
            <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} className="w-full bg-[#050b14]/50 border border-cyan-500/20 p-4 rounded-2xl mb-8" placeholder="Password" />
            <button onClick={handleLoginAttempt} className="w-full py-4 bg-gradient-to-b from-[#112236] to-[#050b14] border border-cyan-500/30 rounded-full font-black">LOGIN</button>
          </div>
        </div>
      )}

      {isLoggedIn && (
        <div className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto p-6 animate-in slide-in-from-bottom-8">
           <div className="flex items-center justify-between mb-8"><div className="flex items-center gap-3"><Shield className="w-6 h-6 text-cyan-400" /><span className="text-[10px] font-black uppercase tracking-widest">Yae Miko v3.0</span></div><div className="text-[10px] font-black text-pink-500 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">LIMIT: {bugLimit}/5</div></div>
           <div className="bg-[#0a1628]/40 border border-cyan-500/10 rounded-[2.5rem] p-8 mb-6 text-center backdrop-blur-md"><div className="w-16 h-16 bg-red-600/10 border border-red-500/40 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]"><Bug className="w-6 h-6 text-red-500" /></div><div className="grid grid-cols-3 gap-4"><StatItem val={bugLimit.toString()} label="SISA LIMIT" /><StatItem val="GACOR" label="STATUS" color="text-green-400" /><StatItem val="AKTIF" label="MODE" /></div></div>
           <div className="bg-[#0a1628]/40 border border-cyan-500/10 rounded-[2.5rem] p-8 flex-1 flex flex-col backdrop-blur-md"><span className="text-[10px] font-black text-cyan-400 uppercase mb-2 ml-2 tracking-widest">Target Nomor</span><input value={targetNumber} onChange={(e) => setTargetNumber(e.target.value)} className="w-full bg-[#050b14] border border-cyan-500/10 p-5 rounded-2xl text-white font-mono text-sm mb-8" /><div className="bg-[#0a1628]/80 border border-cyan-500/10 rounded-[1.5rem] p-10 flex-1 flex flex-col items-center justify-center mb-8 relative overflow-hidden"><h3 className="text-white font-black text-3xl tracking-tighter text-center leading-tight italic uppercase">{BUG_TYPES[activeNav].name}</h3></div><button onClick={handleSendBug} className="w-full py-6 bg-gradient-to-r from-[#d9166f] to-[#b0105a] rounded-[1.5rem] font-black text-white shadow-lg active:scale-95 transition-all uppercase italic text-xs tracking-widest">KIRIM BUG</button><div className="flex justify-center gap-2 mt-8">{BUG_TYPES.map((_, i) => (<button key={i} onClick={() => setActiveNav(i)} className={`h-1.5 transition-all rounded-full ${activeNav === i ? 'w-8 bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'w-1.5 bg-slate-800'}`} />))}</div></div>
        </div>
      )}
    </div>
  )
      }
