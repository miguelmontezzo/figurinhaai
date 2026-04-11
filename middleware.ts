import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Se não há credenciais do Supabase, deixa passar (modo dev/preview)
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    // Rotas protegidas
    const protectedRoutes = ['/album', '/trocas', '/pontos', '/perfil']
    const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

    // Rotas de auth (só acessíveis sem login)
    const authRoutes = ['/login', '/register']
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    if (!user && isProtected) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user && isAuthRoute) {
      return NextResponse.redirect(new URL('/album', request.url))
    }
  } catch (e) {
    // Em caso de erro de conexão, deixa continuar sem autenticação
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
