import { motion } from 'framer-motion'
import { ease } from '@/lib/motion'
import type { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease } }}
    >
      {children}
    </motion.div>
  )
}
