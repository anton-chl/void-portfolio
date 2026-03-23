import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useMousePosition } from '@/hooks/useMousePosition'

interface ScrollParticleTextProps {
  text: string
  /** 0 = fully scattered, 1 = fully assembled */
  progress: number
  /** Y position in world space */
  yOffset?: number
  fontSize?: number
  dotStep?: number
  dotSize?: number
  scatterRadius?: number
  accentPurple?: boolean
  enableHover?: boolean
  /** When true, particles spiral inward instead of linearly interpolating */
  swirl?: boolean
  /** Canvas text alignment — defaults to 'center' */
  textAlign?: CanvasTextAlign
}

interface Particle {
  // Home position (where it forms the text)
  homeX: number
  homeY: number
  homeZ: number
  // Scatter position (where it drifts when disassembled)
  scatterX: number
  scatterY: number
  scatterZ: number
  // Current animated position
  x: number
  y: number
  z: number
  // Per-particle randomness
  randomOffset: number
  randomSpeed: number
  // Stagger: each particle has a slightly different assembly threshold
  assemblyDelay: number
  // Swirl: polar coords of scatter offset from home
  swirlR: number
  swirlTheta: number
  swirlThetaZ: number
}

export function ScrollParticleText({
  text,
  progress,
  yOffset = 0,
  fontSize = 90,
  dotStep = 4,
  dotSize = 0.005,
  scatterRadius = 4,
  swirl = false,
  textAlign = 'center' as CanvasTextAlign,
}: ScrollParticleTextProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const [fontLoaded, setFontLoaded] = useState(false)
  const progressRef = useRef(progress)
  progressRef.current = progress

  useEffect(() => {
    document.fonts.ready.then(() => setFontLoaded(true))
  }, [])

  const { positions } = useMemo(() => {
    if (!fontLoaded) return { positions: [] as Particle[] }

    const canvas = document.createElement('canvas')
    const lines = text.split('\n')
    const lineCount = lines.length
    const canvasScale = fontSize / 90
    const width = Math.ceil(1400 * canvasScale)
    const lineHeight = fontSize * 1.15
    const height = Math.ceil(Math.max(300 * canvasScale, lineCount * lineHeight + fontSize * 0.5))
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return { positions: [] as Particle[] }

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)

    ctx.font = `700 ${fontSize}px "Raleway", "Nasalization", "Array", sans-serif`
    ctx.textAlign = textAlign
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffffff'
    // For non-center alignment, measure the longest line and position so the
    // text block as a whole stays centered in the canvas (and thus in world space).
    let textX = width / 2
    if (textAlign !== 'center') {
      ctx.font = `700 ${fontSize}px "Raleway", "Nasalization", "Array", sans-serif`
      const maxLineWidth = Math.max(...lines.map(l => ctx.measureText(l).width))
      if (textAlign === 'right') {
        textX = (width + maxLineWidth) / 2
      } else {
        textX = (width - maxLineWidth) / 2
      }
    }
    const totalTextHeight = lineCount * lineHeight
    const startY = (height - totalTextHeight) / 2 + lineHeight / 2
    for (let l = 0; l < lineCount; l++) {
      ctx.fillText(lines[l], textX, startY + l * lineHeight)
    }

    const imageData = ctx.getImageData(0, 0, width, height).data
    const tempPositions: Particle[] = []
    const scale = 0.003

    for (let y = 0; y < height; y += dotStep) {
      for (let x = 0; x < width; x += dotStep) {
        const index = (y * width + x) * 4
        if (imageData[index] > 128) {
          const homeX = (x - width / 2) * scale
          const homeY = -(y - height / 2) * scale

          // Scatter position: random direction from home position
          const angle = Math.random() * Math.PI * 2
          const angleV = (Math.random() - 0.5) * Math.PI
          const dist = scatterRadius * (0.5 + Math.random() * 0.5)

          const scatterX = homeX + Math.cos(angle) * Math.cos(angleV) * dist
          const scatterY = homeY + Math.sin(angleV) * dist
          const scatterZ = Math.sin(angle) * Math.cos(angleV) * dist * 0.5

          // Swirl polar coords: offset from home in polar form
          const sdx = scatterX - homeX
          const sdy = scatterY - homeY
          const sdz = scatterZ
          const swirlR = Math.sqrt(sdx * sdx + sdy * sdy + sdz * sdz)
          const swirlTheta = Math.atan2(sdy, sdx)
          const swirlThetaZ = Math.atan2(sdz, Math.sqrt(sdx * sdx + sdy * sdy))

          // Assembly delay: particles at edges assemble slightly later for a ripple effect
          const distFromCenter = Math.sqrt(homeX * homeX + homeY * homeY)
          const maxDist = 2.5
          const assemblyDelay = (distFromCenter / maxDist) * 0.3

          tempPositions.push({
            homeX,
            homeY,
            homeZ: 0,
            scatterX,
            scatterY,
            scatterZ,
            x: scatterX,
            y: scatterY,
            z: scatterZ,
            randomOffset: Math.random() * Math.PI * 2,
            randomSpeed: 0.5 + Math.random() * 1.5,
            assemblyDelay,
            swirlR,
            swirlTheta,
            swirlThetaZ,
          })
        }
      }
    }
    return { positions: tempPositions }
  }, [text, fontLoaded, fontSize, dotStep, scatterRadius, textAlign])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const colorArray = useMemo(
    () => new Float32Array((positions?.length || 0) * 3),
    [positions]
  )

  const { viewport } = useThree()
  const mouseRef = useMousePosition()

  useFrame((state) => {
    if (!meshRef.current || positions.length === 0) return

    const time = state.clock.getElapsedTime()
    const p = progressRef.current
    const mouse = mouseRef.current
    const mx = (mouse.x * viewport.width) / 2
    const my = (mouse.y * viewport.height) / 2

    positions.forEach((particle, i) => {
      // Per-particle progress with stagger
      const particleP = Math.max(0, Math.min(1, (p - particle.assemblyDelay) / (1 - particle.assemblyDelay)))

      // Eased progress (ease-in-out cubic)
      const t = particleP < 0.5
        ? 4 * particleP * particleP * particleP
        : 1 - Math.pow(-2 * particleP + 2, 3) / 2

      // Interpolate between scatter and home
      let targetX: number, targetY: number, targetZ: number

      if (swirl) {
        // Spiral inward: shrink radius while rotating
        const currentR = particle.swirlR * (1 - t)
        const swirlRotation = (1 - t) * Math.PI * 2 // 1 full turn
        const theta = particle.swirlTheta + swirlRotation
        const flatR = currentR * Math.cos(particle.swirlThetaZ)
        targetX = particle.homeX + Math.cos(theta) * flatR
        targetY = particle.homeY + Math.sin(theta) * flatR + yOffset
        targetZ = currentR * Math.sin(particle.swirlThetaZ)
      } else {
        targetX = particle.scatterX + (particle.homeX - particle.scatterX) * t
        targetY = particle.scatterY + (particle.homeY - particle.scatterY) * t + yOffset
        targetZ = particle.scatterZ + (particle.homeZ - particle.scatterZ) * t
      }

      // When scattered, add gentle drift animation
      const drift = 1 - t
      const driftX = Math.sin(time * particle.randomSpeed * 0.3 + particle.randomOffset) * 0.15 * drift
      const driftY = Math.cos(time * particle.randomSpeed * 0.2 + particle.randomOffset * 1.3) * 0.1 * drift
      const driftZ = Math.sin(time * particle.randomSpeed * 0.25 + particle.randomOffset * 0.7) * 0.1 * drift

      // Smooth easing toward target
      particle.x += (targetX + driftX - particle.x) * 0.08
      particle.y += (targetY + driftY - particle.y) * 0.08
      particle.z += (targetZ + driftZ - particle.z) * 0.08

      dummy.position.set(particle.x, particle.y, particle.z)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)

      // Color: scattered = dim, assembled = bright
      let brightness = 0.08 + t * 0.35

      // Flowing gradient when assembled
      if (t > 0.3) {
        const wave = Math.sin(time * 0.8 + particle.homeX * 1.5) * 0.5 + 0.5
        brightness += wave * 0.15 * t
      }

      // Twinkle
      const twinkle = Math.sin(time * particle.randomSpeed * 2 + particle.randomOffset)
      if (twinkle > 0.93) {
        brightness += (1 - (1 - twinkle) * 14) * 0.6 * t
      }

      // Random bright spike
      if (Math.random() > 0.995) {
        brightness = 0.7 + t * 0.3
      }

      brightness = Math.max(0, Math.min(1, brightness))

      // Cursor proximity → lavender glow
      const cursorRadius = 1.2
      const dx = particle.x - mx
      const dy = particle.y - my
      const distSq = dx * dx + dy * dy
      let purpleMix = 0

      if (distSq < cursorRadius * cursorRadius && t > 0.3) {
        const dist = Math.sqrt(distSq)
        purpleMix = ((cursorRadius - dist) / cursorRadius)
        purpleMix = purpleMix * purpleMix // quadratic falloff for soft edge
        brightness = Math.min(1, brightness + purpleMix * 0.4) // brighten near cursor
      }

      // Lavender (more saturated)
      const lavR = 0.55
      const lavG = 0.35
      const lavB = 0.9

      colorArray[i * 3 + 0] = brightness * (1 - purpleMix) + lavR * brightness * purpleMix
      colorArray[i * 3 + 1] = brightness * (1 - purpleMix) + lavG * brightness * purpleMix
      colorArray[i * 3 + 2] = brightness * (1 - purpleMix) + lavB * brightness * purpleMix
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  })

  if (positions.length === 0) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]}>
      <sphereGeometry args={[dotSize, 6, 6]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={1} />
      <instancedBufferAttribute attach="instanceColor" args={[colorArray, 3]} />
    </instancedMesh>
  )
}
