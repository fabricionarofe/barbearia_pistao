import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;

  // Protege apenas as rotas que começam com /admin
  if (path.startsWith('/admin')) {
    // Verifica se o cookie de sessão do admin existe
    const adminSession = request.cookies.get('admin_session');

    if (!adminSession) {
      // Se não tiver sessão, redireciona para a página de login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
