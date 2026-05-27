import { Outlet, useLocation } from 'react-router'
import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import { Toaster } from '@/components/ui/sonner'

export default function Layout() {
  const [scrollY, setScrollY] = useState(0)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#EBE5D9]">
      <Navbar scrollY={scrollY} />
      <main>
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
