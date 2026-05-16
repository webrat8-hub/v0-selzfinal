import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const CHAT_ID = '6481060681';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // --- JALUR 1: DETEKSI TEMBAKAN WEBHOOK DARI TELEGRAM ---
    if (body.message) {
      const msg = body.message;
      
      // Pastikan perintah hanya datang dari Chat ID lo (Selz)
      if (msg.chat && msg.chat.id.toString() === CHAT_ID) {
        const command = msg.text?.toLowerCase().trim();

        if (command === '/resetlimit' || command === '/risetlimit') {
          await kv.set('yaemiko_bug_limit', 5);
        } else if (command === '/lockweb') {
          await kv.set('yaemiko_web_locked', true);
        } else if (command === '/unlockweb') {
          await kv.set('yaemiko_web_locked', false);
        }
      }
      // Telegram butuh respon OK 200 biar gak ngirim pesan berulang-ulang
      return NextResponse.json({ ok: true });
    }

    // --- JALUR 2: CONTEXT LAMA UNTUK AMBIL & SET DATA DASHBOARD ---
    const { action, valueToSet, messageText } = body;

    if (action === 'get') {
      let currentLimit = await kv.get<number>('yaemiko_bug_limit');
      let isWebLocked = await kv.get<boolean>('yaemiko_web_locked');
      
      if (currentLimit === null || currentLimit === undefined) {
        await kv.set('yaemiko_bug_limit', 5);
        await kv.set('yaemiko_web_locked', false);
        currentLimit = 5;
        isWebLocked = false;
      }
      return NextResponse.json({ ok: true, limit: currentLimit, locked: isWebLocked });
    }

    if (action === 'set' && valueToSet !== undefined) {
      await kv.set('yaemiko_bug_limit', valueToSet);
      return NextResponse.json({ ok: true });
    }

    if (action === 'sendReport' && messageText) {
      const BOT_TOKEN = '8208922468:AAGCSBYVOB-aRRz1s__rHZUwh2h5rSMsRbk';
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: messageText,
          parse_mode: 'Markdown'
        })
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Database Error' }, { status: 500 });
  }
}
