import Preloader from '@/components/Preloader'

export default function Home() {
  return (
    <>
      <Preloader />

      {/* ─── Sections mount here one by one ─── */}
      <main className="min-h-screen bg-anthracite flex items-center justify-center">
        <p
          className="text-timberwolf/20 text-[10px] tracking-[0.5em] uppercase"
          style={{ fontFamily: 'var(--ff-mono)' }}
        >
          ELCS — Building...
        </p>
      </main>
    </>
  )
}
