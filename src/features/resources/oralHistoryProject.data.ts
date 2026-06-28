export interface HowStep {
  n: string
  title: string
  body: string
}

export interface Voice {
  text: string
  who: string
}

export const ABOUT = [
  'We are recording the lives of LGBTQ+ elders in Lisbon before those stories are lost — the ordinary ones especially. Your story does not have to be dramatic to be worth keeping. History walks into the room and sits down.',
]

export const STEPS: HowStep[] = [
  { n: '01', title: 'Say you\'re interested', body: 'A quiet word to a mod or a note in the group is all it takes. There is no form and no commitment yet — just a conversation about whether it feels right.' },
  { n: '02', title: 'Choose how you appear', body: 'Voice-only is completely fine; no faces are ever required. You decide what is recorded, what is kept off the record, and what your name is attached to.' },
  { n: '03', title: 'Record at your pace', body: 'Sofia does the interviews, gently, in as many sessions as you like. You can pause, revisit, or stop entirely at any point, and nothing is used without your final yes.' },
  { n: '04', title: 'Decide how it\'s used', body: 'Archive only, community screening, or part of the documentary — your choice, and it can change later. You keep the right to withdraw your recording.' },
]

export const VOICES: Voice[] = [
  { text: 'I wasn\'t prepared for how much this would move me. I\'m treating each recording with everything I have.', who: 'Sofia, interviewer' },
  { text: "I didn't think anyone would want my ordinary life on tape. Telling it back was the first time it felt like it had mattered.", who: 'A participant' },
]
