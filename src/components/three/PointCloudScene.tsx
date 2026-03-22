import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'

// ── .lssnap parser ──────────────────────────────────────────────────────────
interface Annotation {
  type: 'point' | 'circle' | 'freehand'
  positions: number[]
  radius?: number
  color?: [number, number, number]
}

interface LssnapData {
  vertexCount: number
  positions: Float32Array
  colors: Float32Array
  annotations: Annotation[]
}

function parseLssnap(buffer: ArrayBuffer): LssnapData {
  const view = new DataView(buffer)
  const magic = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2))
  const version = view.getUint8(3)
  if (magic !== 'LSS' || version !== 1) {
    throw new Error('Not a valid .lssnap file (magic: ' + magic + version + ')')
  }
  const vertexCount = view.getInt32(4, true)
  const annotJsonLen = view.getInt32(8, true)
  const positions = new Float32Array(vertexCount * 3)
  const colors = new Float32Array(vertexCount * 3)
  let offset = 16
  for (let i = 0; i < vertexCount; i++) {
    positions[i * 3] = view.getInt16(offset, true) / 1000.0
    positions[i * 3 + 1] = view.getInt16(offset + 2, true) / 1000.0
    positions[i * 3 + 2] = view.getInt16(offset + 4, true) / 1000.0
    colors[i * 3] = view.getUint8(offset + 6) / 255.0
    colors[i * 3 + 1] = view.getUint8(offset + 7) / 255.0
    colors[i * 3 + 2] = view.getUint8(offset + 8) / 255.0
    offset += 9
  }
  let annotations: Annotation[] = []
  if (annotJsonLen > 0) {
    try {
      const annotStr = new TextDecoder().decode(new Uint8Array(buffer, offset, annotJsonLen))
      annotations = JSON.parse(annotStr)
    } catch { /* ignore */ }
  }
  return { vertexCount, positions, colors, annotations }
}

function filterNoise(
  positions: Float32Array,
  colors: Float32Array,
  vertexCount: number,
  minNeighbors: number,
  voxelSize: number
): { positions: Float32Array; colors: Float32Array } {
  if (minNeighbors <= 0) return { positions, colors }
  const voxelMap = new Map<string, number>()
  for (let i = 0; i < vertexCount; i++) {
    const vx = Math.floor(positions[i * 3] / voxelSize)
    const vy = Math.floor(positions[i * 3 + 1] / voxelSize)
    const vz = Math.floor(positions[i * 3 + 2] / voxelSize)
    const key = `${vx},${vy},${vz}`
    voxelMap.set(key, (voxelMap.get(key) ?? 0) + 1)
  }
  const filtPos: number[] = []
  const filtCol: number[] = []
  for (let i = 0; i < vertexCount; i++) {
    const vx = Math.floor(positions[i * 3] / voxelSize)
    const vy = Math.floor(positions[i * 3 + 1] / voxelSize)
    const vz = Math.floor(positions[i * 3 + 2] / voxelSize)
    const count = voxelMap.get(`${vx},${vy},${vz}`) ?? 0
    if (count >= minNeighbors) {
      filtPos.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
      filtCol.push(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2])
    }
  }
  return { positions: new Float32Array(filtPos), colors: new Float32Array(filtCol) }
}

// ── Main export ─────────────────────────────────────────────────────────────
export function PointCloudScene({
  url,
  style,
}: {
  url: string
  style?: React.CSSProperties
}) {
  const mountRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<{
    renderer?: THREE.WebGLRenderer
    animId?: number
    controls?: TrackballControls
    autoRotating: boolean
    scene?: THREE.Scene
    camera?: THREE.PerspectiveCamera
    material?: THREE.ShaderMaterial
    pointCloud?: THREE.Points
    rawPositions?: Float32Array
    rawColors?: Float32Array
    rawVertexCount?: number
  }>({ autoRotating: true })

  const DEFAULT_POINT_SIZE = 4
  const DEFAULT_DENOISE = 3

  const [pointSize, setPointSize] = useState(DEFAULT_POINT_SIZE)
  const [noiseFilter, setNoiseFilter] = useState(DEFAULT_DENOISE)
  const [zoom, setZoom] = useState(1)

  const rebuildGeometry = (nf: number) => {
    const s = stateRef.current
    if (!s.rawPositions || !s.rawColors || s.rawVertexCount === undefined) return
    const { positions, colors } = filterNoise(s.rawPositions, s.rawColors, s.rawVertexCount, nf, 0.02)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    if (s.pointCloud && s.scene) {
      s.scene.remove(s.pointCloud)
      s.pointCloud.geometry.dispose()
    }
    const pc = new THREE.Points(geo, s.material)
    s.pointCloud = pc
    s.scene?.add(pc)
  }

  useEffect(() => {
    if (!mountRef.current || !wrapperRef.current) return
    const container = mountRef.current
    const s = stateRef.current

    const scene = new THREE.Scene()
    scene.background = null
    s.scene = scene

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.01, 100)
    camera.position.set(0, 1, 3)
    s.camera = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    s.renderer = renderer

    const controls = new TrackballControls(camera, renderer.domElement)
    controls.rotateSpeed = 2.5
    controls.noZoom = true
    controls.panSpeed = 0.8
    controls.dynamicDampingFactor = 0.15
    s.controls = controls

    scene.add(new THREE.AmbientLight(0xffffff, 0.8))

    const animate = () => {
      s.animId = requestAnimationFrame(animate)
      if (s.autoRotating && s.camera && s.controls) {
        const target = s.controls.target
        const pos = s.camera.position
        const dx = pos.x - target.x
        const dz = pos.z - target.z
        const angle = 0.0015
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        s.camera.position.x = target.x + dx * cos - dz * sin
        s.camera.position.z = target.z + dx * sin + dz * cos
      }
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
      controls.handleResize()
    }
    window.addEventListener('resize', onResize)

    // No wheel listener — zoom is controlled via the UI slider only

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status)
        return r.arrayBuffer()
      })
      .then((buffer) => {
        const data = parseLssnap(buffer)
        s.rawPositions = data.positions
        s.rawColors = data.colors
        s.rawVertexCount = data.vertexCount

        const mat = new THREE.ShaderMaterial({
          uniforms: { pointSize: { value: DEFAULT_POINT_SIZE } },
          vertexShader: `
            attribute vec3 color;
            varying vec3 vColor;
            uniform float pointSize;
            void main() {
              vColor = color;
              gl_PointSize = pointSize;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying vec3 vColor;
            void main() {
              vec2 c = gl_PointCoord - vec2(0.5);
              if (dot(c, c) > 0.25) discard;
              gl_FragColor = vec4(vColor, 1.0);
            }
          `,
        })
        s.material = mat

        const { positions: fp, colors: fc } = filterNoise(data.positions, data.colors, data.vertexCount, DEFAULT_DENOISE, 0.02)
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(fp, 3))
        geo.setAttribute('color', new THREE.BufferAttribute(fc, 3))
        const pc = new THREE.Points(geo, mat)
        s.pointCloud = pc
        scene.add(pc)

        geo.computeBoundingBox()
        const box = geo.boundingBox!
        const center = new THREE.Vector3()
        box.getCenter(center)
        const size = new THREE.Vector3()
        box.getSize(size)
        const maxDim = Math.max(size.x, size.y, size.z)
        controls.target.copy(center)
        camera.up.set(0, 0, 1)
        camera.position.set(center.x - maxDim * 0.24, center.y - maxDim * 1.45, center.z)
        camera.lookAt(center)
        controls.update()

        // Annotations
        const annGroup = new THREE.Group()
        for (const ann of data.annotations) {
          if (!ann.positions || ann.positions.length < 3) continue
          const r = ann.color ? ann.color[0] / 255 : 1
          const g = ann.color ? ann.color[1] / 255 : 0.4
          const b = ann.color ? ann.color[2] / 255 : 0.4
          const color = new THREE.Color(r, g, b)
          if (ann.type === 'point') {
            const radius = ann.radius && ann.radius > 0.01 ? ann.radius : 0.12
            const mesh = new THREE.Mesh(
              new THREE.SphereGeometry(radius * 0.3, 12, 8),
              new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 })
            )
            mesh.position.set(ann.positions[0], ann.positions[1], ann.positions[2])
            annGroup.add(mesh)
          } else if (ann.type === 'circle') {
            const radius = ann.radius && ann.radius > 0 ? ann.radius : 0.05
            const pts = Array.from({ length: 65 }, (_, i) => {
              const theta = (i / 64) * Math.PI * 2
              return new THREE.Vector3(
                ann.positions[0] + Math.cos(theta) * radius,
                ann.positions[1] + Math.sin(theta) * radius,
                ann.positions[2]
              )
            })
            annGroup.add(
              new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(pts),
                new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 })
              )
            )
          } else if (ann.type === 'freehand' && ann.positions.length >= 6) {
            const pts = []
            for (let i = 0; i < ann.positions.length; i += 3)
              pts.push(new THREE.Vector3(ann.positions[i], ann.positions[i + 1], ann.positions[i + 2]))
            annGroup.add(
              new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(pts),
                new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 })
              )
            )
          }
        }
        scene.add(annGroup)
      })
      .catch((err) => console.error('PointCloudScene:', err.message))

    return () => {
      window.removeEventListener('resize', onResize)
      if (s.animId) cancelAnimationFrame(s.animId)
      controls.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [url])

  useEffect(() => {
    if (stateRef.current.material) stateRef.current.material.uniforms.pointSize.value = pointSize
  }, [pointSize])

  useEffect(() => {
    rebuildGeometry(noiseFilter)
  }, [noiseFilter])

  useEffect(() => {
    const s = stateRef.current
    if (!s.camera || !s.controls) return
    const target = s.controls.target
    const dir = new THREE.Vector3().subVectors(s.camera.position, target).normalize()
    const baseDist = 2.5
    const dist = baseDist / zoom
    s.camera.position.copy(target).addScaledVector(dir, dist)
    s.camera.lookAt(target)
  }, [zoom])

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono, monospace)',
    fontSize: '0.6rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,1)',
    whiteSpace: 'nowrap',
  }

  const sliderStyle: React.CSSProperties = {
    width: '72px',
    accentColor: '#a78bfa',
    cursor: 'pointer',
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        outline: 'none',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* Interaction blocker strips */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '12.5%', zIndex: 1, pointerEvents: 'auto' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '12.5%', zIndex: 1, pointerEvents: 'auto' }} />
      <div style={{ position: 'absolute', top: '12.5%', left: 0, width: '15%', height: '75%', zIndex: 1, pointerEvents: 'auto' }} />
      <div style={{ position: 'absolute', top: '12.5%', right: 0, width: '15%', height: '75%', zIndex: 1, pointerEvents: 'auto' }} />

      {/* Control panel — right side */}
      <div style={{
        position: 'absolute',
        bottom: '220px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '10px 14px',
        background: 'rgba(10,10,15,0.35)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(167,139,250,0.2)',
        borderRadius: '4px',
        pointerEvents: 'auto',
        zIndex: 5,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={labelStyle}>Zoom&emsp;&emsp;&ensp;</span>
          <input type="range" min={0.2} max={5} step={0.1} value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))} style={sliderStyle} />
          <span style={{ ...labelStyle, opacity: 0.9, width: '24px' }}>{zoom.toFixed(1)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={labelStyle}>Point Size</span>
          <input type="range" min={1} max={8} step={0.5} value={pointSize}
            onChange={(e) => setPointSize(parseFloat(e.target.value))} style={sliderStyle} />
          <span style={{ ...labelStyle, opacity: 0.9, width: '24px' }}>{pointSize}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={labelStyle}>Denoise&nbsp;&nbsp;</span>
          <input type="range" min={0} max={8} step={1} value={noiseFilter}
            onChange={(e) => setNoiseFilter(parseInt(e.target.value))} style={sliderStyle} />
          <span style={{ ...labelStyle, opacity: 0.9, width: '24px' }}>{noiseFilter}</span>
        </div>
      </div>
    </div>
  )
}
