import { NextResponse } from 'next/server';
import { openDb } from '../../../lib/db';

export async function GET() {
  try {
    const db = await openDb();
    const rows = await db.all('SELECT * FROM settings');

    const settingsObj = {};
    rows.forEach(r => {
      try {
        settingsObj[r.key] = JSON.parse(r.value);
      } catch (e) {
        settingsObj[r.key] = r.value;
      }
    });

    // Valores padrão para tema e redes sociais
    if (!settingsObj.site_theme) {
      settingsObj.site_theme = {
        primary_color: '#EAB308',
        logo_url: '/img/logo.jpeg',
        banner_url: '/img/banner.jpeg'
      };
    }
    if (!settingsObj.social_links) {
      settingsObj.social_links = {
        instagram: '',
        facebook: '',
        whatsapp: '',
        tiktok: '',
        youtube: '',
        website: '',
        twitter: ''
      };
    }

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = await openDb();

    for (const [key, value] of Object.entries(body)) {
      const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);

      const existing = await db.get('SELECT key FROM settings WHERE key = ?', [key]);
      if (existing) {
        await db.run('UPDATE settings SET value = ? WHERE key = ?', [valStr, key]);
      } else {
        await db.run('INSERT INTO settings (key, value) VALUES (?, ?)', [key, valStr]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 });
  }
}
