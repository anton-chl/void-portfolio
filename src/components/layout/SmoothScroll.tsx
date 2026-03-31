import { useEffect, useState, createContext, useContext } from 'react'
import Lenis from 'lenis'
import type { ReactNode } from 'react'

const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
  return useContext(LenisContext)
}

interface SmoothScrollProps {
  children: ReactNode
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  // Force full reload when page is restored from bfcache.
  // This prevents stale SPA state (broken Lenis, stalled AnimatePresence,
  // corrupted Three.js frame loop) after navigating back from external sites.
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload()
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  useEffect(() => {
    const isMobile = 'ontouchstart' in window && window.innerWidth < 768
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (isMobile || prefersReducedMotion) return

    const instance = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
    })

    setLenis(instance)

    let rafId: number
    function raf(time: number) {
      instance.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    // Re-sync Lenis when tab becomes visible again to prevent
    // scroll position drift after tab was backgrounded
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        instance.scrollTo(window.scrollY, { immediate: true })
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener('visibilitychange', handleVisibility)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  )
}
