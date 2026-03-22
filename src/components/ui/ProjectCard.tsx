import { motion } from 'framer-motion'
import { ExternalLink, Github } from 'lucide-react'
import { staggerItem } from '@/lib/motion'
import type { Project } from '@/types'
import styles from './ProjectCard.module.css'

interface ProjectCardProps {
  project: Project
  featured?: boolean
}

export function ProjectCard({ project, featured = false }: ProjectCardProps) {
  return (
    <motion.article
      className={`${styles.card} ${featured ? styles.featured : ''}`}
      variants={staggerItem}
    >
      <div
        className={styles.thumb}
        style={{
          backgroundColor: project.thumbnailColor,
          backgroundImage: project.imageSrc ? `url(${project.imageSrc})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!project.imageSrc && (
          <span className={styles.thumbGlyph}>
            {project.title.charAt(0)}
          </span>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{project.title}</h3>
          <div className={styles.links}>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.iconLink}
                aria-label="Live site"
              >
                <ExternalLink size={14} />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.iconLink}
                aria-label="Source code"
              >
                <Github size={14} />
              </a>
            )}
          </div>
        </div>

        {project.award && (
          <span className={styles.award}>{project.award}</span>
        )}
        <p className={styles.description}>{project.description}</p>

        <div className={styles.meta}>
          {project.tags.map((tag, i) => (
            <span key={i}>
              {tag}{i < project.tags.length - 1 && <span className={styles.dot}>&ensp;.&ensp;</span>}
            </span>
          ))}
          <span className={styles.dot}>&ensp;.&ensp;</span>
          <span>{project.year}</span>
        </div>
      </div>
    </motion.article>
  )
}
