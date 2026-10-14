'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Trophy, Eye, EyeOff, Loader2 } from 'lucide-react'
import { loginAction, type LoginState } from './actions'

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="w-full py-4 rounded-xl font-bold text-black text-base transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
      style={{ background: 'linear-gradient(135deg, #FFD700, #F0A500)' }}
    >
      {pending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Entrando...
        </>
      ) : (
        'Entrar'
      )}
    </button>
  )
}

export default function LoginPage() {
  const [state, formAction] = useFormState<LoginState, FormData>(loginAction, undefined)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <Link href="/" className="flex flex-col items-center mb-10">
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
        <h1 className="text-xl font-bold text-white mb-1">Entrar</h1>
        <p className="text-sm text-gray-400 mb-6">Acesse seu álbum da Copa</p>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Nome de usuário
            </label>
            <input
              name="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
              placeholder="seu_nome"
              required
              autoComplete="username"
              className="input-field w-full px-4 py-3.5 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Senha
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
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
          </div>

          <SubmitButton disabled={!username || !password} />
        </form>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        Não tem conta?{' '}
        <Link href="/register" className="text-brand-gold font-semibold hover:underline">
          Criar grátis
        </Link>
      </p>
    </div>
  )
}
