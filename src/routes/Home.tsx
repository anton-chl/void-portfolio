import { useRef, useEffect, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { featuredProjects } from '@/data/projects'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { fadeInUp } from '@/lib/motion'
import { LatticePanel } from '@/components/ui/LatticePanel'
import type { SectionScrollData } from '@/components/three/SceneManager'
import styles from './Home.module.css'

interface HomeProps {
  onHeroProgress: (progress: number) => void
  onSectionData: (data: SectionScrollData[]) => void
}

function sectionToWorldY(element: HTMLElement): number {
  const rect = element.getBoundingClientRect()
  const vh = window.innerHeight
  const centerY = rect.top + rect.height * 0.15
  const normalized = -(centerY / vh - 0.5) * 2
  return normalized * 1.85
}

export function Home({ onHeroProgress, onSectionData }: HomeProps) {
  const heroRef = useRef<HTMLDivElement>(null)

  const lattice = useScrollProgress<HTMLDivElement>({ offset: 0.1, range: 0.4 })

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const vh = window.innerHeight
      const p = Math.max(0, 1 - scrollY / (vh * 0.6))
      onHeroProgress(p)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [onHeroProgress])

  const updateSectionData = useCallback(() => {
    const sections: SectionScrollData[] = []

    if (lattice.ref.current) {
      // Custom progress: assemble as anchor enters viewport, dissolve as it leaves top
      const rect = lattice.ref.current.getBoundingClientRect()
      const vh = window.innerHeight
      const assembleStart = vh * 0.9   // start assembling when anchor at 90% of viewport
      const assembleEnd = vh * 0.4     // fully assembled at 40%
      const dissolveStart = vh * 0.15  // start dissolving at 15%
      const dissolveEnd = vh * -0.15   // fully dissolved when above viewport

      let lProgress = 0
      if (rect.top > assembleStart) {
        lProgress = 0
      } else if (rect.top > assembleEnd) {
        lProgress = 1 - (rect.top - assembleEnd) / (assembleStart - assembleEnd)
      } else if (rect.top > dissolveStart) {
        lProgress = 1
      } else if (rect.top > dissolveEnd) {
        lProgress = (rect.top - dissolveEnd) / (dissolveStart - dissolveEnd)
      } else {
        lProgress = 0
      }

      sections.push({
        id: 'lattice',
        text: 'Lattice',
        progress: lProgress,
        yOffset: sectionToWorldY(lattice.ref.current),
        fontSize: 130,
      })
    }

    onSectionData(sections)
  }, [lattice.progress, lattice.ref, onSectionData])

  useEffect(() => {
    updateSectionData()
    window.addEventListener('scroll', updateSectionData, { passive: true })
    return () => window.removeEventListener('scroll', updateSectionData)
  }, [updateSectionData])

  const projectsLinkRef = useRef(null)
  const projectsLinkInView = useInView(projectsLinkRef, { once: true, margin: '-100px' })

  return (
    <main>
      {/* ===== HERO ===== */}
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroContent} />

        <motion.p
          className={styles.projectsIntro}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          What I'm working on right now
        </motion.p>

        <motion.div
          className={styles.scrollIndicator}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <ArrowDown size={14} strokeWidth={1} />
          </motion.div>
        </motion.div>

        <div className={styles.heroVignette} />
      </section>

      {/* ===== FEATURED PROJECTS ===== */}
      <section className={styles.section}>
        {/* Lattice — particle title anchor + spacer + immersive panel */}
        <div ref={lattice.ref} className={styles.particleHeadingAnchor} />
        {featuredProjects.find(p => p.slug === 'lattice') && (
          <LatticePanel project={featuredProjects.find(p => p.slug === 'lattice')!} />
        )}

      </section>

      {/* ===== PROJECTS LINK ===== */}
      <section className={styles.projectsLinkSection} ref={projectsLinkRef}>
        <motion.div
          className={styles.projectsLinkContent}
          variants={fadeInUp}
          initial="hidden"
          animate={projectsLinkInView ? 'visible' : 'hidden'}
        >
          <p className={styles.projectsLinkText}>A selection of my previous projects</p>
          <Link to="/projects" className={styles.projectsLinkAnchor}>
            View projects <ArrowRight size={14} />
          </Link>
        </motion.div>
      </section>
    </main>
  )
}
