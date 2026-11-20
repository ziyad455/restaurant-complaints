import { complaintExpressions, discussion, languageGroups, matchingDefinitions, matchingWords, neighbourPairs, orderDialogue, pastaQuestions, practiceFiveScenarios, sortingGroups, sortingItems, steakDialogue, steakQuestions, vocabulary1, vocabulary2, type DialogueLine } from './lesson'

export type SectionId = 0 | 1 | 2 | 3
export type StageId = 'revision' | SectionId
export const revisionStage = { name: 'Revision', shortName: 'Revision' } as const
export const sections = [
  { id: 0, name: 'Restaurant Speaking Warm-Up', shortName: 'Speaking' },
  { id: 1, name: 'Restaurant Complaints', shortName: 'Restaurant' },
  { id: 2, name: 'Handling Food Order Complaints', shortName: 'Food orders' },
  { id: 3, name: 'Language Practice & Writing', shortName: 'Practice' },
] as const

type Base = { id: string; stage: StageId; requirement: 'continue' | 'answer' | 'record-or-skip' | 'review' | 'writing'; advance: 'next' | 'finish' }
export type IntroStep = Base & { kind: 'intro' | 'speaking-intro' | 'section-complete'; title: string; description: string; action: string }
export type QuestionStep = Base & { kind: 'choice' | 'match' | 'sort'; title: string; prompt: string; options: string[]; correct: number; sequence: number; total: number }
export type FillStep = Base & { kind: 'fill'; title: string; prompt: string; answer: string; sequence: number; total: number }
export type RecordingStep = Base & { kind: 'recording'; prompt: string; sequence: number; total: number }
export type VideoStep = Base & { kind: 'video'; video: 'pasta' | 'order'; title: string; description: string; repeat?: boolean; action: string }
export type VocabularyStep = Base & { kind: 'vocabulary'; item: { term: string; answer: string }; example: string; sequence: number; total: number }
export type DialogueStep = Base & { kind: 'dialogue'; title: string; description: string; dialogue: DialogueLine[] }
export type LanguageStep = Base & { kind: 'language'; group: typeof languageGroups[number]; sequence: number; total: number }
export type UnjumbleStep = Base & { kind: 'unjumble'; expression: string; sequence: number; total: number }
export type PracticeFiveStep = Base & { kind: 'practice-five'; scenario: string; example: string; sequence: number; total: number }
export type WritingStep = Base & { kind: 'writing' | 'reflection' }
export type DoneStep = Base & { kind: 'done' }
export type ActivityCompleteStep = Base & { kind: 'activity-complete'; activityId: string }
export type LessonStep = IntroStep | QuestionStep | FillStep | RecordingStep | VideoStep | VocabularyStep | DialogueStep | LanguageStep | UnjumbleStep | PracticeFiveStep | WritingStep | DoneStep | ActivityCompleteStep

const base = (id: string, stage: StageId, requirement: Base['requirement']): Base => ({ id, stage, requirement, advance: 'next' })

const vocabularyExamples1 = [
  'The chicken was undercooked, so I asked the waiter for another dish.',
  'I ordered a different dish for lunch.',
  'The waiter took the food back to the kitchen.',
  'The chef prepared a fresh meal.',
  'Thank you for your patience while we fix the problem.',
  'The waiter offered us some water.',
  'The restaurant gave us a free drink.',
  'Could we have the bill, please?',
  'The restaurant removed the pasta from the bill.',
  'Please make sure the food is hot.',
]
const vocabularyExamples2 = [
  'I ordered my steak medium.',
  'The steak was almost rare.',
  'The waiter apologized for the mistake.',
  'I appreciate your help.',
  'The waiter took the steak back to the kitchen.',
  'Could you bring me some fresh fries?',
  'Certainly, I can help you.',
  'The waiter sorted the problem quickly.',
  'I will bring your food right away.',
  'We will fix this as quickly as possible.',
]

const revisionOptions = [neighbourPairs[3].response, neighbourPairs[0].response, neighbourPairs[4].response, neighbourPairs[1].response, neighbourPairs[2].response]
const revisionAnswerIndex = (index: number) => [1, 3, 4, 0, 2][index]
const pastaQuiz: LessonStep[] = [
  ...pastaQuestions.map((question, index): QuestionStep => ({ ...base(`pasta-choice-${index}`, 1, 'answer'), kind: 'choice', title: 'Check your understanding', prompt: question.prompt, options: question.options, correct: question.answer, sequence: index + 1, total: 7 })),
  { ...base('pasta-fill-0', 1, 'answer'), kind: 'fill', title: 'Complete the sentence', prompt: 'The chicken pasta was ________.', answer: 'cold', sequence: 4, total: 7 },
  { ...base('pasta-fill-1', 1, 'answer'), kind: 'fill', title: 'Complete the sentence', prompt: 'The waiter offered a free ________.', answer: 'drink', sequence: 5, total: 7 },
  { ...base('pasta-true-false-0', 1, 'answer'), kind: 'choice', title: 'True or false?', prompt: 'The customer asked for a different dish.', options: ['True', 'False'], correct: 1, sequence: 6, total: 7 },
  { ...base('pasta-true-false-1', 1, 'answer'), kind: 'choice', title: 'True or false?', prompt: 'The waiter listened politely and solved the problem.', options: ['True', 'False'], correct: 0, sequence: 7, total: 7 },
]

const lessonSteps: LessonStep[] = [
  { ...base('welcome', 'revision', 'continue'), kind: 'intro', title: 'Restaurant Complaints', description: 'Listen to real conversations, practise polite complaints, and build confidence speaking English.', action: 'Begin revision' },
  ...neighbourPairs.map((pair, index): QuestionStep => ({ ...base(`revision-${index}`, 'revision', 'answer'), kind: 'choice', title: 'Revision: Neighbour Complaints', prompt: pair.complaint, options: revisionOptions, correct: revisionAnswerIndex(index), sequence: index + 1, total: 5 })),
  { ...base('revision-complete', 'revision', 'continue'), kind: 'section-complete', title: 'Revision complete', description: 'You have practised responding to neighbour complaints. Next, let’s talk about restaurants.', action: 'Continue to Section 0' },
  { ...base('speaking-intro', 0, 'continue'), kind: 'speaking-intro', title: 'Restaurant Speaking Warm-Up', description: 'There are no right or wrong answers. Feel free to say whatever comes to mind. The goal is simply to practise speaking English.', action: 'Let’s start speaking' },
  ...discussion.map((prompt, index): RecordingStep => ({ ...base(`speaking-${index}`, 0, 'record-or-skip'), kind: 'recording', prompt, sequence: index + 1, total: 5 })),
  { ...base('warmup-complete', 0, 'continue'), kind: 'section-complete', title: 'Great! You’re ready for the lesson.', description: 'You have practised speaking about restaurants.', action: 'Continue to Restaurant Complaints' },

  { ...base('pasta-video', 1, 'review'), kind: 'video', video: 'pasta', title: 'Restaurant Complaints', description: 'Watch and listen to the conversation between a customer and a waiter.', action: 'Continue to vocabulary' },
  ...vocabulary1.map((item, index): VocabularyStep => ({ ...base(`vocab-1-${index}`, 1, 'continue'), kind: 'vocabulary', item, example: vocabularyExamples1[index], sequence: index + 1, total: 10 })),
  { ...base('pasta-rewatch', 1, 'review'), kind: 'video', video: 'pasta', title: 'Watch Again', description: 'Now that you know the vocabulary, watch the conversation again.', repeat: true, action: 'Start quiz' },
  ...pastaQuiz,
  ...matchingWords.map((item, index): QuestionStep => ({ ...base(`match-${index}`, 1, 'answer'), kind: 'match', title: 'Match the word', prompt: item.term, options: matchingDefinitions.map(definition => definition.text), correct: matchingDefinitions.findIndex(definition => definition.text === item.answer), sequence: index + 1, total: 5 })),
  { ...base('restaurant-complete', 1, 'continue'), kind: 'section-complete', title: 'Restaurant Complaints complete', description: 'You listened, learned new words and checked your understanding.', action: 'Continue to food orders' },

  { ...base('order-video', 2, 'review'), kind: 'video', video: 'order', title: 'Handling Complaints About Food Orders', description: 'Watch the customer explain a mistake with a chicken sandwich order.', action: 'Review the dialogue' },
  { ...base('order-dialogue', 2, 'review'), kind: 'dialogue', title: 'Read and role-play', description: 'Read the conversation one line at a time. Try saying each line aloud.', dialogue: orderDialogue },
  { ...base('steak-dialogue', 2, 'review'), kind: 'dialogue', title: 'Undercooked Steak Surprise', description: 'Read this separate restaurant conversation. The steak dialogue has no source audio recording.', dialogue: steakDialogue },
  ...vocabulary2.map((item, index): VocabularyStep => ({ ...base(`vocab-2-${index}`, 2, 'continue'), kind: 'vocabulary', item, example: vocabularyExamples2[index], sequence: index + 1, total: 10 })),
  { ...base('steak-review', 2, 'review'), kind: 'dialogue', title: 'Review the steak conversation', description: 'Read the exchange once more before answering questions about this steak order.', dialogue: steakDialogue },
  ...steakQuestions.map((question, index): QuestionStep => ({ ...base(`steak-choice-${index}`, 2, 'answer'), kind: 'choice', title: 'Steak conversation quiz', prompt: question.prompt, options: question.options, correct: question.answer, sequence: index + 1, total: 5 })),
  { ...base('food-orders-complete', 2, 'continue'), kind: 'section-complete', title: 'Food order complaints complete', description: 'You reviewed two different restaurant situations and their useful language.', action: 'Continue to practice' },

  ...languageGroups.map((group, index): LanguageStep => ({ ...base(`language-${index}`, 3, 'continue'), kind: 'language', group, sequence: index + 1, total: languageGroups.length })),
  ...complaintExpressions.map((expression, index): UnjumbleStep => ({ ...base(`unjumble-${index}`, 3, 'answer'), kind: 'unjumble', expression, sequence: index + 1, total: complaintExpressions.length })),
  ...sortingItems.map((item, index): QuestionStep => ({ ...base(`sorting-${index}`, 3, 'answer'), kind: 'sort', title: 'Sort the sentence', prompt: item.text, options: [...sortingGroups], correct: sortingGroups.indexOf(item.group), sequence: index + 1, total: sortingItems.length })),
  ...practiceFiveScenarios.map((item, index): PracticeFiveStep => ({ ...base(`practice-five-${index}`, 3, 'review'), kind: 'practice-five', ...item, sequence: index + 1, total: practiceFiveScenarios.length })),
  { ...base('writing', 3, 'writing'), kind: 'writing' },
  { ...base('reflection', 3, 'review'), kind: 'reflection' },
  { ...base('done', 3, 'continue'), advance: 'finish', kind: 'done' },
]

type ActivityType = 'graded' | 'speaking' | 'video' | 'vocabulary' | 'practice' | 'writing'
type ActivityDefinition = { id: string; first: string; last: string; completionId?: string; stage: StageId; title: string; completionTitle: string; message: string; introduction: string; startLabel: string; type: ActivityType }

const activityDefinitions: ActivityDefinition[] = [
  { id: 'revision', first: 'welcome', last: 'revision-4', completionId: 'revision-complete', stage: 'revision', title: 'Neighbour Complaints Revision', completionTitle: 'Revision Complete!', message: 'You reviewed polite responses to neighbour complaints.', introduction: 'Review five neighbour complaints and choose a polite response to each one.', startLabel: 'Begin Revision', type: 'graded' },
  { id: 'speaking', first: 'speaking-0', last: 'speaking-4', completionId: 'warmup-complete', stage: 0, title: 'Restaurant Speaking Warm-Up', completionTitle: 'Section 0 Complete!', message: 'You finished the restaurant discussion activity.', introduction: 'Answer five questions about restaurants using your voice. There are no right or wrong answers.', startLabel: 'Start Speaking Warm-Up', type: 'speaking' },
  { id: 'pasta-video', first: 'pasta-video', last: 'pasta-video', completionId: 'pasta-video-complete', stage: 1, title: 'Restaurant Complaints Video', completionTitle: 'Video Complete!', message: 'You reached the end of the restaurant conversation.', introduction: 'Watch a restaurant conversation, learn useful expressions, and check your understanding.', startLabel: 'Start Section 1', type: 'video' },
  { id: 'vocab-one', first: 'vocab-1-0', last: 'vocab-1-9', completionId: 'vocab-one-complete', stage: 1, title: 'Restaurant Vocabulary', completionTitle: 'Vocabulary Complete!', message: 'You explored 10 useful expressions for restaurant complaints.', introduction: 'Learn useful words and expressions from the conversation.', startLabel: 'Start Vocabulary', type: 'vocabulary' },
  { id: 'pasta-rewatch', first: 'pasta-rewatch', last: 'pasta-rewatch', completionId: 'pasta-rewatch-complete', stage: 1, title: 'Watch Again', completionTitle: 'Watch Again Complete!', message: 'You revisited the restaurant conversation with the new vocabulary.', introduction: 'Watch the conversation again and see how much more you understand.', startLabel: 'Watch Again', type: 'video' },
  { id: 'pasta-quiz', first: 'pasta-choice-0', last: 'pasta-true-false-1', completionId: 'pasta-quiz-complete', stage: 1, title: 'Restaurant Comprehension', completionTitle: 'Restaurant Comprehension Complete!', message: 'You completed the restaurant listening quiz.', introduction: 'Answer questions about the restaurant conversation.', startLabel: 'Start Quiz', type: 'graded' },
  { id: 'matching', first: 'match-0', last: 'match-4', completionId: 'restaurant-complete', stage: 1, title: 'Vocabulary Matching', completionTitle: 'Section 1 Complete!', message: 'You matched restaurant words with their meanings.', introduction: 'Reinforce what you learned by matching words with their meanings.', startLabel: 'Start Matching', type: 'graded' },
  { id: 'order-video', first: 'order-video', last: 'order-video', completionId: 'order-video-complete', stage: 2, title: 'Food Order Complaints Video', completionTitle: 'Video Complete!', message: 'You reached the end of the food order conversation.', introduction: 'Watch a customer explain a problem with a food order.', startLabel: 'Start Section 2', type: 'video' },
  { id: 'order-dialogue', first: 'order-dialogue', last: 'order-dialogue', completionId: 'order-dialogue-complete', stage: 2, title: 'Food Order Dialogue', completionTitle: 'Dialogue Complete!', message: 'You reviewed the food order conversation.', introduction: 'Read the food order conversation one line at a time.', startLabel: 'Read Dialogue', type: 'practice' },
  { id: 'steak-dialogue', first: 'steak-dialogue', last: 'steak-dialogue', completionId: 'steak-dialogue-complete', stage: 2, title: 'Steak Dialogue', completionTitle: 'Dialogue Complete!', message: 'You reviewed the steak conversation.', introduction: 'Read a separate conversation about an undercooked steak.', startLabel: 'Read Steak Dialogue', type: 'practice' },
  { id: 'vocab-two', first: 'vocab-2-0', last: 'vocab-2-9', completionId: 'vocab-two-complete', stage: 2, title: 'Food Order Vocabulary', completionTitle: 'Vocabulary Complete!', message: 'You explored 10 useful expressions for food order complaints.', introduction: 'Learn useful words and expressions for resolving food order problems.', startLabel: 'Start Vocabulary', type: 'vocabulary' },
  { id: 'steak-review', first: 'steak-review', last: 'steak-review', completionId: 'steak-review-complete', stage: 2, title: 'Review the Steak Conversation', completionTitle: 'Review Complete!', message: 'You revisited the steak conversation.', introduction: 'Read the steak conversation once more before the quiz.', startLabel: 'Review Dialogue', type: 'practice' },
  { id: 'steak-quiz', first: 'steak-choice-0', last: 'steak-choice-4', completionId: 'food-orders-complete', stage: 2, title: 'Steak Conversation Quiz', completionTitle: 'Section 2 Complete!', message: 'You completed the steak conversation quiz.', introduction: 'Answer five questions about the steak conversation.', startLabel: 'Start Quiz', type: 'graded' },
  { id: 'language', first: 'language-0', last: `language-${languageGroups.length - 1}`, completionId: 'language-complete', stage: 3, title: 'Complaint Language', completionTitle: 'Language Review Complete!', message: 'You explored expressions for complaints and resolutions.', introduction: 'Explore useful patterns for polite complaints and responses.', startLabel: 'Start Section 3', type: 'practice' },
  { id: 'unjumble', first: 'unjumble-0', last: `unjumble-${complaintExpressions.length - 1}`, completionId: 'unjumble-complete', stage: 3, title: 'Build the Complaint', completionTitle: 'Sentence Practice Complete!', message: 'You put complaint sentences in the right order.', introduction: 'Build polite complaint sentences from their words.', startLabel: 'Build Sentences', type: 'graded' },
  { id: 'sorting', first: 'sorting-0', last: `sorting-${sortingItems.length - 1}`, completionId: 'sorting-complete', stage: 3, title: 'Sentence Sorting', completionTitle: 'Sorting Complete!', message: 'You sorted the complaint and response sentences.', introduction: 'Sort sentences into the correct groups.', startLabel: 'Start Sorting', type: 'graded' },
  { id: 'practice-five', first: 'practice-five-0', last: `practice-five-${practiceFiveScenarios.length - 1}`, completionId: 'practice-five-complete', stage: 3, title: 'Polite Response Practice', completionTitle: 'Practice Complete!', message: 'You explored seven restaurant situations.', introduction: 'Write your own polite response to each restaurant situation.', startLabel: 'Start Practice', type: 'practice' },
  { id: 'writing', first: 'writing', last: 'writing', completionId: 'writing-complete', stage: 3, title: 'Restaurant Complaint Email', completionTitle: 'Writing Complete!', message: 'You wrote a restaurant complaint email.', introduction: 'Write a short complaint email to a restaurant manager.', startLabel: 'Start Writing', type: 'writing' },
  { id: 'reflection', first: 'reflection', last: 'reflection', stage: 3, title: 'Reflection', completionTitle: 'Lesson Complete!', message: 'You reflected on what you learned.', introduction: 'Share a word or expression you learned before finishing the lesson.', startLabel: 'Start Reflection', type: 'writing' },
]

const learningSteps = lessonSteps.filter(step => step.kind !== 'section-complete' && step.id !== 'speaking-intro')
export const activities = activityDefinitions.map(activity => {
  const first = learningSteps.findIndex(step => step.id === activity.first)
  const last = learningSteps.findIndex(step => step.id === activity.last)
  if (first < 0 || last < first) throw new Error(`Invalid activity boundary: ${activity.id}`)
  return { ...activity, stepIds: learningSteps.slice(first, last + 1).map(step => step.id) }
})
const completionByLast = new Map(activities.filter(activity => activity.completionId).map(activity => [activity.last, activity]))
export const steps: LessonStep[] = learningSteps.flatMap(step => {
  const activity = completionByLast.get(step.id)
  return activity && activity.completionId ? [step, { ...base(activity.completionId, activity.stage, 'continue'), kind: 'activity-complete' as const, activityId: activity.id }] : [step]
})

export const countableSteps = steps.filter(step => step.kind !== 'done' && step.kind !== 'activity-complete')
export const sectionSteps = (section: SectionId) => countableSteps.filter(step => step.stage === section)
