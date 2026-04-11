import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Trophy, Zap, MapPin, ArrowRight, Star, Users } from 'lucide-react'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/album')
  }

  return (
    <main className="min-h-screen bg-brand-navy flex flex-col">
      {/* Hero */}
      <div
        className="relative flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 20% 20%, rgba(124, 58, 237, 0.2) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(0, 212, 255, 0.15) 0%, transparent 60%), #0a0a1a',
        }}
      >
        {/* Stars decorativas */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 2 + 1 + 'px',
                height: Math.random() * 2 + 1 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 60 + '%',
                opacity: Math.random() * 0.3 + 0.1,
              }}
            />
          ))}
        </div>

        {/* Logo */}
        <div className="relative mb-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-4"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #00D4FF)' }}>
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            <span className="copa-text">Figurinha</span>
            <span className="text-white">AI</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1 font-medium tracking-widest uppercase">
            Copa do Mundo FIFA 2026™
          </p>
        </div>

        {/* Headline */}
        <div className="text-center mb-8 max-w-sm">
          <h2 className="text-2xl font-bold text-white mb-3 leading-tight">
            Complete seu álbum com
            <span className="copa-text"> inteligência artificial</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Registre suas figurinhas, descubra repetidas e encontre trocas perfeitas com quem está perto de você.
          </p>
        </div>

        {/* Features */}
        <div className="w-full max-w-sm space-y-3 mb-10">
          {[
            {
              icon: <Zap className="w-5 h-5" />,
              color: '#FFD700',
              title: 'Registro Inteligente',
              desc: 'Bate, analisa: já tem? Vai pra repetida. Não tem? Vai pro álbum!',
            },
            {
              icon: <MapPin className="w-5 h-5" />,
              color: '#00D4FF',
              title: 'Pontos de Troca',
              desc: 'Locais oficiais e da comunidade. Ative sua localização e negocie!',
            },
            {
              icon: <Star className="w-5 h-5" />,
              color: '#00E676',
              title: 'IA de Trocas',
              desc: 'A IA analisa quem tem o que você precisa e vice-versa. Troca perfeita!',
            },
            {
              icon: <Users className="w-5 h-5" />,
              color: '#7C3AED',
              title: '980 Figurinhas Mapeadas',
              desc: '912 regulares + 68 especiais metalizadas. Todas catalogadas!',
            },
          ].map((f, i) => (
            <div key={i} className="glass rounded-2xl p-4 flex items-start gap-3">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${f.color}22`, color: f.color }}
              >
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{f.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="w-full max-w-sm space-y-3">
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-black text-base transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #FFD700, #F0A500)' }}
          >
            Criar conta grátis
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center w-full py-4 rounded-2xl font-semibold text-white text-base glass transition-all active:scale-95"
          >
            Já tenho conta
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-8">
          FigurinhaAI não é afiliado à FIFA ou Panini®
        </p>
      </div>
    </main>
  )
}
