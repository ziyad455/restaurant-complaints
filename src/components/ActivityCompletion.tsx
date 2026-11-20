import { activities, sections, steps, type ActivityCompleteStep, type FillStep, type LessonStep, type QuestionStep, type UnjumbleStep } from '../flow'
import { normalizedAnswer } from '../learning'
import { RevealItem } from './StepReveal'

type Progress = { answers: Record<string, string>; submitted: string[]; completed: string[]; skipped: string[]; recordedIds: string[] }
const isGraded = (step: LessonStep): step is QuestionStep | FillStep | UnjumbleStep => step.kind === 'choice' || step.kind === 'match' || step.kind === 'sort' || step.kind === 'fill' || step.kind === 'unjumble'

export function ActivityCompletion({ step, progress }: { step: ActivityCompleteStep; progress: Progress }) {
  const index = activities.findIndex(activity => activity.id === step.activityId)
  const activity = activities[index]
  const next = activities[index + 1]
  const activitySteps = activity.stepIds.map(id => steps.find(item => item.id === id)).filter(item => item !== undefined)
  const gradedSteps = activitySteps.filter(isGraded)
  const attempted = gradedSteps.filter(item => progress.submitted.includes(item.id))
  const correct = attempted.filter(item => {
    const answer = progress.answers[item.id] ?? ''
    if (item.kind === 'fill') return normalizedAnswer(answer) === item.answer
    if (item.kind === 'unjumble') return answer === item.expression.split(' ').map((_, position) => position).join(',')
    return Number(answer) === item.correct && answer !== ''
  }).length
  const completed = activitySteps.filter(item => progress.completed.includes(item.id)).length
  const recorded = activity.stepIds.filter(id => progress.recordedIds.includes(id)).length
  const preview = activity.type === 'graded' ? attempted.length === 0 : completed === 0 && recorded === 0 && !(activity.type === 'video' && progress.submitted.includes(activity.last))
  const sectionChange = next && next.stage !== activity.stage
  const nextTitle = sectionChange && next ? next.stage === 'revision' ? 'Revision' : `Section ${next.stage} — ${sections[next.stage].name}` : next?.title
  const feedback = activity.type === 'graded'
    ? attempted.length === gradedSteps.length
      ? correct === gradedSteps.length ? 'Excellent! You got every answer right.' : correct >= gradedSteps.length / 2 ? activity.message : 'Good practice! Review the activity to improve your understanding.'
      : `${attempted.length} of ${gradedSteps.length} answers submitted so far.`
    : activity.message

  return <div className="activity-completion">
    <RevealItem><div className="step-eyebrow">{sectionChange ? 'Section transition' : 'Activity complete'}</div><h1>{preview ? activity.id.endsWith('quiz') ? 'Quiz Preview' : `${activity.title} Preview` : activity.completionTitle}</h1></RevealItem>
    {activity.type === 'graded' ? <RevealItem><div className="activity-result">
      {preview ? <p>No results available in preview mode.</p> : <><strong>{correct} / {gradedSteps.length} Correct</strong>{attempted.length === gradedSteps.length && <span>{Math.round(correct / gradedSteps.length * 100)}%</span>}</>}
    </div></RevealItem> : <RevealItem><p className="step-lead">{preview ? 'No completion recorded in preview mode.' : activity.type === 'speaking' ? `${completed} discussion questions completed · ${recorded} recorded` : activity.type === 'vocabulary' ? `${completed} words explored` : activity.type === 'video' ? progress.submitted.includes(activity.last) ? 'Video watched' : progress.skipped.includes(activity.last) ? 'Video unavailable' : 'Video activity complete' : `${completed} learning ${completed === 1 ? 'step' : 'steps'} completed`}</p></RevealItem>}
    {!preview && <RevealItem><p className="step-lead">{feedback}</p></RevealItem>}
    {next && <RevealItem><div className="activity-next"><span>Up Next</span><h2>{nextTitle}</h2><p>{next.introduction}</p></div></RevealItem>}
  </div>
}
