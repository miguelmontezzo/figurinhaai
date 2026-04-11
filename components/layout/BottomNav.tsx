'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, ArrowLeftRight, MapPin, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/album',
    label: 'Álbum',
    icon: BookOpen,
    activeColor: '#FFD700',
  },
  {
    href: '/trocas',
    label: 'Trocas',
    icon: ArrowLeftRight,
    activeColor: '#00E676',
  },
  {
    href: '/pontos',
    label: 'Pontos',
    icon: MapPin,
    activeColor: '#00D4FF',
  },
  {
    href: '/perfil',
    label: 'Perfil',
    icon: User,
    activeColor: '#7C3AED',
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon, activeColor }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all',
                isActive ? 'opacity-100' : 'opacity-50 hover:opacity-75'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                  isActive ? 'scale-110' : 'scale-100'
                )}
                style={isActive ? { background: `${activeColor}22` } : {}}
              >
                <Icon
                  className="w-5 h-5 transition-all"
                  style={{ color: isActive ? activeColor : '#9CA3AF' }}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className="text-xs font-medium transition-all"
                style={{ color: isActive ? activeColor : '#6B7280', fontSize: '10px' }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
