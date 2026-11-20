import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, ArrowRight, Expand, Minimize, Moon, Sun } from 'lucide-react'
import { LessonProgress } from './components/LessonProgress'
import { StepView } from './components/StepView'
import { activities, countableSteps, steps, type LessonStep } from './flow'
import { wordCount } from './learning'
import { loadYouTubeApi } from './youtube'

type LessonState = { currentId: string; answers: Record<string, string>; submitted: string[]; completed: string[]; skipped: string[] }
const storageKey = 'boston-common-complaints-guided-v1'
const previewMode = import.meta.env.DEV && import.meta.env.VITE_PREVIEW_MODE === 'true'
const validIds = new Set(steps.map(step => step.id))
type NavigationDirection = 1 | -1
type TransitionContext = { direction: NavigationDirection; reduceMotion: boolean }
const stepVariants = {
  enter: ({ direction, reduceMotion }: TransitionContext) => ({ opacity: reduceMotion ? 1 : 0, transform: `translateX(${reduceMotion ? 0 : direction * 18}px)` }),
  center: ({ reduceMotion }: TransitionContext) => ({ opacity: 1, transform: 'translateX(0px)', transition: { duration: reduceMotion ? 0 : 0.3, ease: [0.23, 1, 0.32, 1] as const } }),
  exit: ({ direction, reduceMotion }: TransitionContext) => ({ opacity: reduceMotion ? 1 : 0, transform: `translateX(${reduceMotion ? 0 : direction * -16}px)`, transition: { duration: reduceMotion ? 0 : 0.2, ease: [0.23, 1, 0.32, 1] as const } }),
}

function initialState(): LessonState {
  const fallback: LessonState = { currentId: steps[0].id, answers: {}, submitted: [], completed: [], skipped: [] }
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const data = JSON.parse(raw) as Partial<LessonState>
      return {
        currentId: data.currentId === 'speaking-intro' ? 'speaking-0' : data.currentId && validIds.has(data.currentId) ? data.currentId : fallback.currentId,
        answers: data.answers && typeof data.answers === 'object' ? Object.fromEntries(Object.entries(data.answers).filter((entry): entry is [string, string] => typeof entry[1] === 'string')) : {},
        submitted: Array.isArray(data.submitted) ? data.submitted.filter(id => validIds.has(id)) : [],
        completed: Array.isArray(data.completed) ? data.completed.filter(id => validIds.has(id)) : [],
        skipped: Array.isArray(data.skipped) ? data.skipped.filter(id => validIds.has(id)) : [],
      }
    }
    const previous = localStorage.getItem('boston-common-complaints-v1')
    if (previous) {
      const data = JSON.parse(previous) as { answers?: Record<string, string> }
      return { ...fallback, answers: { writing: data.answers?.writing ?? '', reflection: data.answers?.reflection ?? '' } }
    }
  } catch { /* A fresh lesson still works when storage is unavailable. */ }
  return fallback
}

function readTheme(): 'light' | 'dark' {
  try { return localStorage.getItem('boston-theme') === 'dark' ? 'dark' : 'light' } catch { return 'light' }
}

function canAdvance(step: LessonStep, state: LessonState, hasRecording: boolean): boolean {
  if (state.completed.includes(step.id)) return true
  if (step.kind === 'done') return false
  if (step.requirement === 'answer') return state.submitted.includes(step.id)
  if (step.requirement === 'record-or-skip') return hasRecording || Boolean(state.answers[step.id]?.trim()) || state.skipped.includes(step.id)
  if (step.requirement === 'writing') { const count = wordCount(state.answers[step.id] ?? ''); return count >= 40 && count <= 60 }
  if (step.kind === 'video') return state.submitted.includes(step.id) || state.skipped.includes(step.id)
  if (step.kind === 'dialogue') return Number(state.answers[step.id] ?? 0) >= step.dialogue.length - 1
  if (step.kind === 'practice-five') return Boolean(state.answers[step.id]?.trim()) || state.skipped.includes(step.id)
  return true
}

function advanceLabel(step: LessonStep): string {
  switch (step.kind) {
    case 'intro':
    case 'speaking-intro':
    case 'section-complete':
    case 'video':
      return step.action
    case 'activity-complete':
      return activities[activities.findIndex(activity => activity.id === step.activityId) + 1]?.startLabel ?? 'Continue'
    case 'choice':
    case 'match':
    case 'sort':
      return step.sequence === step.total ? 'Continue' : 'Next question'
    case 'fill':
    case 'recording':
      return 'Next question'
    case 'vocabulary':
      return step.sequence === step.total
        ? step.stage === 1 ? 'Watch again' : 'Review the dialogue'
        : 'Next word'
    case 'dialogue':
      return 'Continue'
    case 'language':
      return step.sequence === step.total ? 'Start practice' : 'Next language pattern'
    case 'unjumble':
      return step.sequence === step.total ? 'Continue to sorting' : 'Next sentence'
    case 'practice-five':
      return step.sequence === step.total ? 'Continue to writing' : 'Next scenario'
    case 'writing':
      return 'Finish writing'
    case 'reflection':
      return 'Finish lesson'
    case 'done':
      return ''
  }
}

function shortAdvanceLabel(label: string): string {
  if (label.startsWith('Next')) return 'Next'
  if (label.startsWith('Finish')) return 'Finish'
  if (label.startsWith('Start') || label.startsWith('Let’s start')) return 'Start'
  if (label.startsWith('Begin')) return 'Begin'
  if (label.startsWith('Watch')) return 'Watch'
  if (label.startsWith('Review')) return 'Review'
  return 'Next'
}

export default function App() {
  const [lesson, setLesson] = useState<LessonState>(initialState)
  const [recordings, setRecordings] = useState<Record<string, Blob>>({})
  const [theme, setTheme] = useState<'light' | 'dark'>(readTheme)
  const [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement))
  const [direction, setDirection] = useState<NavigationDirection>(1)
  const [transitioning, setTransitioning] = useState(false)
  const transitioningRef = useRef(false)
  const currentStepIdRef = useRef(lesson.currentId)
  currentStepIdRef.current = lesson.currentId
  const reduceMotion = useReducedMotion()
  const mainRef = useRef<HTMLElement>(null)
  const index = Math.max(0, steps.findIndex(step => step.id === lesson.currentId))
  const step = steps[index]
  const completed = new Set(lesson.completed)
  const completedCount = countableSteps.filter(item => completed.has(item.id)).length
  const showAdvance = step.kind !== 'done' && (previewMode || canAdvance(step, lesson, Boolean(recordings[step.id])))
  const nextLabel = previewMode ? 'Next' : advanceLabel(step)

  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(lesson)) } catch { /* Answers remain available for this visit. */ } }, [lesson])
  useEffect(() => { document.documentElement.dataset.theme = theme; try { localStorage.setItem('boston-theme', theme) } catch { /* Theme still works for this visit. */ } }, [theme])
  useEffect(() => {
    const update = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [])
  useLayoutEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' })
    mainRef.current?.focus({ preventScroll: true })
    if (reduceMotion && transitioningRef.current) {
      transitioningRef.current = false
      setTransitioning(false)
    }
  }, [step.id])
  useEffect(() => {
    if (steps[index + 1]?.kind === 'video') void loadYouTubeApi().catch(() => {})
  }, [index])

  function answer(value: string) {
    setLesson(current => ({ ...current, answers: { ...current.answers, [step.id]: value }, completed: step.requirement === 'answer' || step.requirement === 'writing' ? current.completed.filter(id => id !== step.id) : current.completed }))
  }
  function submit() { setLesson(current => ({ ...current, submitted: [...new Set([...current.submitted, step.id])] })) }
  function retry() { setLesson(current => ({ ...current, answers: { ...current.answers, [step.id]: '' }, submitted: current.submitted.filter(id => id !== step.id), completed: current.completed.filter(id => id !== step.id) })) }
  function skip() { setLesson(current => ({ ...current, skipped: [...new Set([...current.skipped, step.id])] })) }
  function record(blob?: Blob) {
    setRecordings(current => {
      const next = { ...current }
      if (blob) next[step.id] = blob
      else delete next[step.id]
      return next
    })
  }
  function startTransition(nextDirection: NavigationDirection) {
    const scrollTop = mainRef.current?.scrollTop ?? 0
    if (scrollTop > 0) {
      const outgoingPanel = mainRef.current?.querySelector<HTMLElement>('.step-panel')
      if (outgoingPanel) outgoingPanel.style.translate = `0 -${scrollTop}px`
    }
    transitioningRef.current = true
    setTransitioning(true)
    setDirection(nextDirection)
  }
  function next() {
    if (transitioningRef.current || index >= steps.length - 1 || (!previewMode && !canAdvance(step, lesson, Boolean(recordings[step.id])))) return
    startTransition(1)
    setLesson(current => ({ ...current, completed: previewMode || step.kind === 'activity-complete' ? current.completed : [...new Set([...current.completed, step.id])], currentId: steps[index + 1].id }))
  }
  function back() {
    if (transitioningRef.current || index === 0) return
    startTransition(-1)
    setLesson(current => ({ ...current, currentId: steps[index - 1].id }))
  }
  async function toggleFullscreen() { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen() } catch { /* Some browsers or contexts deny fullscreen. */ } }

  return <div className="guided-app">
    <header className="app-header">
      <a className="brand" href="https://bostonenglishcenter.com/" target="_blank" rel="noreferrer"
        aria-label="Boston English Center website">
        <img src="/assets/boston-logo.webp" alt="" width="41" height="41" />
        <span>Boston English Center</span>
      </a>
      <div className="lesson-identity">A2 Advanced <span /> Unit 4: Common Complaints</div>
      <div className="header-actions">
        <button className="icon-button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}>
          {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
        </button>
        <button className="icon-button fullscreen-button" onClick={toggleFullscreen}
          aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
          {fullscreen ? <Minimize size={19} /> : <Expand size={19} />}
        </button>
      </div>
    </header>
    <main ref={mainRef} className="learning-main" id="main-content" tabIndex={-1}>
      <AnimatePresence initial={false} mode="popLayout" custom={{ direction, reduceMotion }}>
        <motion.div key={step.id} className={`step-panel kind-${step.kind}`} custom={{ direction, reduceMotion }}
          variants={stepVariants} initial="enter" animate="center" exit="exit"
          onAnimationComplete={() => {
            if (step.id === currentStepIdRef.current && transitioningRef.current) {
              transitioningRef.current = false
              setTransitioning(false)
            }
          }}>
          <StepView step={step} answer={lesson.answers[step.id] ?? ''}
            progress={{ answers: lesson.answers, submitted: lesson.submitted, completed: lesson.completed, skipped: lesson.skipped, recordedIds: Object.keys(recordings) }}
            onAnswer={answer} submitted={lesson.submitted.includes(step.id)}
            onSubmit={submit} onRetry={retry}
            skipped={lesson.skipped.includes(step.id)} onSkip={skip}
            recording={recordings[step.id]} onRecording={record} />
        </motion.div>
      </AnimatePresence>
    </main>
    <footer className="learning-footer">
      <button className="back-button" onClick={back} disabled={index === 0 || transitioning}><ArrowLeft size={18} /> Back</button>
      <LessonProgress stage={step.stage} completedCount={completedCount}
        stepNumber={Math.min(steps.slice(0, index + 1).filter(item => item.kind !== 'activity-complete' && item.kind !== 'done').length, countableSteps.length)} total={countableSteps.length} />
      <div className="footer-action-slot">
        {showAdvance && <button className="primary-action footer-action" onClick={next} disabled={transitioning} aria-label={nextLabel}>
          <span className="footer-action-long">{nextLabel}</span>
          <span className="footer-action-short" aria-hidden="true">{shortAdvanceLabel(nextLabel)}</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>}
      </div>
    </footer>
  </div>
}
