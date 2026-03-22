import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleDotTextProps {
  text?: string
  fontSize?: number
  dotStep?: number
  dotSize?: number
  enableHover?: boolean
  scale?: number
  accentPurple?: boolean
}

interface Particle {
  baseX: number
  baseY: number
  baseZ: number
  x: number
  y: number
  z: number
  randomOffset: number
  randomSpeed: number
}

export function ParticleDotText({
  text = 'lattice',
  fontSize = 120,
  dotStep = 4,
  dotSize = 0.005,
  enableHover = true,
  scale = 0.0035,
  accentPurple = true,
}: ParticleDotTextProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const [fontLoaded, setFontLoaded] = useState(false)

  useEffect(() => {
    document.fonts.ready.then(() => setFontLoaded(true))
  }, [])

  const { positions } = useMemo(() => {
    if (!fontLoaded) return { positions: [] as Particle[] }

    const canvas = document.createElement('canvas')
    const width = 1400
    const height = 400
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return { positions: [] as Particle[] }

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)

    ctx.font = `${fontSize}px "Array", "Outfit", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(text, width / 2, height / 2)

    const imageData = ctx.getImageData(0, 0, width, height).data
    const tempPositions: Particle[] = []

    for (let y = 0; y < height; y += dotStep) {
      for (let x = 0; x < width; x += dotStep) {
        const index = (y * width + x) * 4
        const r = imageData[index]
        if (r > 128) {
          const posX = (x - width / 2) * scale
          const posY = -(y - height / 2) * scale
          tempPositions.push({
            baseX: posX,
            baseY: posY,
            baseZ: 0,
            x: posX,
            y: posY,
            z: 0,
            randomOffset: Math.random() * Math.PI * 2,
            randomSpeed: 0.5 + Math.random() * 1.5,
          })
        }
      }
    }
    return { positions: tempPositions }
  }, [text, fontLoaded, fontSize, dotStep, scale])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const colorArray = useMemo(() => new Float32Array((positions?.length || 0) * 3), [positions])

  const { viewport } = useThree()

  useFrame((state) => {
    if (!meshRef.current || positions.length === 0) return
    const mouse = state.pointer
    const time = state.clock.getElapsedTime()

    const mx = (mouse.x * viewport.width) / 2
    const my = (mouse.y * viewport.height) / 2

    const gradientSweep = time * 0.8

    positions.forEach((particle, i) => {
      const dx = particle.baseX - mx
      const dy = particle.baseY - my
      const dist = Math.sqrt(dx * dx + dy * dy)

      const maxDist = 1.0
      const isHovered = enableHover && dist < maxDist

      particle.x += (particle.baseX - particle.x) * 0.1
      particle.y += (particle.baseY - particle.y) * 0.1
      particle.z += (particle.baseZ - particle.z) * 0.1

      dummy.position.set(particle.x, particle.y, particle.z)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)

      // Color: flowing gradient with purple accents
      const localPhase = particle.baseX * 1.5
      const wave = Math.sin(gradientSweep + localPhase)

      let baseBrightness = 0.2 + ((wave + 1) / 2) * 0.3

      // Twinkle
      const twinkle = Math.sin(time * particle.randomSpeed * 2.0 + particle.randomOffset)
      if (twinkle > 0.95) {
        baseBrightness += (1.0 - (1.0 - twinkle) * 20.0) * 0.8
      }
      if (Math.random() > 0.99) {
        baseBrightness = 1.0
      }

      // Hover interaction
      if (isHovered) {
        const force = (maxDist - dist) / maxDist
        if (Math.random() < force * 0.8) {
          baseBrightness = 0.8 + Math.random() * 0.2
        }
      }

      baseBrightness = Math.max(0, Math.min(1, baseBrightness))

      if (accentPurple) {
        // Purple-tinted color flow
        const purpleWave = Math.sin(time * 0.3 + particle.baseX * 2.0) * 0.5 + 0.5
        const purpleIntensity = purpleWave * 0.15

        let r = baseBrightness
        let g = baseBrightness * (1 - purpleIntensity * 0.3)
        let b = baseBrightness + purpleIntensity * 0.2

        if (isHovered) {
          const force = (maxDist - dist) / maxDist
          r = baseBrightness * (1 - force * 0.1)
          g = baseBrightness * (1 - force * 0.2)
          b = Math.min(1, baseBrightness + force * 0.3)
        }

        colorArray[i * 3 + 0] = Math.min(1, r)
        colorArray[i * 3 + 1] = Math.min(1, g)
        colorArray[i * 3 + 2] = Math.min(1, b)
      } else {
        colorArray[i * 3 + 0] = baseBrightness
        colorArray[i * 3 + 1] = baseBrightness
        colorArray[i * 3 + 2] = baseBrightness
      }
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
      <meshBasicMaterial toneMapped={false} />
      <instancedBufferAttribute attach="instanceColor" args={[colorArray, 3]} />
    </instancedMesh>
  )
}
