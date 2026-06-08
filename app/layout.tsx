import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

/* ── Inter — primary clean, highly readable font family ── */
const inter = Inter({
  subsets: ['latin'],
  variable: '--ff-sans',
  display: 'swap',
})

/* ── JetBrains Mono — monospace / labels ── */
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--ff-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ELCS — Embedded Modules, Control & Connectivity',
  description:
    'ELCS designs and manufactures future-ready embedded modules, control systems, and connectivity devices — precision-engineered hardware for engineers, makers, and industry.',
  openGraph: {
    title: 'ELCS — Embedded Modules, Control & Connectivity',
    description: 'Future-ready embedded hardware: custom PCBs, core modules, IoT, control, firmware.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`
        ${inter.variable}
        ${jetbrainsMono.variable}
      `}
    >
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
