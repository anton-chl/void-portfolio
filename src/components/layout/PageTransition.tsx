import { useEffect } from 'react'
import { motion, usePresence } from 'framer-motion'
import { pageTransition } from '@/lib/motion'
import type { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const [isPresent, safeToRemove] = usePresence()

  // Safety valve: if the exit animation hasn't completed within 500ms
  // (it should take 250ms), force-signal removal so AnimatePresence
  // can mount the incoming route. This prevents mode="wait" from
  // getting permanently stuck after tab backgrounding / bfcache restore.
  useEffect(() => {
    if (!isPresent) {
      const timer = setTimeout(() => {
        safeToRemove?.()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isPresent, safeToRemove])

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}
