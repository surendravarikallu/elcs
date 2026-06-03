import Preloader            from '@/components/Preloader'
import Navbar               from '@/components/Navbar'
import Hero                 from '@/components/sections/Hero'
import About                from '@/components/sections/About'
import ThreeCs              from '@/components/sections/ThreeCs'
import Footer               from '@/components/sections/Footer'

export default function Home() {
  return (
    <>
      <Preloader />
      <Navbar />
      <main>
        <Hero />
        <About />
        <ThreeCs />
      </main>
      <Footer />
    </>
  )
}
