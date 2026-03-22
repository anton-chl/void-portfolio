import { useMemo } from 'react'
import type { DeviceTier } from '@/lib/constants'

export function useDeviceCapability(): DeviceTier {
  return useMemo(() => {
    if (typeof window === 'undefined') return 'mid'

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const isSmallScreen = window.innerWidth < 768
    const isMobile = isTouchDevice && isSmallScreen

    if (isMobile) return 'low'

    const cores = navigator.hardwareConcurrency || 4
    const memory = (navigator as { deviceMemory?: number }).deviceMemory

    if (cores < 4 || (memory !== undefined && memory < 4)) return 'low'
    if (cores >= 8) return 'high'

    return 'mid'
  }, [])
}
