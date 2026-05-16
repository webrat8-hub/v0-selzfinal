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
        // Auto reset limit setelah 24 jam di database cloud
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

    // 3. TELEGRAM COMMAND MONITOR (MANGGIL URL CONTROL)
    if (action === 'checkCommands') {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=-1`, {
        cache: 'no-store'
      });
      const data = await res.json();

      if (data.ok && data.result?.length > 0) {
        const latestMsg = data.result[0].message;
        if (latestMsg?.chat.id.toString() === CHAT_ID) {
          const command = latestMsg.text;
          
          if (command === '/resetlimit') {
            await kv.set('yaemiko_bug_limit', 5);
          } else if (command === '/lockweb') {
            await kv.set('yaemiko_web_locked', true);
          } else if (command === '/unlockweb') {
            await kv.set('yaemiko_web_locked', false);
          }
          return NextResponse.json({ ok: true, commandTriggered: true, msgId: latestMsg.message_id });
        }
      }
      return NextResponse.json({ ok: true, commandTriggered: false });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Database Error' }, { status: 500 });
  }
}
