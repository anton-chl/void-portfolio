import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FloatingGeometryProps {
  count?: number
  spread?: [number, number, number]
  depthRange?: [number, number]
  opacity?: number
  speed?: number
}

interface GeometryData {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  speed: number
  type: number
}

export function FloatingGeometry({
  count = 45,
  spread = [20, 15, 15],
  depthRange = [-3, -20],
  opacity = 0.6,
  speed = 1,
}: FloatingGeometryProps) {
  const groupRef = useRef<THREE.Group>(null)

  const geometries = useMemo<GeometryData[]>(() => {
    return Array.from({ length: count }).map(() => ({
      position: [
        (Math.random() - 0.5) * spread[0],
        (Math.random() - 0.5) * spread[1],
        depthRange[0] + Math.random() * (depthRange[1] - depthRange[0]),
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        0,
      ] as [number, number, number],
      scale: 0.08 + Math.random() * 0.4,
      speed: (0.15 + Math.random() * 0.4) * speed,
      type: Math.floor(Math.random() * 3),
    }))
  }, [count, spread, depthRange, speed])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    groupRef.current.children.forEach((child, i) => {
      if (!geometries[i]) return
      child.rotation.x += delta * geometries[i].speed * 0.4
      child.rotation.y += delta * geometries[i].speed * 0.6
      child.position.y +=
        Math.sin(state.clock.elapsedTime * geometries[i].speed * 0.4 + i) * 0.001
    })
  })

  return (
    <group ref={groupRef}>
      {geometries.map((props, i) => (
        <mesh
          key={i}
          position={props.position}
          rotation={props.rotation}
          scale={props.scale}
        >
          {props.type === 0 ? (
            <icosahedronGeometry args={[1, 0]} />
          ) : props.type === 1 ? (
            <tetrahedronGeometry args={[1, 0]} />
          ) : (
            <octahedronGeometry args={[1, 0]} />
          )}
          <meshStandardMaterial
            color={i % 5 === 0 ? '#1a1028' : '#12121a'}
            metalness={0.85}
            roughness={0.15}
            transparent
            opacity={opacity}
            wireframe={i % 4 === 0}
          />
        </mesh>
      ))}
    </group>
  )
}
