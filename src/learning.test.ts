import { describe, expect, it } from 'vitest'
import { activities, countableSteps, sections, steps } from './flow'
import { neighbourPairs, orderDialogue, pastaDialogue, sortingItems } from './lesson'
import { normalizedAnswer, wordCount } from './learning'
import { orderWordStarts, pastaWordStarts } from './videoTimings'
import { buildTimedLines } from './components/TimedVideo'

describe('guided lesson data', () => {
  it('has four sections and unique step identifiers', () => {
    expect(sections).toHaveLength(4)
    expect(new Set(steps.map(step => step.id)).size).toBe(steps.length)
    expect(countableSteps).toHaveLength(steps.filter(step => step.kind !== 'done' && step.kind !== 'activity-complete').length)
    expect(steps.at(-1)?.kind).toBe('done')
  })

  it('inserts one transition at each activity boundary without counting it as learning progress', () => {
    expect(activities.flatMap(activity => activity.stepIds)).toEqual(countableSteps.map(step => step.id))
    for (const activity of activities) {
      if (!activity.completionId) continue
      const last = steps.findIndex(step => step.id === activity.last)
      expect(steps[last + 1]).toMatchObject({ id: activity.completionId, kind: 'activity-complete', activityId: activity.id })
    }
    expect(activities.find(activity => activity.id === 'pasta-quiz')?.stepIds).toHaveLength(7)
  })

  it('places standalone revision before the speaking-only Section 0', () => {
    const revisionEnd = steps.findIndex(step => step.id === 'revision-complete')
    const speakingStart = steps.findIndex(step => step.id === 'speaking-0')
    const sectionOneStart = steps.findIndex(step => step.id === 'pasta-video')
    expect(revisionEnd).toBeGreaterThan(0)
    expect(speakingStart).toBe(revisionEnd + 1)
    expect(steps.slice(0, speakingStart).every(step => step.stage === 'revision')).toBe(true)
    expect(steps.slice(speakingStart, sectionOneStart).every(step => step.stage === 0)).toBe(true)
    expect(steps.slice(sectionOneStart).filter(step => step.stage === 1)[0]?.id).toBe('pasta-video')
    expect(sections[0].name).toBe('Restaurant Speaking Warm-Up')
  })

  it('keeps the original revision responses paired with their complaints', () => {
    const questions = steps.filter(step => /^revision-\d+$/.test(step.id))
    expect(questions).toHaveLength(5)
    questions.forEach((step, index) => {
      if (step.kind !== 'choice') throw new Error('Revision must be a choice step')
      expect(step.prompt).toBe(neighbourPairs[index].complaint)
      expect(step.options[step.correct]).toBe(neighbourPairs[index].response)
    })
  })

  it('provides valid answers for focused matching and sorting questions', () => {
    for (const step of steps) {
      if (step.kind === 'choice' || step.kind === 'match' || step.kind === 'sort') {
        expect(step.correct).toBeGreaterThanOrEqual(0)
        expect(step.correct).toBeLessThan(step.options.length)
      }
    }
    expect(steps.filter(step => step.kind === 'sort')).toHaveLength(sortingItems.length)
  })

  it('aligns every spoken transcript word to an ordered timestamp', () => {
    for (const [dialogue, starts] of [[pastaDialogue, pastaWordStarts], [orderDialogue, orderWordStarts]] as const) {
      const lines = buildTimedLines(dialogue, starts)
      expect(lines).toHaveLength(dialogue.length)
      expect(lines.flatMap(line => line.words)).toHaveLength(starts.length)
      expect(starts.every((start, index) => index === 0 || start >= starts[index - 1])).toBe(true)
      expect(lines.every(line => line.end > line.start)).toBe(true)
    }
  })
})

describe('answer helpers', () => {
  it('counts words without counting whitespace', () => {
    expect(wordCount('')).toBe(0)
    expect(wordCount('  \n  ')).toBe(0)
    expect(wordCount('I visited  your\nrestaurant  on Saturday.')).toBe(6)
  })

  it('ignores capitalization and outer whitespace in fill answers', () => {
    expect(normalizedAnswer('  COLD  ')).toBe('cold')
  })
})
