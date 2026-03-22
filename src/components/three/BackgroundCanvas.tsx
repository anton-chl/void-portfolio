import { Canvas } from '@react-three/fiber'
import { Component, type ReactNode } from 'react'
import { SceneManager, type SectionScrollData } from './SceneManager'
import { useDeviceCapability } from '@/hooks/useDeviceCapability'
import { TIER_CONFIG } from '@/lib/constants'
import styles from './BackgroundCanvas.module.css'

class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}

interface BackgroundCanvasProps {
  route: string
  enablePointer?: boolean
  heroProgress?: number
  scrollVelocity?: number
  sectionData?: SectionScrollData[]
}

function CanvasInner({
  route,
  heroProgress,
  scrollVelocity,
  sectionData,
}: Omit<BackgroundCanvasProps, 'enablePointer'>) {
  const tier = useDeviceCapability()
  const config = TIER_CONFIG[tier]

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={config.dpr}
      gl={{ antialias: false, alpha: false }}
      style={{ pointerEvents: 'inherit' }}
      fallback={<div className={styles.fallback} />}
    >
      <color attach="background" args={['#000000']} />
      <SceneManager
        route={route}
        heroProgress={heroProgress}
        scrollVelocity={scrollVelocity}
        sectionData={sectionData}
      />
    </Canvas>
  )
}

export function BackgroundCanvas({
  route,
  enablePointer = false,
  heroProgress,
  scrollVelocity,
  sectionData,
}: BackgroundCanvasProps) {
  return (
    <div
      className={styles.container}
      style={{ pointerEvents: enablePointer ? 'auto' : 'none' }}
    >
      <CanvasErrorBoundary fallback={<div className={styles.fallback} />}>
        <CanvasInner
          route={route}
          heroProgress={heroProgress}
          scrollVelocity={scrollVelocity}
          sectionData={sectionData}
        />
      </CanvasErrorBoundary>
    </div>
  )
}
