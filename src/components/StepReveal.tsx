import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

const easeOut = [0.23, 1, 0.32, 1] as const

export function StepReveal({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion()
  return <motion.div className="step-reveal" initial={reduceMotion ? false : 'hidden'} animate="visible"
    variants={{ hidden: {}, visible: { transition: { delayChildren: 0.04, staggerChildren: 0.09 } } }}>
    {children}
  </motion.div>
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion()
  return <motion.div className={className} variants={{
    hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 14 },
    visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.38, ease: easeOut } },
  }}>{children}</motion.div>
}
