import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let bugLimit = (await kv.get<number>('bug_limit')) ?? 5;
    const isWebLocked = (await kv.get<boolean>('is_web_locked')) ?? false;
    const lastUsedTime = await kv.get<number>('last_used_time');

    // --- AUTOMATIC 24-HOUR RESET LOGIC (SERVER-SIDE) ---
    if (lastUsedTime) {
      const currentTime = Date.now();
      const timeDifference = currentTime - lastUsedTime;
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      // If more than 24 hours have passed, automatically reset to 5
      if (timeDifference >= twentyFourHours && bugLimit < 5) {
        bugLimit = 5;
        await kv.set('bug_limit', 5);
      }
    }

    return NextResponse.json({ bugLimit, isWebLocked });
  } catch (error) {
    return NextResponse.json({ bugLimit: 5, isWebLocked: false }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, secret } = body;

    if (action === 'use_bug') {
      let currentLimit = (await kv.get<number>('bug_limit')) ?? 5;
      const lastUsedTime = await kv.get<number>('last_used_time');
      const currentTime = Date.now();

      // Check duration before throwing "Limit Out" error
      if (lastUsedTime && (currentTime - lastUsedTime >= 24 * 60 * 60 * 1000)) {
        currentLimit = 5; // Duration expired, auto reset to 5
      }
      
      if (currentLimit <= 0) {
        return NextResponse.json({ success: false, message: 'Limit habis!' }, { status: 400 });
      }

      const nextLimit = currentLimit - 1;
      
      // Save next limit and record current execution timestamp to server
      await kv.set('bug_limit', nextLimit);
      await kv.set('last_used_time', currentTime); 
      
      return NextResponse.json({ success: true, bugLimit: nextLimit });
    }

    // --- TELEGRAM BOT CONTROLS ---
    if (secret !== process.env.API_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 });
    }

    if (action === 'reset') {
      await kv.set('bug_limit', 5);
      await kv.del('last_used_time'); // Clear timestamp to reset completely
      return NextResponse.json({ success: true, message: 'Limit reset to 5 via Bot' });
    }

    if (action === 'lock') {
      await kv.set('is_web_locked', true);
      return NextResponse.json({ success: true, message: 'Web Locked' });
    }

    if (action === 'unlock') {
      await kv.set('is_web_locked', false);
      return NextResponse.json({ success: true, message: 'Web Unlocked' });
    }

    return NextResponse.json({ error: 'Invalid Action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  }
