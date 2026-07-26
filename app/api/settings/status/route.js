import { NextResponse } from 'next/server';
import { openDb } from '../../../../lib/db';

export async function GET() {
  try {
    const db = await openDb();
    
    // Obter novo formato
    let statusRow = await db.get("SELECT value FROM settings WHERE key = 'store_status'");
    let timeRow = await db.get("SELECT value FROM settings WHERE key = 'return_time'");
    
    // Migração de is_open
    if (!statusRow) {
      let oldStatus = await db.get("SELECT value FROM settings WHERE key = 'is_open'");
      const initialStatus = (oldStatus && oldStatus.value === 'false') ? 'closed' : 'open';
      await db.run("INSERT INTO settings (key, value) VALUES ('store_status', ?)", [initialStatus]);
      statusRow = { value: initialStatus };
    }
    
    return NextResponse.json({ 
      store_status: statusRow.value,
      return_time: timeRow ? timeRow.value : null
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar status' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = await openDb();
    
    // store_status is one of: open, closed, lunch_break, emergency
    if (body.store_status) {
      await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('store_status', ?)", [body.store_status]);
    }
    
    // return_time might be null/empty, or a string '14:30'
    if (body.return_time !== undefined) {
      if (body.return_time === null) {
        await db.run("DELETE FROM settings WHERE key = 'return_time'");
      } else {
        await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('return_time', ?)", [body.return_time]);
      }
    }
    
    return NextResponse.json({ success: true, store_status: body.store_status, return_time: body.return_time });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 });
  }
}
