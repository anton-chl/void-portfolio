import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Lightbox } from '@/components/ui/Lightbox'
import { artworks } from '@/data/artworks'
import { staggerContainer, staggerItem } from '@/lib/motion'
import type { Artwork } from '@/types'
import styles from './Art.module.css'

export function Art() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <main className={styles.page}>
      <section className={styles.gallery} ref={ref}>
        <div className={styles.container}>
          <motion.div
            className={styles.masonryGrid}
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            {artworks.map((artwork) => (
              <motion.div
                key={artwork.id}
                className={styles.artworkCell}
                variants={staggerItem}
                style={{
                  gridRowEnd: `span ${artwork.aspectRatio === 'landscape' ? 12 : artwork.aspectRatio === 'square' ? 16 : 20}`,
                }}
                onClick={() => setSelectedArtwork(artwork)}
              >
                <div className={styles.artworkThumb}>
                  <img
                    src={artwork.imageSrc}
                    alt={artwork.title}
                    loading="lazy"
                    className={styles.artworkImage}
                  />
                  <div className={styles.artworkOverlay}>
                    <span className={styles.overlayTitle}>{artwork.title}</span>
                    <span className={styles.overlayMeta}>
                      {artwork.medium}&ensp;.&ensp;{artwork.year}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Lightbox
        artwork={selectedArtwork}
        artworks={artworks}
        onClose={() => setSelectedArtwork(null)}
        onNavigate={setSelectedArtwork}
      />
    </main>
  )
}
