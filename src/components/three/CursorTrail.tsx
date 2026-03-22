import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useMousePosition } from '@/hooks/useMousePosition'

const TRAIL_COUNT = 40

interface TrailParticle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  life: number
  maxLife: number
  active: boolean
  orange: boolean
}

export function CursorTrail() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const { viewport } = useThree()
  const mouseRef = useMousePosition()
  const prevMouse = useRef<{ x: number; y: number } | null>(null)
  const spawnAccum = useRef(0)
  const nextSlot = useRef(0)

  const particles = useMemo<TrailParticle[]>(() => {
    return Array.from({ length: TRAIL_COUNT }, () => ({
      x: 0, y: 0, z: 0,
      vx: 0, vy: 0, vz: 0,
      life: 0,
      maxLife: 1,
      active: false,
      orange: Math.random() < 0.3,
    }))
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const colorArray = useMemo(() => new Float32Array(TRAIL_COUNT * 3), [])

  useFrame((_, delta) => {
    if (!meshRef.current) return

    const mouse = mouseRef.current
    const mx = (mouse.x * viewport.width) / 2
    const my = (mouse.y * viewport.height) / 2

    // Initialize prevMouse on first frame
    if (prevMouse.current === null) {
      prevMouse.current = { x: mx, y: my }
    }

    const mdx = mx - prevMouse.current.x
    const mdy = my - prevMouse.current.y
    const speed = Math.sqrt(mdx * mdx + mdy * mdy)
    prevMouse.current.x = mx
    prevMouse.current.y = my

    // Spawn trail particles based on cursor movement
    spawnAccum.current = Math.min(spawnAccum.current + speed * 8, 2)
    while (spawnAccum.current >= 1) {
      spawnAccum.current -= 1
      const p = particles[nextSlot.current]
      // Interpolate spawn position along movement to avoid clumping
      const lerpT = Math.random()
      p.x = mx - mdx * lerpT + (Math.random() - 0.5) * 0.06
      p.y = my - mdy * lerpT + (Math.random() - 0.5) * 0.06
      p.z = (Math.random() - 0.5) * 0.2
      p.vx = -mdx * 0.2 + (Math.random() - 0.5) * 0.3
      p.vy = -mdy * 0.2 + (Math.random() - 0.5) * 0.3
      p.vz = (Math.random() - 0.5) * 0.1
      p.maxLife = 0.5 + Math.random() * 0.5
      p.life = p.maxLife
      p.active = true
      p.orange = Math.random() < 0.3
      nextSlot.current = (nextSlot.current + 1) % TRAIL_COUNT
    }

    for (let i = 0; i < TRAIL_COUNT; i++) {
      const p = particles[i]

      if (!p.active || p.life <= 0) {
        p.active = false
        dummy.position.set(0, 0, -100)
        dummy.scale.setScalar(0)
        dummy.updateMatrix()
        meshRef.current!.setMatrixAt(i, dummy.matrix)
        colorArray[i * 3] = 0
        colorArray[i * 3 + 1] = 0
        colorArray[i * 3 + 2] = 0
        continue
      }

      p.life -= delta

      p.vx *= 0.96
      p.vy *= 0.96
      p.vz *= 0.96
      p.x += p.vx * delta
      p.y += p.vy * delta
      p.z += p.vz * delta

      const t = Math.max(0, p.life / p.maxLife)

      dummy.position.set(p.x, p.y, p.z)
      dummy.scale.setScalar(t * 0.6 + 0.2)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)

      // Color with fade: lavender or light orange
      const alpha = t * t
      if (p.orange) {
        colorArray[i * 3 + 0] = 0.95 * alpha
        colorArray[i * 3 + 1] = 0.65 * alpha
        colorArray[i * 3 + 2] = 0.3 * alpha
      } else {
        colorArray[i * 3 + 0] = 0.62 * alpha
        colorArray[i * 3 + 1] = 0.5 * alpha
        colorArray[i * 3 + 2] = 0.9 * alpha
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, TRAIL_COUNT]}>
      <sphereGeometry args={[0.012, 4, 4]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={1} />
      <instancedBufferAttribute attach="instanceColor" args={[colorArray, 3]} />
    </instancedMesh>
  )
}
