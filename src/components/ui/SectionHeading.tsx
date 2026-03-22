import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { fadeInUp } from '@/lib/motion'
import styles from './SectionHeading.module.css'

interface SectionHeadingProps {
  label: string
  title: string
  accent?: string
}

export function SectionHeading({ label, title, accent }: SectionHeadingProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      className={styles.container}
      variants={fadeInUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      <span className={styles.label}>{label}</span>
      <h2 className={styles.title}>
        {accent ? (
          <>
            {title.split(accent)[0]}
            <span className={styles.accent}>{accent}</span>
            {title.split(accent)[1]}
          </>
        ) : (
          title
        )}
      </h2>
    </motion.div>
  )
}
