import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FigurinhaAI – Copa do Mundo 2026™',
  description: 'Gerencie seu álbum da Copa do Mundo FIFA 2026™ com inteligência artificial. Registre figurinhas, encontre trocas e complete seu álbum!',
  keywords: ['figurinhas', 'copa do mundo', '2026', 'álbum', 'panini', 'troca', 'ia', 'inteligência artificial'],
  authors: [{ name: 'FigurinhaAI' }],
  openGraph: {
    title: 'FigurinhaAI – Copa do Mundo 2026™',
    description: 'Gerencie seu álbum da Copa com IA',
    type: 'website',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FigurinhaAI',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="bg-brand-navy text-white antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1a1a35',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#00E676',
                secondary: '#1a1a35',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#1a1a35',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
