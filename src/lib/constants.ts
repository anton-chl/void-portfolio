export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const

export const DEVICE_TIERS = {
  LOW: 'low',
  MID: 'mid',
  HIGH: 'high',
} as const

export type DeviceTier = (typeof DEVICE_TIERS)[keyof typeof DEVICE_TIERS]

export const TIER_CONFIG = {
  low: {
    geometryCount: 0,
    sparkleCount: 100,
    dotTextStep: 6,
    enableHover: false,
    dpr: [1, 1] as [number, number],
  },
  mid: {
    geometryCount: 20,
    sparkleCount: 300,
    dotTextStep: 4,
    enableHover: true,
    dpr: [1, 1.5] as [number, number],
  },
  high: {
    geometryCount: 45,
    sparkleCount: 600,
    dotTextStep: 3,
    enableHover: true,
    dpr: [1, 1.5] as [number, number],
  },
} as const
