'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type LoginState = { error?: string } | undefined

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get('username') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!username || !password) {
    return { error: 'Preencha usuário e senha.' }
  }

  const supabase = createClient()

  // Resolve username → email via RPC (security definer no banco)
  const { data: email, error: rpcError } = await supabase.rpc(
    'get_email_by_username',
    { p_username: username }
  )

  if (rpcError || !email) {
    return { error: 'Usuário ou senha incorretos.' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: email as string,
    password,
  })

  if (error) {
    return { error: 'Usuário ou senha incorretos.' }
  }

  // Cookies de sessão já foram escritos pelo server client.
  // Redirect server-side — sem race com middleware.
  redirect('/album')
}
