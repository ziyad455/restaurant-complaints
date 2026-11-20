import { motion, useReducedMotion } from 'motion/react'
import { revisionStage, sections, type StageId } from '../flow'

export function LessonProgress({ stage, completedCount, stepNumber, total }: {
  stage: StageId
  completedCount: number
  stepNumber: number
  total: number
}) {
  const reduceMotion = useReducedMotion()
  const current = stage === 'revision' ? revisionStage : sections[stage]

  return <div className="footer-progress">
    <div className="footer-progress-label">
      <span className="footer-section-long">{current.name}</span>
      <span className="footer-section-short">{current.shortName}</span>
      <span className="footer-progress-separator" aria-hidden="true">·</span>
      <span>Step {stepNumber} of {total}</span>
    </div>
    <div className="footer-progress-track" role="progressbar" aria-label="Overall lesson progress"
      aria-valuemin={0} aria-valuemax={total} aria-valuenow={completedCount}
      aria-valuetext={`${completedCount} of ${total} learning steps complete`}>
      <motion.div className="footer-progress-fill" initial={false}
        animate={{ scaleX: completedCount / total }}
        transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }} />
    </div>
  </div>
}
