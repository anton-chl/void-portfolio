import { useEffect } from 'react'
import { motion, usePresence } from 'framer-motion'
import { pageTransition } from '@/lib/motion'
import type { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const [isPresent, safeToRemove] = usePresence()

  // Safety valve: force-remove after 600ms if exit animation stalls.
  useEffect(() => {
    if (!isPresent) {
      const timer = setTimeout(() => {
        safeToRemove?.()
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [isPresent, safeToRemove])

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      // When exiting, pull out of layout flow so the entering page
      // takes its natural position and there's no vertical stacking.
      style={
        !isPresent
          ? { position: 'absolute', top: 0, left: 0, right: 0 }
          : undefined
      }
    >
      {children}
    </motion.div>
  )
}
