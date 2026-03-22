import { BackgroundParticles } from './BackgroundParticles'
import { CursorTrail } from './CursorTrail'
import { HeroScene } from './HeroScene'
import { ScrollParticleText } from './ScrollParticleText'
import { useDeviceCapability } from '@/hooks/useDeviceCapability'
import { TIER_CONFIG } from '@/lib/constants'

export interface SectionScrollData {
  id: string
  text: string
  progress: number
  yOffset: number
  fontSize?: number
}

interface SceneManagerProps {
  route: string
  heroProgress?: number
  scrollVelocity?: number
  sectionData?: SectionScrollData[]
}

export function SceneManager({
  route,
  heroProgress = 1,
  sectionData = [],
}: SceneManagerProps) {
  const tier = useDeviceCapability()
  const config = TIER_CONFIG[tier]

  const isHome = route === '/'
  const isProjects = route === '/projects'
  const isAbout = route === '/about'
  const isArt = route === '/art'

  const particleDensity = tier === 'low' ? 'low' : tier === 'mid' ? 'medium' : 'high'

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={1.2} color="#0a0812" />
      <pointLight
        position={[5, -3, -5]}
        intensity={0.4}
        color="#7c3aed"
        distance={30}
        decay={2}
      />

      {/* Interactive particle void */}
      <BackgroundParticles
        density={particleDensity}
        opacity={isArt ? 0.4 : 1}
      />

      {/* Cursor trail particles */}
      <CursorTrail />

      {/* Hero particle text (home page only) */}
      <HeroScene
        visible={isHome}
        heroProgress={heroProgress}
        enableHover={config.enableHover}
        dotStep={config.dotTextStep}
      />

      {/* Scroll-driven section headings (home + projects) */}
      {(isHome || isProjects || isAbout) && sectionData.map((section) => (
        <ScrollParticleText
          key={section.id}
          text={section.text}
          progress={section.progress}
          yOffset={section.yOffset}
          fontSize={section.fontSize || 90}
          dotStep={config.dotTextStep + 1}
          dotSize={0.004}
          scatterRadius={3}
          accentPurple={true}
        />
      ))}
    </>
  )
}
