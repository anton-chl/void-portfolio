import { lazy, Suspense, Component, type ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '@/types'
import styles from './LatticePanel.module.css'

const PointCloudScene = lazy(() =>
  import('@/components/three/PointCloudScene').then(m => ({ default: m.PointCloudScene }))
)

// Error boundary so a failed chunk load (e.g. stale deploy, MIME-type error)
// doesn't crash the entire page — the panel just renders without the 3D scene.
class ChunkErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    return this.state.hasError ? null : this.props.children
  }
}

export function LatticePanel({ project }: { project: Project }) {
  return (
    <div className={styles.panel}>
      {/* 3D point cloud canvas — full width */}
      <div className={styles.canvas}>
        <ChunkErrorBoundary>
          <Suspense fallback={null}>
            <PointCloudScene
              url={project.plySrc ?? '/3dImage.lssnap'}
              style={{ width: '100%', height: '100%' }}
            />
          </Suspense>
        </ChunkErrorBoundary>
      </div>

      {/* Bottom gradient */}
      <div className={styles.gradient} aria-hidden />

      {/* Top-left drag hint */}
      <p className={styles.dragHint}>drag to rotate</p>

      {/* Top-right site link */}
      <a
        href="https://lattice.cx"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.siteLink}
      >
        lattice.cx <ArrowUpRight size={12} />
      </a>

      {/* Bottom-right collaborators */}
      {project.collaborators && project.collaborators.length > 0 && (
        <div className={styles.content}>
          <div className={styles.sidebar}>
            <div className={styles.collabSection}>
              <p className={styles.collabLabel}>Made with</p>
              <div className={styles.collabList}>
                {project.collaborators.map(c => (
                  <a
                    key={c.name}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.collabLink}
                  >
                    {c.name} <ArrowUpRight size={12} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
