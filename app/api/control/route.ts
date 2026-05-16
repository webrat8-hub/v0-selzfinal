import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const BOT_TOKEN = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk';
const CHAT_ID = '6481060681';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, valueToSet } = body;

    // 1. AMBIL DATA DARI DATABASE VERCEL KV
    if (action === 'get') {
      let currentLimit = await kv.get<number>('yaemiko_bug_limit');
      let isWebLocked = await kv.get<boolean>('yaemiko_web_locked');
      let lastReset = await kv.get<number>('yaemiko_last_reset');

      const now = Date.now();

      if (currentLimit === null || currentLimit === undefined) {
        await kv.set('yaemiko_bug_limit', 5);
        await kv.set('yaemiko_web_locked', false);
        await kv.set('yaemiko_last_reset', now);
        currentLimit = 5;
        isWebLocked = false;
      } else {
        if (lastReset) {
          const timePassed = now - lastReset;
          if (timePassed >= 24 * 60 * 60 * 1000) {
            await kv.set('yaemiko_bug_limit', 5);
            await kv.set('yaemiko_last_reset', now);
            currentLimit = 5;
          }
        }
      }

      return NextResponse.json({ ok: true, limit: currentLimit, locked: isWebLocked });
    }

    // 2. SIMPAN / POTONG LIMIT DI DATABASE VERCEL KV
    if (action === 'set' && valueToSet !== undefined) {
      await kv.set('yaemiko_bug_limit', valueToSet);
      return NextResponse.json({ ok: true });
    }

    // 3. TELEGRAM COMMAND MONITOR (SCANNING MULTIPLE UPDATES)
    if (action === 'checkCommands') {
      // Ambil beberapa update terakhir, gak cuma satu, biar gak kelewatan
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=10&allowed_updates=["message"]`, {
        cache: 'no-store'
      });
      const data = await res.json();

      if (data.ok && data.result?.length > 0) {
        let commandTriggered = false;
        let latestMsgId = 0;

        // Looping/scan pesan dari bawah (terbaru) ke atas
        for (let i = data.result.length - 1; i >= 0; i--) {
          const msg = data.result[i].message;
          
          // Pastikan pesan berasal dari Chat ID lo
          if (msg && msg.chat.id.toString() === CHAT_ID) {
            const command = msg.text?.toLowerCase().trim();
            latestMsgId = msg.message_id;

            if (command === '/resetlimit' || command === '/risetlimit') {
              await kv.set('yaemiko_bug_limit', 5);
              commandTriggered = true;
            } else if (command === '/lockweb') {
              await kv.set('yaemiko_web_locked', true);
              commandTriggered = true;
            } else if (command === '/unlockweb') {
              await kv.set('yaemiko_web_locked', false);
              commandTriggered = true;
            }
            
            // Kalau udah ketemu perintah terbaru dari lo, langsung stop loop
            if (commandTriggered) break;
          }
        }

        const updatedLimit = await kv.get<number>('yaemiko_bug_limit');
        const updatedLocked = await kv.get<boolean>('yaemiko_web_locked');

        return NextResponse.json({ 
          ok: true, 
          commandTriggered, 
          msgId: latestMsgId,
          limit: updatedLimit,
          locked: updatedLocked
        });
      }
      return NextResponse.json({ ok: true, commandTriggered: false });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Database Error' }, { status: 500 });
  }
          }
