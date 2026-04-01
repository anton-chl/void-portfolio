import { useRef, useEffect, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'
import { Mail, Github, Linkedin, ArrowUpRight } from 'lucide-react'
import { about, siteConfig } from '@/data/data'
import { fadeInUp } from '@/lib/motion'
import type { SectionScrollData } from '@/components/three/SceneManager'
import styles from './About.module.css'

interface AboutProps {
  onSectionData: (data: SectionScrollData[]) => void
}

function sectionToWorldY(element: HTMLElement): number {
  const rect = element.getBoundingClientRect()
  const vh = window.innerHeight
  const centerY = rect.top + rect.height * 0.15
  const normalized = -(centerY / vh - 0.5) * 2
  return normalized * 1.85
}

function computeProgress(rect: DOMRect, vh: number): number {
  const assembleStart = vh * 0.95
  const assembleEnd = vh * 0.75
  const dissolveStart = vh * -0.05
  const dissolveEnd = vh * -0.25

  if (rect.top > assembleStart) return 0
  if (rect.top > assembleEnd) return 1 - (rect.top - assembleEnd) / (assembleStart - assembleEnd)
  if (rect.top > dissolveStart) return 1
  if (rect.top > dissolveEnd) return (rect.top - dissolveEnd) / (dissolveStart - dissolveEnd)
  return 0
}

export function About({ onSectionData }: AboutProps) {
  const bioRef = useRef(null)
  const connectContentRef = useRef(null)
  const bioInView = useInView(bioRef, { once: true, margin: '-40px' })
  const connectInView = useInView(connectContentRef, { once: true, margin: '-60px' })

  // Particle text anchors
  const aboutAnchor = useRef<HTMLDivElement>(null)
  const connectAnchor = useRef<HTMLDivElement>(null)

  const updateSectionData = useCallback(() => {
    const vh = window.innerHeight
    const sections: SectionScrollData[] = []

    if (aboutAnchor.current) {
      sections.push({
        id: 'about-title',
        text: 'About Me',
        progress: computeProgress(aboutAnchor.current.getBoundingClientRect(), vh),
        yOffset: sectionToWorldY(aboutAnchor.current),
        fontSize: 140,
      })
    }

    if (connectAnchor.current) {
      sections.push({
        id: 'connect-title',
        text: 'My Digital Spaces',
        progress: computeProgress(connectAnchor.current.getBoundingClientRect(), vh),
        yOffset: sectionToWorldY(connectAnchor.current),
        fontSize: 150,
      })
    }

    onSectionData(sections)
  }, [onSectionData])

  useEffect(() => {
    let active = true
    updateSectionData()
    requestAnimationFrame(() => {
      if (!active) return
      updateSectionData()
      requestAnimationFrame(() => {
        if (!active) return
        updateSectionData()
      })
    })
    window.addEventListener('scroll', updateSectionData, { passive: true })
    window.addEventListener('resize', updateSectionData, { passive: true })
    return () => {
      active = false
      window.removeEventListener('scroll', updateSectionData)
      window.removeEventListener('resize', updateSectionData)
      onSectionData([])
    }
  }, [updateSectionData, onSectionData])

  return (
    <main className={styles.page}>
      {/* ===== ABOUT ME — particle title ===== */}
      <div ref={aboutAnchor} className={styles.particleAnchor} />
      <div className={styles.titleSpacer} />

      {/* Bio — sticky text left, tall image right */}
      <section className={styles.bioSection} ref={bioRef}>
        <div className={styles.container}>
          <div className={styles.bioGrid}>
            <motion.div
              className={styles.bioText}
              initial={{ opacity: 0, y: 16 }}
              animate={bioInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className={styles.bioHeading}>A brief intro,<br />who am I?</h2>
              {about.bio.map((paragraph, i) => (
                <p key={i} className={styles.bioBody}>
                  {paragraph}
                </p>
              ))}
              <a
                href="/Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.resumeLink}
              >
                View my resume
                <ArrowUpRight size={12} />
              </a>
            </motion.div>

            <motion.div
              className={styles.bioPhoto}
              initial={{ opacity: 0, y: 16 }}
              animate={bioInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src={about.photo}
                alt={siteConfig.name}
                className={styles.bioImage}
              />
              <span className={styles.photoCaption}>Me using Lattice :)</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== DIGITAL SPACES — particle title ===== */}
      <section className={styles.connectSection}>
        <div ref={connectAnchor} className={styles.particleAnchor} />
        <div className={styles.titleSpacerLarge} />

        <div className={styles.container} ref={connectContentRef}>
          <motion.div
            className={styles.connectContent}
            variants={fadeInUp}
            initial="hidden"
            animate={connectInView ? 'visible' : 'hidden'}
          >
            <div className={styles.socialLinks}>
              <a
                href={siteConfig.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <Linkedin size={18} />
                LinkedIn
                <ArrowUpRight size={14} />
              </a>
              <a
                href={siteConfig.github}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                <Github size={18} />
                GitHub
                <ArrowUpRight size={14} />
              </a>
              <a
                href={siteConfig.devpost}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                Devpost
                <ArrowUpRight size={14} />
              </a>
              <a href={`mailto:${siteConfig.email}`} className={styles.socialLink}>
                <Mail size={18} />
                {siteConfig.email}
                <ArrowUpRight size={14} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
