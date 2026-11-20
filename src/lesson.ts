export type DialogueLine = { speaker: 'Customer' | 'Waiter'; text: string }
export type ChoiceQuestion = { prompt: string; options: string[]; answer: number }
export type MatchItem = { term: string; answer: string }

export const objectives = [
  'Describe problems with products or services.',
  'Make complaints politely in shops or restaurants.',
  'Ask for help or solutions.',
  'Use customer service vocabulary.',
  'Role-play customer complaint situations.',
]

export const discussion = [
  'What problems can people have in restaurants?',
  'Have you ever received cold or bad food in a restaurant?',
  'What do you usually do when there is a problem with your order?',
  'Is it important for waiters to be polite? Why?',
  'How should restaurants respond to customer complaints?',
]

export const pastaDialogue: DialogueLine[] = [
  { speaker: 'Customer', text: 'Excuse me. Could I tell you something about my food?' },
  { speaker: 'Waiter', text: 'Of course. What’s the problem?' },
  { speaker: 'Customer', text: 'My chicken pasta is cold and the chicken looks a little undercooked.' },
  { speaker: 'Waiter', text: 'I’m very sorry about that. That shouldn’t happen. Let me take it back to the kitchen.' },
  { speaker: 'Customer', text: 'Thank you.' },
  { speaker: 'Waiter', text: 'Would you like the same dish again or something different?' },
  { speaker: 'Customer', text: 'The same dish is fine, but please make sure it’s cooked well.' },
  { speaker: 'Waiter', text: 'No problem. I’ll tell the chef. Thank you for your patience.' },
  { speaker: 'Customer', text: 'Thanks for helping.' },
  { speaker: 'Waiter', text: 'While you wait, can I offer you a free drink? Maybe a soft drink or some water?' },
  { speaker: 'Customer', text: 'A glass of water would be great. Thank you.' },
  { speaker: 'Waiter', text: 'Of course. I’ll bring that right away.' },
  { speaker: 'Waiter', text: 'Here is your new chicken pasta. Could you check if it’s okay now?' },
  { speaker: 'Customer', text: 'Yes, it’s hot and tastes good now.' },
  { speaker: 'Waiter', text: 'Wonderful. We also removed it from your bill.' },
  { speaker: 'Customer', text: 'Oh, thank you very much.' },
  { speaker: 'Waiter', text: 'You’re welcome. Enjoy the rest of your meal.' },
]

export const orderDialogue: DialogueLine[] = [
  { speaker: 'Customer', text: 'Excuse me. I think there’s a mistake with my order.' },
  { speaker: 'Waiter', text: 'I’m sorry about that. What seems to be the problem?' },
  { speaker: 'Customer', text: 'I ordered the chicken sandwich, but this looks like beef.' },
  { speaker: 'Waiter', text: 'Let me check your order. You’re right. That is beef. I apologize.' },
  { speaker: 'Customer', text: 'It’s okay. Can I please get the chicken sandwich instead?' },
  { speaker: 'Waiter', text: 'Of course. I’ll take this back and bring the correct one right away.' },
  { speaker: 'Customer', text: 'Also, could I get some extra napkins, please?' },
  { speaker: 'Waiter', text: 'Sure. I’ll bring napkins with your sandwich.' },
  { speaker: 'Customer', text: 'Is the chicken sandwich spicy?' },
  { speaker: 'Waiter', text: 'No, it’s not spicy. It’s made with a mild sauce.' },
  { speaker: 'Customer', text: 'That sounds good. I’m looking forward to it.' },
]

export const steakDialogue: DialogueLine[] = [
  { speaker: 'Customer', text: 'Excuse me, I ordered my steak medium, but it’s almost rare.' },
  { speaker: 'Waiter', text: 'I apologize for that. Would you like me to have it cooked a bit more?' },
  { speaker: 'Customer', text: 'Yes, I would appreciate that. Thank you.' },
  { speaker: 'Waiter', text: 'No problem. I’ll take it back to the kitchen right away.' },
  { speaker: 'Customer', text: 'Thanks. While you’re at it, could you also bring me some fresh fries?' },
  { speaker: 'Waiter', text: 'Certainly, I’ll have everything sorted for you as quickly as possible.' },
]

export const vocabulary1: MatchItem[] = [
  { term: 'undercooked', answer: 'not cooked enough' },
  { term: 'dish', answer: 'a type of prepared food' },
  { term: 'kitchen', answer: 'the place where food is cooked' },
  { term: 'chef', answer: 'the main cook in a restaurant' },
  { term: 'patience', answer: 'waiting calmly' },
  { term: 'offer', answer: 'to give something' },
  { term: 'free drink', answer: 'a drink with no cost' },
  { term: 'bill', answer: 'the paper showing the total cost' },
  { term: 'remove from the bill', answer: 'not charge money for something' },
  { term: 'make sure', answer: 'check carefully' },
]

export const vocabulary2: MatchItem[] = [
  { term: 'medium', answer: 'steak cooked in the middle level (not rare, not well done)' },
  { term: 'rare', answer: 'meat that is cooked very lightly' },
  { term: 'apologize', answer: 'to say sorry' },
  { term: 'appreciate', answer: 'to be thankful for something' },
  { term: 'kitchen', answer: 'the place where food is prepared' },
  { term: 'fresh fries', answer: 'newly cooked potato fries' },
  { term: 'certainly', answer: 'of course / definitely' },
  { term: 'sorted', answer: 'fixed or arranged correctly' },
  { term: 'right away', answer: 'immediately' },
  { term: 'as quickly as possible', answer: 'very fast' },
]

export const pastaQuestions: ChoiceQuestion[] = [
  { prompt: 'What was wrong with the pasta?', options: ['It was too spicy', 'It was cold', 'It was expensive'], answer: 1 },
  { prompt: 'What did the waiter offer the customer?', options: ['A dessert', 'A free drink', 'Another table'], answer: 1 },
  { prompt: 'What happened at the end?', options: ['The customer left angry', 'The food stayed cold', 'The restaurant removed the dish from the bill'], answer: 2 },
]

export const steakQuestions: ChoiceQuestion[] = [
  { prompt: 'How did the customer want the steak cooked?', options: ['Rare', 'Medium', 'Well done'], answer: 1 },
  { prompt: 'What was wrong with the steak?', options: ['It was cold', 'It was burned', 'It was almost rare'], answer: 2 },
  { prompt: 'What did the waiter do?', options: ['Ignored the customer', 'Apologized and offered help', 'Changed the table'], answer: 1 },
  { prompt: 'What else did the customer ask for?', options: ['Salad', 'Soup', 'Fresh fries'], answer: 2 },
  { prompt: 'Where would the waiter take the steak?', options: ['To the manager', 'To the kitchen', 'To another customer'], answer: 1 },
]

export const matchingWords: MatchItem[] = [
  { term: 'undercooked', answer: 'not cooked enough' },
  { term: 'chef', answer: 'the main cook in a restaurant' },
  { term: 'patience', answer: 'waiting calmly' },
  { term: 'offer', answer: 'to give something' },
  { term: 'bill', answer: 'the paper showing the total cost' },
]

export const matchingDefinitions = [
  { letter: 'a', text: 'to give something' },
  { letter: 'b', text: 'waiting calmly' },
  { letter: 'c', text: 'not cooked enough' },
  { letter: 'd', text: 'the paper showing the total cost' },
  { letter: 'e', text: 'the main cook in a restaurant' },
]

export const neighbourPairs = [
  { complaint: 'Your music is very loud at night. Could you please turn it down?', response: 'Sorry I’m having a small party tonight, but I’ll lower the music.' },
  { complaint: 'Your dog keeps barking very loudly late at night. I can’t sleep well.', response: 'I’m sorry about that. I’ll try to keep the dog inside at night.' },
  { complaint: 'There is a bad smell coming from your garbage sometimes.', response: 'Oh, I didn’t realize that. I’ll check the problem.' },
  { complaint: 'Could you please stop parking in front of my garage?', response: 'I’m really sorry. I’ll park somewhere else from now on.' },
  { complaint: 'The washing machine is very loud every evening. Can you do the laundry earlier?', response: 'Of course. That is a good idea. I will try to finish before 8 p.m.' },
]

export const complaintExpressions = [
  'This dish is too spicy.',
  'There’s a mistake with my order.',
  'The chicken sandwich is too spicy.',
  'The food is completely cold.',
  'The steak is overcooked.',
  'The steak is undercooked.',
  'This is the wrong order.',
]

export const sortingGroups = [
  'Explaining the problem', 'Making a request', 'Responding to the apology', 'Making an apology',
] as const

export const sortingItems = [
  { text: 'There seems to be a mistake', group: 'Explaining the problem' },
  { text: 'I’m afraid I can’t eat this.', group: 'Explaining the problem' },
  { text: 'Would you mind waiting?', group: 'Making a request' },
  { text: 'Could you possibly bring me a cloth?', group: 'Making a request' },
  { text: 'I’d like to order something else, please.', group: 'Making a request' },
  { text: 'It’s not your fault.', group: 'Responding to the apology' },
  { text: 'Don’t worry about it.', group: 'Responding to the apology' },
  { text: 'I’m terribly sorry.', group: 'Making an apology' },
  { text: 'I do apologize.', group: 'Making an apology' },
] as const

export const languageGroups = [
  { title: 'Apologizing', phrases: ['I’m very sorry for the inconvenience.', 'I apologize for the mistake.', 'That’s our fault.', 'I’m sorry we didn’t meet your expectations.', 'Please accept our apologies.'] },
  { title: 'Accepting an apology', phrases: ['That’s okay.', 'Thank you.', 'I appreciate your apology.', 'It’s alright.', 'No worries.'] },
  { title: 'Refusing an apology', phrases: ['I’m still not happy with this.', 'That’s not acceptable.', 'I don’t think that’s enough.', 'I would like a better solution.', 'I’m disappointed.'] },
]

export const writingPrompts = ['where you went', 'what the problem was', 'what the waiter did', 'what you want the restaurant to do']
export const writingPhrases = ['I visited your restaurant on…', 'There was a problem with…', 'The food was…', 'The waiter…', 'I would like…']

export const practiceFiveScenarios = [
  { scenario: 'I’ve been waiting for the waiter for too long', example: 'Excuse me, I’ve been waiting for a while. Could you please help me when you have a moment?' },
  { scenario: 'The waiter doesn’t notice you', example: 'Excuse me, could you please help us with our order?' },
  { scenario: 'I want to take the rest of the food home', example: 'Could I please have a box to take the rest of my food home?' },
  { scenario: 'I need more time to decide what to order', example: 'Could you give us a few more minutes to decide, please?' },
  { scenario: 'I’m not sure if this sauce is included in the price', example: 'Excuse me, is this sauce included in the price?' },
  { scenario: 'The music is too loud in the restaurant', example: 'Excuse me, the music is a little loud. Could you please turn it down?' },
  { scenario: 'My soup is cold', example: 'Excuse me, my soup is cold. Could you please warm it up?' },
]
