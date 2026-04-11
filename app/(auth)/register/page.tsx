'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const passwordStrength = (() => {
    if (!password) return 0
    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  })()

  const strengthLabel = ['', 'Fraca', 'Regular', 'Boa', 'Forte', 'Excelente'][passwordStrength]
  const strengthColor = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#00E676'][passwordStrength]

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !email || !password) return
    if (password.length < 6) {
      toast.error('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (username.length < 3) {
      toast.error('O nome de usuário precisa ter pelo menos 3 caracteres.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    // Verificar se username já existe
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .single()

    if (existingUser) {
      toast.error('Esse nome de usuário já está em uso.')
      setLoading(false)
      return
    }

    // Criar usuário
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          display_name: username,
        },
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('Este e-mail já está cadastrado.')
      } else {
        toast.error('Erro ao criar conta. Tente novamente.')
      }
      setLoading(false)
      return
    }

    if (data.user) {
      // Criar perfil
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username: username.toLowerCase(),
        display_name: username,
      })

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError)
      }

      toast.success('Conta criada! Bem-vindo ao FigurinhaAI!')
      router.push('/album')
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <Link href="/" className="flex flex-col items-center mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #00D4FF)' }}
        >
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <span className="text-2xl font-black">
          <span className="copa-text">Figurinha</span>
          <span className="text-white">AI</span>
        </span>
        <span className="text-xs text-gray-500 mt-0.5">Copa do Mundo FIFA 2026™</span>
      </Link>

      {/* Form */}
      <div className="glass rounded-3xl p-6">
        <h1 className="text-xl font-bold text-white mb-1">Criar conta</h1>
        <p className="text-sm text-gray-400 mb-6">Rápido e grátis. Sem complicação!</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Nome de usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
              placeholder="seu_nome"
              required
              minLength={3}
              maxLength={30}
              autoComplete="username"
              className="input-field w-full px-4 py-3.5 rounded-xl text-sm"
            />
            <p className="text-xs text-gray-600 mt-1">Sem espaços. Mín. 3 caracteres.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
              className="input-field w-full px-4 py-3.5 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mín. 6 caracteres"
                required
                minLength={6}
                autoComplete="new-password"
                className="input-field w-full px-4 py-3.5 rounded-xl text-sm pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all"
                      style={{
                        background: i <= passwordStrength ? strengthColor : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs mt-1" style={{ color: strengthColor }}>
                  {strengthLabel}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !username || !email || !password}
            className="w-full py-4 rounded-xl font-bold text-black text-base transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            style={{ background: 'linear-gradient(135deg, #FFD700, #F0A500)' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Criando conta...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Criar conta grátis
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        Já tem conta?{' '}
        <Link href="/login" className="text-brand-gold font-semibold hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
