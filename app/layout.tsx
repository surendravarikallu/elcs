import type { Metadata } from 'next'
import { Bebas_Neue, Outfit, Caudex, Nunito, Geist_Mono } from 'next/font/google'
import './globals.css'

/* ── Bebas Neue → Abolition stand-in (industrial condensed uppercase) ── */
const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--ff-bebas',
  display: 'swap',
})

/* ── Outfit → Sofia Pro stand-in (clean geometric sans) ── */
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--ff-outfit',
  display: 'swap',
})

/* ── Caudex — exact match, available on Google Fonts ── */
const caudex = Caudex({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--ff-caudex',
  display: 'swap',
})

/* ── Nunito → Avenir stand-in (humanistic, rounded sans) ── */
const nunito = Nunito({
  subsets: ['latin'],
  variable: '--ff-nunito',
  display: 'swap',
})

/* ── Geist Mono — exact match ── */
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--ff-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ELCS — Embedded Labs & Control Systems',
  description:
    'Future-ready embedded modules, control systems, and connectivity devices built with precision and quality.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`
        ${bebasNeue.variable}
        ${outfit.variable}
        ${caudex.variable}
        ${nunito.variable}
        ${geistMono.variable}
      `}
    >
      <body className="bg-anthracite text-timberwolf font-nunito antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
