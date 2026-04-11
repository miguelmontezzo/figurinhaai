import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout/BottomNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  // Só verifica auth se Supabase está configurado com credenciais reais
  if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
  }

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col">
      <main className="flex-1 pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
