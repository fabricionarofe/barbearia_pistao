import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin_session');
    return response;
  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.json({ error: 'Erro ao sair da conta.' }, { status: 500 });
  }
}
