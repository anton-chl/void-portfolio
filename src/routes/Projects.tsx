import { useRef, useEffect, useCallback, createRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowUpRight, ExternalLink, Github, Play } from 'lucide-react'
import { projects } from '@/data/projects'
import { fadeInUp } from '@/lib/motion'
import type { SectionScrollData } from '@/components/three/SceneManager'
import styles from './Projects.module.css'

interface ProjectsProps {
  onSectionData: (data: SectionScrollData[]) => void
}

function sectionToWorldY(element: HTMLElement): number {
  const rect = element.getBoundingClientRect()
  const vh = window.innerHeight
  const centerY = rect.top + rect.height * 0.15
  const normalized = -(centerY / vh - 0.5) * 2
  return normalized * 1.85
}

export function Projects({ onSectionData }: ProjectsProps) {
  // Create a ref for each project's particle anchor
  const anchorRefs = useRef(
    projects.map(() => createRef<HTMLDivElement>())
  )

  const updateSectionData = useCallback(() => {
    const vh = window.innerHeight
    const sections: SectionScrollData[] = []

    anchorRefs.current.forEach((ref, i) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const assembleStart = vh * 0.95
      const assembleEnd = vh * 0.75
      const dissolveStart = vh * -0.05
      const dissolveEnd = vh * -0.25

      let progress = 0
      if (rect.top > assembleStart) {
        progress = 0
      } else if (rect.top > assembleEnd) {
        progress = 1 - (rect.top - assembleEnd) / (assembleStart - assembleEnd)
      } else if (rect.top > dissolveStart) {
        progress = 1
      } else if (rect.top > dissolveEnd) {
        progress = (rect.top - dissolveEnd) / (dissolveStart - dissolveEnd)
      } else {
        progress = 0
      }

      sections.push({
        id: `project-${projects[i].id}`,
        text: projects[i].title,
        progress,
        yOffset: sectionToWorldY(ref.current),
        fontSize: 70,
      })
    })

    onSectionData(sections)
  }, [onSectionData])

  useEffect(() => {
    updateSectionData()
    window.addEventListener('scroll', updateSectionData, { passive: true })
    window.addEventListener('resize', updateSectionData, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateSectionData)
      window.removeEventListener('resize', updateSectionData)
    }
  }, [updateSectionData])

  // Clear section data when unmounting
  useEffect(() => {
    return () => onSectionData([])
  }, [onSectionData])

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {projects.map((project, i) => (
          <ProjectSection
            key={project.id}
            project={project}
            anchorRef={anchorRefs.current[i]}
          />
        ))}

        <motion.div
          className={styles.devpostLink}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <a
            href="https://devpost.com/cx"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.devpostAnchor}
          >
            See all my projects on Devpost <ArrowUpRight size={14} />
          </a>
        </motion.div>
      </div>
    </main>
  )
}

interface ProjectSectionProps {
  project: (typeof projects)[number]
  anchorRef: React.RefObject<HTMLDivElement | null>
}

function ProjectSection({ project, anchorRef }: ProjectSectionProps) {
  const contentRef = useRef(null)
  const inView = useInView(contentRef, { once: true, margin: '-60px' })

  return (
    <section className={styles.projectSection}>
      {/* Invisible anchor for particle text position tracking */}
      <div ref={anchorRef} className={styles.particleAnchor} />

      {/* Spacer for where the particle title renders in the 3D canvas */}
      <div className={styles.titleSpacer} />

      {/* DOM content below the particle title */}
      <motion.div
        ref={contentRef}
        className={styles.projectContent}
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.body}>
          <div className={styles.info}>
            {project.award && (
              <span className={styles.award}>{project.award}</span>
            )}

            <p className={styles.description}>{project.description}</p>

            <div className={styles.meta}>
              {project.tags.map((tag, j) => (
                <span key={j}>
                  {tag}{j < project.tags.length - 1 && <span className={styles.dot}>&ensp;.&ensp;</span>}
                </span>
              ))}
              <span className={styles.dot}>&ensp;.&ensp;</span>
              <span>{project.year}</span>
            </div>
          </div>

          <div className={styles.links}>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                <ExternalLink size={13} />
                Devpost
              </a>
            )}
            {project.videoUrl && (
              <a
                href={project.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                <Play size={13} />
                Demo
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                <Github size={13} />
                Source
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
