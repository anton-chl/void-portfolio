import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ScrollParticleText } from './ScrollParticleText'

interface HeroSceneProps {
  visible: boolean
  /** 1 = fully assembled, 0 = dissolved */
  heroProgress: number
  text?: string
  enableHover?: boolean
  dotStep?: number
  fontSize?: number
}

export function HeroScene({
  visible,
  heroProgress,
  text = 'ANTON LEE',
  enableHover = true,
  dotStep = 4,
  fontSize = 360,
}: HeroSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const opacityRef = useRef(visible ? 1 : 0)
  const { size, viewport } = useThree()
  const isMobile = size.width < 768

  // Intro animation: start scattered, wait 0.5s, then animate in
  const [introReady, setIntroReady] = useState(false)
  const [introProgress, setIntroProgress] = useState(0)
  const introDone = introProgress >= 1

  useEffect(() => {
    const timer = setTimeout(() => setIntroReady(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const introProgressRef = useRef(0)

  useFrame((_, delta) => {
    const target = visible ? 1 : 0
    opacityRef.current = THREE.MathUtils.lerp(opacityRef.current, target, delta * 4)
    if (groupRef.current) {
      groupRef.current.visible = opacityRef.current > 0.01
    }

    // Smoothly ramp intro progress from 0 → 1
    if (introReady && introProgressRef.current < 1) {
      introProgressRef.current = Math.min(1, introProgressRef.current + delta * 0.8)
      setIntroProgress(introProgressRef.current)
    }
  })

  const effectiveProgress = introDone ? heroProgress : introProgress
  const hoverEnabled = enableHover && heroProgress > 0.8

  // Mobile: two-line right-aligned text, auto-sized to fit ~85% viewport width
  if (isMobile) {
    const longestLine = 'ANTON' // 5 chars — the wider line
    const targetWorldWidth = viewport.width * 0.75
    const mobileFontSize = Math.round(targetWorldWidth / (longestLine.length * 0.7 * 0.003))
    return (
      <group ref={groupRef}>
        <ScrollParticleText
          text={'ANTON\nLEE'}
          progress={effectiveProgress}
          yOffset={0}
          fontSize={mobileFontSize}
          dotStep={dotStep}
          dotSize={0.005}
          scatterRadius={5}
          enableHover={hoverEnabled}
          accentPurple={true}
          swirl={true}
          textAlign="right"
        />
      </group>
    )
  }

  return (
    <group ref={groupRef}>
      <ScrollParticleText
        text={text}
        progress={effectiveProgress}
        yOffset={0}
        fontSize={fontSize}
        dotStep={dotStep}
        dotSize={0.005}
        scatterRadius={5}
        enableHover={hoverEnabled}
        accentPurple={true}
        swirl={true}
      />
    </group>
  )
}
