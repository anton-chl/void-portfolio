import { useRef, useState, useEffect, useCallback } from 'react'

interface ScrollProgressOptions {
  /** How far before the element enters the viewport to start (0 = at viewport bottom, negative = before) */
  offset?: number
  /** The scroll distance over which the animation plays (in vh units) */
  range?: number
}

/**
 * Returns a ref to attach to an element and a progress value (0-1)
 * 0 = element hasn't entered the assembly zone yet (particles scattered)
 * 1 = element is fully assembled
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>(
  options: ScrollProgressOptions = {}
) {
  const { offset = 0, range = 0.6 } = options
  const ref = useRef<T>(null)
  const [progress, setProgress] = useState(0)

  const handleScroll = useCallback(() => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const vh = window.innerHeight

    // Start point: when element top reaches (bottom of viewport + offset)
    // End point: start + range * vh
    const startTrigger = vh * (1 - offset)
    const rangePixels = vh * range

    // How far past the start trigger the element top is
    const distancePast = startTrigger - rect.top

    if (distancePast <= 0) {
      setProgress(0)
      return
    }

    const p = Math.min(1, distancePast / rangePixels)
    setProgress(p)
  }, [offset, range])

  useEffect(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return { ref, progress }
}

/**
 * Tracks global scroll velocity for background effects
 */
export function useScrollVelocity() {
  const [velocity, setVelocity] = useState(0)
  const lastScrollY = useRef(0)
  const lastTime = useRef(Date.now())

  useEffect(() => {
    let raf: number

    const update = () => {
      const now = Date.now()
      const dt = Math.max(1, now - lastTime.current)
      const dy = window.scrollY - lastScrollY.current
      const v = Math.abs(dy) / dt

      // Smooth decay
      setVelocity(prev => prev * 0.9 + v * 0.1)

      lastScrollY.current = window.scrollY
      lastTime.current = now
      raf = requestAnimationFrame(update)
    }

    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [])

  return velocity
}

/**
 * Tracks normalized scroll position (0 = top, 1 = bottom of page)
 */
export function useGlobalScroll() {
  const [scrollY, setScrollY] = useState(0)
  const [normalized, setNormalized] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setScrollY(y)
      setNormalized(maxScroll > 0 ? y / maxScroll : 0)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { scrollY, normalized }
}
