import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useMousePosition } from '@/hooks/useMousePosition'

interface BackgroundParticlesProps {
  density?: 'low' | 'medium' | 'high'
  opacity?: number
}

const COUNTS = {
  low: 1000,
  medium: 2000,
  high: 3500,
}

interface DotState {
  homeX: number
  homeY: number
  homeZ: number
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  brightness: number
  randomOffset: number
}

export function BackgroundParticles({
  density = 'medium',
  opacity = 1,
}: BackgroundParticlesProps) {
  const count = COUNTS[density]
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const { viewport } = useThree()
  const mouseRef = useMousePosition()

  const dots = useMemo<DotState[]>(() => {
    return Array.from({ length: count }, () => {
      const x = (Math.random() - 0.5) * 24
      const y = (Math.random() - 0.5) * 18
      const z = -0.5 - Math.random() * 10
      return {
        homeX: x, homeY: y, homeZ: z,
        x, y, z,
        vx: 0, vy: 0, vz: 0,
        brightness: 0.08 + Math.random() * 0.25,
        randomOffset: Math.random() * Math.PI * 2,
      }
    })
  }, [count])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const colorArray = useMemo(() => new Float32Array(count * 3), [count])

  useFrame((state, delta) => {
    if (!meshRef.current) return

    const time = state.clock.getElapsedTime()
    const mouse = mouseRef.current

    const mx = (mouse.x * viewport.width) / 2
    const my = (mouse.y * viewport.height) / 2

    const cursorRadiusSq = 3.5 * 3.5 // squared to avoid sqrt
    const cursorRadius = 3.5
    const pushStrength = 0.55
    const gravity = 3.5
    const damping = 0.88

    for (let i = 0; i < count; i++) {
      const dot = dots[i]

      // Cursor displacement — use squared distance for early exit
      const dx = dot.x - mx
      const dy = dot.y - my
      const distSq = dx * dx + dy * dy

      if (distSq < cursorRadiusSq && distSq > 0.000001) {
        const dist = Math.sqrt(distSq)
        const force = ((cursorRadius - dist) / cursorRadius) * pushStrength
        const invDist = 1 / dist
        dot.vx += dx * invDist * force
        dot.vy += dy * invDist * force
        dot.vz += (Math.random() - 0.5) * force * 0.3
      }

      // Spring back to home
      dot.vx += (dot.homeX - dot.x) * gravity * delta
      dot.vy += (dot.homeY - dot.y) * gravity * delta
      dot.vz += (dot.homeZ - dot.z) * gravity * delta

      dot.vx *= damping
      dot.vy *= damping
      dot.vz *= damping

      dot.x += dot.vx * delta
      dot.y += dot.vy * delta
      dot.z += dot.vz * delta

      dummy.position.set(dot.x, dot.y, dot.z)
      const depthScale = 0.35 + (dot.z + 10.5) * 0.065 // linear approx, no function call
      dummy.scale.setScalar(depthScale > 0 ? depthScale : 0.1)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)

      // Color — simple twinkle, skip displacement glow for perf
      const twinkle = Math.sin(time * 0.5 + dot.randomOffset * 3) * 0.5 + 0.5
      const b = dot.brightness * (0.7 + twinkle * 0.3) * opacity

      colorArray[i * 3] = b
      colorArray[i * 3 + 1] = b
      colorArray[i * 3 + 2] = b
    }

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.012, 4, 4]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={1} />
      <instancedBufferAttribute attach="instanceColor" args={[colorArray, 3]} />
    </instancedMesh>
  )
}
