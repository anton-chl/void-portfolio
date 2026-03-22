import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Artwork } from '@/types'
import styles from './Lightbox.module.css'

interface LightboxProps {
  artwork: Artwork | null
  artworks: Artwork[]
  onClose: () => void
  onNavigate: (artwork: Artwork) => void
}

export function Lightbox({ artwork, artworks, onClose, onNavigate }: LightboxProps) {
  const currentIndex = artwork ? artworks.findIndex(a => a.id === artwork.id) : -1

  const goNext = useCallback(() => {
    if (currentIndex < artworks.length - 1) {
      onNavigate(artworks[currentIndex + 1])
    }
  }, [currentIndex, artworks, onNavigate])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(artworks[currentIndex - 1])
    }
  }, [currentIndex, artworks, onNavigate])

  useEffect(() => {
    if (!artwork) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }

    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [artwork, onClose, goNext, goPrev])

  // Preload adjacent images
  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < artworks.length - 1) {
      const next = artworks[currentIndex + 1]
      if (next.imageSrc) {
        const img = new Image()
        img.src = next.imageSrc
      }
    }
  }, [currentIndex, artworks])

  return (
    <AnimatePresence>
      {artwork && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close lightbox"
          >
            <X size={20} />
          </button>

          {currentIndex > 0 && (
            <button
              className={`${styles.navBtn} ${styles.navPrev}`}
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              aria-label="Previous artwork"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {currentIndex < artworks.length - 1 && (
            <button
              className={`${styles.navBtn} ${styles.navNext}`}
              onClick={(e) => { e.stopPropagation(); goNext() }}
              aria-label="Next artwork"
            >
              <ChevronRight size={24} />
            </button>
          )}

          <motion.div
            className={styles.content}
            onClick={(e) => e.stopPropagation()}
            key={artwork.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.imageContainer}>
              <img
                src={artwork.imageSrc}
                alt={artwork.title}
                className={styles.image}
              />
            </div>

            <div className={styles.caption}>
              <h3 className={styles.title}>{artwork.title}</h3>
              <span className={styles.meta}>
                {artwork.medium}&ensp;.&ensp;{artwork.year}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
