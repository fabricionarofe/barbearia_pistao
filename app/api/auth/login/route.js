import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Credenciais hardcoded do administrador
    const ADMIN_EMAIL = 'pa.davi280690@gmail.com';
    const ADMIN_PASS = 'Aa2526@@';

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      // Cria a resposta e o cookie de sessão válido por 7 dias
      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    // Credenciais inválidas
    return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
