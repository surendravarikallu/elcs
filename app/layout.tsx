import type { Metadata } from 'next'
import { Oswald, Caudex, Nunito_Sans, JetBrains_Mono, Inter, DM_Sans } from 'next/font/google'
import './globals.css'

/* ── Oswald — display / headings (industrial condensed uppercase) ── */
const oswald = Oswald({
  subsets: ['latin'],
  variable: '--ff-display',
  display: 'swap',
})

/* ── Caudex — serif / italic accents ── */
const caudex = Caudex({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--ff-serif',
  display: 'swap',
})

/* ── Nunito Sans — body copy ── */
const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--ff-body',
  display: 'swap',
})

/* ── JetBrains Mono — monospace / labels ── */
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--ff-mono',
  display: 'swap',
})

/* ── Inter — general sans (hero headings etc.) ── */
const inter = Inter({
  subsets: ['latin'],
  variable: '--ff-sans',
  display: 'swap',
})

/* ── DM Sans — product names & detail view (humanist, highly legible) ── */
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--ff-product',
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
        ${oswald.variable}
        ${caudex.variable}
        ${nunitoSans.variable}
        ${jetbrainsMono.variable}
        ${inter.variable}
        ${dmSans.variable}
      `}
    >
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
