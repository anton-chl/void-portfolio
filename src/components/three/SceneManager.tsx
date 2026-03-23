import { useThree } from '@react-three/fiber'
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
  const { size, viewport } = useThree()

  const isHome = route === '/'
  const isProjects = route === '/projects'
  const isAbout = route === '/about'
  const isArt = route === '/art'

  const particleDensity = tier === 'low' ? 'low' : tier === 'mid' ? 'medium' : 'high'

  // Scale particle text font sizes based on viewport width so text fits on mobile
  const fontScale = Math.min(1, size.width / 1200)

  // On mobile, auto-compute fontSize per section so each title fills ~85% of the
  // visible 3D viewport width, regardless of text length or screen size.
  // textWorldWidth ≈ textLen * fontSize * avgCharWidth * worldScale
  const computeSectionFontSize = (text: string, baseFontSize: number) => {
    if (size.width >= 768) {
      return Math.round(baseFontSize * fontScale)
    }
    const avgCharWidth = 0.55
    const worldScale = 0.003
    const targetWorldWidth = viewport.width * 0.85
    const idealFontSize = targetWorldWidth / (text.length * avgCharWidth * worldScale)
    return Math.round(Math.min(baseFontSize, idealFontSize))
  }

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
        fontSize={Math.round(360 * fontScale)}
      />

      {/* Scroll-driven section headings (home + projects) */}
      {(isHome || isProjects || isAbout) && sectionData.map((section) => (
        <ScrollParticleText
          key={section.id}
          text={section.text}
          progress={section.progress}
          yOffset={section.yOffset}
          fontSize={computeSectionFontSize(section.text, section.fontSize || 90)}
          dotStep={config.dotTextStep + 1}
          dotSize={0.004}
          scatterRadius={3}
          accentPurple={true}
        />
      ))}
    </>
  )
}
