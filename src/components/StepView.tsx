import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, Mic, RotateCcw, X } from 'lucide-react'
import type { FillStep, LanguageStep, LessonStep, PracticeFiveStep, QuestionStep, UnjumbleStep, VocabularyStep } from '../flow'
import { objectives, writingPhrases, writingPrompts } from '../lesson'
import { normalizedAnswer, wordCount } from '../learning'
import { Recording } from './Recording'
import { TimedVideo } from './TimedVideo'
import { RevealItem, StepReveal } from './StepReveal'
import { ActivityCompletion } from './ActivityCompletion'

export type StepViewProps = {
  step: LessonStep
  answer: string
  onAnswer: (answer: string) => void
  submitted: boolean
  onSubmit: () => void
  onRetry: () => void
  skipped: boolean
  onSkip: () => void
  recording?: Blob
  onRecording: (blob?: Blob) => void
  progress: { answers: Record<string, string>; submitted: string[]; completed: string[]; skipped: string[]; recordedIds: string[] }
}

function PrimaryAction({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button className="primary-action" onClick={onClick} disabled={disabled}>{children} <ArrowRight size={18} /></button>
}

function Sequence({ label, current, total }: { label: string; current: number; total: number }) {
  return <div className="step-eyebrow"><span>{label}</span><span>{current} of {total}</span></div>
}

function useFeedbackVisibility(submitted: boolean) {
  const feedbackRef = useRef<HTMLDivElement>(null)
  const wasSubmitted = useRef(submitted)
  const reduceMotion = useReducedMotion()
  useLayoutEffect(() => {
    if (submitted && !wasSubmitted.current && feedbackRef.current) {
      const scroller = feedbackRef.current.closest<HTMLElement>('.learning-main')
      if (scroller) {
        const overflow = feedbackRef.current.getBoundingClientRect().bottom - scroller.getBoundingClientRect().bottom + 16
        if (overflow > 0) scroller.scrollTo({ top: scroller.scrollTop + overflow, behavior: reduceMotion ? 'instant' : 'smooth' })
      }
    }
    wasSubmitted.current = submitted
  }, [submitted, reduceMotion])
  return feedbackRef
}

function AnswerFeedback({ correct, answer, feedbackRef }: { correct: boolean; answer: string; feedbackRef: React.RefObject<HTMLDivElement | null> }) {
  return <div ref={feedbackRef} className={`answer-feedback ${correct ? 'is-correct' : 'is-incorrect'}`} role="status">{correct ? <Check size={18} aria-hidden="true" /> : <X size={18} aria-hidden="true" />}<span>{correct ? 'Correct!' : `Not quite. The correct answer is: ${answer}`}</span></div>
}

function Question({ step, answer, onAnswer, submitted, onSubmit, onRetry }: StepViewProps & { step: QuestionStep }) {
  const feedbackRef = useFeedbackVisibility(submitted)
  const chosen = answer === '' ? -1 : Number(answer)
  const correct = chosen === step.correct
  const label = step.id.startsWith('revision') ? 'Revision' : step.kind === 'match' ? 'Vocabulary matching' : step.kind === 'sort' ? 'Practice 4: sentence sorting' : step.title
  const title = step.id.startsWith('revision') ? 'Revision: Neighbour Complaints' : step.title
  return <div className="question-step"><RevealItem><Sequence label={label} current={step.sequence} total={step.total} /></RevealItem><RevealItem><p className="activity-heading">{title}</p><h1 className="question-prompt">{step.prompt}</h1><p className="step-instruction">{step.kind === 'match' ? 'Choose the matching definition.' : step.kind === 'sort' ? 'Choose the right group for this sentence.' : step.id.startsWith('revision') ? 'Choose the most appropriate response.' : 'Choose one answer.'}</p></RevealItem>
    <div className="option-list" role="group" aria-label={`Answers for ${step.prompt}`}>{step.options.map((option, index) => {
      const selected = chosen === index
      const showCorrect = submitted && index === step.correct
      const showWrong = submitted && selected && !correct
      return <RevealItem key={option}><button type="button" className={`option-button ${selected ? 'is-selected' : ''} ${showCorrect ? 'is-correct' : ''} ${showWrong ? 'is-incorrect' : ''}`} aria-pressed={selected} onClick={() => onAnswer(String(index))} disabled={submitted}><span className="option-marker">{String.fromCharCode(65 + index)}</span><span>{option}</span>{showCorrect && <Check size={19} aria-hidden="true" />}</button></RevealItem>
    })}</div>
    {submitted && <AnswerFeedback correct={correct} answer={step.options[step.correct]} feedbackRef={feedbackRef} />}
    {(!submitted || !correct) && <RevealItem><div className="step-actions">{!submitted
      ? <PrimaryAction onClick={onSubmit} disabled={chosen < 0}>Check answer</PrimaryAction>
      : <button className="text-action" onClick={onRetry}><RotateCcw size={16} /> Try again</button>}</div></RevealItem>}
  </div>
}

function FillQuestion({ step, answer, onAnswer, submitted, onSubmit, onRetry }: StepViewProps & { step: FillStep }) {
  const feedbackRef = useFeedbackVisibility(submitted)
  const correct = normalizedAnswer(answer) === step.answer
  return <div className="question-step"><RevealItem><Sequence label="Complete the sentence" current={step.sequence} total={step.total} /></RevealItem><RevealItem><p className="activity-heading">{step.title}</p><h1 className="question-prompt">{step.prompt}</h1></RevealItem><RevealItem><label className="text-answer">Missing word<input value={answer} onChange={event => onAnswer(event.target.value)} disabled={submitted} autoComplete="off" autoFocus /></label></RevealItem>
    {submitted && <AnswerFeedback correct={correct} answer={step.answer} feedbackRef={feedbackRef} />}
    {(!submitted || !correct) && <RevealItem><div className="step-actions">{!submitted
      ? <PrimaryAction onClick={onSubmit} disabled={!answer.trim()}>Check answer</PrimaryAction>
      : <button className="text-action" onClick={onRetry}><RotateCcw size={16} /> Try again</button>}</div></RevealItem>}
  </div>
}

function Vocabulary({ step }: { step: VocabularyStep }) {
  return <div className="vocabulary-step"><RevealItem><Sequence label="Let’s Learn Some New Words" current={step.sequence} total={step.total} /></RevealItem><div className="vocabulary-focus"><RevealItem><div className="vocab-topline">Word {step.sequence} of {step.total}</div><h1>{step.item.term}</h1></RevealItem><RevealItem><div className="vocab-definition"><span>Meaning</span><p>{step.item.answer}</p></div></RevealItem><RevealItem><div className="vocab-example"><span>Example</span><p>“{step.example}”</p></div></RevealItem></div></div>
}

function Language({ step }: { step: LanguageStep }) {
  return <div className="language-step"><RevealItem><Sequence label="New language: complaints and resolutions" current={step.sequence} total={step.total} /></RevealItem><RevealItem><h1>{step.group.title}</h1><p className="step-lead">Useful expressions from the original lesson.</p></RevealItem><RevealItem><ul className="phrase-list">{step.group.phrases.map(phrase => <li key={phrase}>{phrase}</li>)}</ul></RevealItem></div>
}

function Unjumble({ step, answer, onAnswer, submitted, onSubmit, onRetry }: StepViewProps & { step: UnjumbleStep }) {
  const feedbackRef = useFeedbackVisibility(submitted)
  const words = step.expression.split(' ')
  const chosen = answer ? answer.split(',').map(Number) : []
  const remaining = words.map((_, index) => index).reverse().filter(index => !chosen.includes(index))
  const correct = chosen.join(',') === words.map((_, index) => index).join(',')
  return <div className="unjumble-step"><RevealItem><Sequence label="Practice 3: put the words in order" current={step.sequence} total={step.total} /></RevealItem><RevealItem><h1>Build the complaint</h1><p className="step-lead">Choose the words in the right order. Select a word in your answer to remove it.</p></RevealItem><RevealItem><div className="word-answer" aria-label="Your sentence">{chosen.length ? chosen.map((index, position) => <button key={index} disabled={submitted} onClick={() => onAnswer(chosen.filter((_, i) => i !== position).join(','))}>{words[index]}</button>) : <span>Your sentence appears here</span>}</div><div className="word-bank" aria-label="Available words">{remaining.map(index => <button key={index} disabled={submitted} onClick={() => onAnswer([...chosen, index].join(','))}>{words[index]}</button>)}</div></RevealItem>
    {submitted && <AnswerFeedback correct={correct} answer={step.expression} feedbackRef={feedbackRef} />}
    {(!submitted || !correct) && <RevealItem><div className="step-actions">{!submitted
      ? <PrimaryAction onClick={onSubmit} disabled={chosen.length !== words.length}>Check sentence</PrimaryAction>
      : <button className="text-action" onClick={onRetry}><RotateCcw size={16} /> Try again</button>}</div></RevealItem>}
  </div>
}

function DialogueReview({ step, answer, onAnswer }: StepViewProps & { step: Extract<LessonStep, { kind: 'dialogue' }> }) {
  const index = Math.min(Math.max(Number(answer) || 0, 0), step.dialogue.length - 1)
  const line = step.dialogue[index]
  return <div className="dialogue-review"><RevealItem><Sequence label={step.title} current={index + 1} total={step.dialogue.length} /></RevealItem><RevealItem><h1>{step.title}</h1><p className="step-lead">{step.description}</p></RevealItem><RevealItem><div className="dialogue-focus"><span>{line.speaker}</span><p>{line.text}</p></div></RevealItem><RevealItem><div className="dialogue-navigation"><button className="secondary-action" onClick={() => onAnswer(String(index - 1))} disabled={index === 0}><ChevronLeft size={17} /> Previous line</button><span>{index + 1} / {step.dialogue.length}</span>{index < step.dialogue.length - 1 && <button className="secondary-action" onClick={() => onAnswer(String(index + 1))}>Next line <ChevronRight size={17} /></button>}</div></RevealItem></div>
}

function PracticeFive({ step, answer, onAnswer, skipped, onSkip }: StepViewProps & { step: PracticeFiveStep }) {
  const [expanded, setExpanded] = useState(false)
  const reduceMotion = useReducedMotion()
  const exampleId = `example-${step.id}`

  return <div className="practice-five-step">
    <RevealItem><Sequence label="Practice 5: polite restaurant requests" current={step.sequence} total={step.total} /></RevealItem>
    <RevealItem><p className="activity-heading">What would you say?</p><h1 className="scenario-prompt">{step.scenario}</h1></RevealItem>
    <RevealItem><label className="text-answer">Your polite response
      <textarea value={answer} onChange={event => onAnswer(event.target.value)}
        placeholder="Write a polite request in your own words…" rows={4} />
    </label></RevealItem>
    <RevealItem><div className="example-disclosure">
      <button type="button" className="example-toggle" aria-expanded={expanded}
        aria-controls={exampleId} onClick={() => setExpanded(value => !value)}>
        See an example response <ChevronDown size={17} className={expanded ? 'is-open' : ''} aria-hidden="true" />
      </button>
      <div id={exampleId}>
        <AnimatePresence initial={false}>
          {expanded && <motion.div className="example-reveal"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }}>
            <p>{step.example}</p>
          </motion.div>}
        </AnimatePresence>
      </div>
    </div></RevealItem>
    <p className="support-note">This practice is for self review. Your response is saved in this browser.</p>
    {!answer.trim() && <div className="step-actions"><button className="text-action" onClick={onSkip}>Skip this prompt</button></div>}
    {skipped && <p className="support-note" role="status">You can continue and return to this prompt later.</p>}
  </div>
}

function Writing({ answer, onAnswer }: Pick<StepViewProps, 'answer' | 'onAnswer'>) {
  const count = wordCount(answer)
  return <div className="writing-step"><RevealItem><div className="step-eyebrow">Writing <span>40–60 words</span></div></RevealItem><RevealItem><h1>Restaurant Complaint Email</h1><p className="step-lead">You had a problem at a restaurant last weekend. Write a short complaint email to the restaurant manager.</p></RevealItem><div className="writing-layout"><RevealItem className="writing-editor-slot"><div className="writing-editor"><label htmlFor="email-draft">Your email</label><textarea id="email-draft" value={answer} onChange={event => onAnswer(event.target.value)} placeholder="Write your complaint email here…" rows={11} /><div className={`word-meter ${count >= 40 && count <= 60 ? 'is-in-range' : ''}`} role="status"><span>{count < 40 ? `${40 - count} more words to reach the minimum` : count > 60 ? `${count - 60} words over the limit` : 'Within the 40–60 word limit'}</span><strong>{count} words</strong></div></div></RevealItem><RevealItem className="writing-guide-slot"><div className="writing-guide"><h2>Include</h2><ul>{writingPrompts.map(item => <li key={item}>{item}</li>)}</ul><h2>Useful expressions</h2><ul>{writingPhrases.map(item => <li key={item}>{item}</li>)}</ul></div></RevealItem></div></div>
}

function Intro({ step }: { step: Extract<LessonStep, { kind: 'intro' | 'speaking-intro' | 'section-complete' }> }) {
  return <div className={`intro-step intro-${step.kind}`}><RevealItem><div className="intro-symbol">{step.kind === 'speaking-intro' ? <Mic size={33} /> : step.kind === 'section-complete' ? <Check size={31} /> : <span className="table-symbol" aria-hidden="true">◎</span>}</div><div className="step-eyebrow">{step.kind === 'intro' ? 'A2 Advanced · Unit 4' : step.kind === 'speaking-intro' ? 'Section 0' : step.stage === 'revision' ? 'Revision' : 'Section complete'}</div></RevealItem><RevealItem><h1>{step.title}</h1></RevealItem><RevealItem><p className="step-lead">{step.description}</p></RevealItem>{step.kind === 'intro' && <RevealItem><div className="objective-summary"><span>In this lesson you will</span><ul>{objectives.map(item => <li key={item}>{item}</li>)}</ul></div></RevealItem>}</div>
}

function StepContent(props: StepViewProps) {
  const { step, answer, onAnswer } = props
  switch (step.kind) {
    case 'intro': case 'speaking-intro': case 'section-complete': return <Intro step={step} />
    case 'activity-complete': return <ActivityCompletion step={step} progress={props.progress} />
    case 'choice': case 'match': case 'sort': return <Question {...props} step={step} />
    case 'fill': return <FillQuestion {...props} step={step} />
    case 'recording': return <Recording prompt={step.prompt} sequence={step.sequence} total={step.total} blob={props.recording} onBlob={props.onRecording} typed={answer} onTyped={onAnswer} skipped={props.skipped} onSkip={props.onSkip} />
    case 'video': return <div className="video-step"><RevealItem><div className="step-eyebrow">{step.repeat ? 'Watch again' : 'Watch and listen'} <span>{step.video === 'pasta' ? 'Restaurant Complaints' : 'Food orders'}</span></div><h1>{step.title}</h1><p className="step-lead">{step.description}</p></RevealItem><RevealItem><TimedVideo video={step.video} onEnded={props.onSubmit} onUnavailable={props.onSkip} /></RevealItem>{props.submitted && <p className="support-note" role="status">Video complete. Continue when you’re ready.</p>}{props.skipped && <p className="support-note" role="status">The player is unavailable. Read the conversation above, then continue.</p>}</div>
    case 'vocabulary': return <Vocabulary step={step} />
    case 'dialogue': return <DialogueReview {...props} step={step} />
    case 'language': return <Language step={step} />
    case 'unjumble': return <Unjumble {...props} step={step} />
    case 'practice-five': return <PracticeFive key={step.id} {...props} step={step} />
    case 'writing': return <Writing answer={answer} onAnswer={onAnswer} />
    case 'reflection': return <div className="reflection-step"><RevealItem><div className="step-eyebrow">Reflection <span>Almost there</span></div></RevealItem><RevealItem><h1>What is a new word or expression you have learnt today?</h1></RevealItem><RevealItem><label className="text-answer">Your reflection<textarea value={answer} onChange={event => onAnswer(event.target.value)} placeholder="Write a word or expression you remember…" rows={5} /></label></RevealItem></div>
    case 'done': return <div className="done-step"><RevealItem><div className="done-check"><Check size={40} /></div><div className="step-eyebrow">Lesson complete</div></RevealItem><RevealItem><h1>Well done.</h1></RevealItem><RevealItem><p>You listened, spoke, practised, and wrote a restaurant complaint in English.</p><p className="thanks">Thanks</p></RevealItem></div>
  }
}

export function StepView(props: StepViewProps) {
  return <StepReveal><StepContent {...props} /></StepReveal>
}
