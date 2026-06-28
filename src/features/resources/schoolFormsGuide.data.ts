export interface FormStep {
  n: string
  title: string
  body: string
}

export interface Voice {
  text: string
  who: string
}

export const ON_FORMS: FormStep[] = [
  { n: '01', title: 'Read the parent fields first', body: 'Many Lisbon schools now use two unlabelled "encarregado de educação" fields with no gender specified — you can put both your names straight in. Where a form still says "mãe / pai", you are allowed to cross out and write what is true.' },
  { n: '02', title: 'Ask before you assume the worst', body: 'Most administrative staff say yes without hesitation when asked to use both parents\' names everywhere. Ask early, ask in writing, and you usually find the form is the only old-fashioned thing about the school.' },
  { n: '03', title: 'Get the both-names agreement in writing', body: 'A short email confirming both parents are recorded and contacted equally saves you re-explaining at every pickup, trip slip, and parents\' evening for years.' },
]

export const RIGHTS = [
  { badge: 'protected', title: 'Equal recognition', body: 'Same-sex parents have full equal legal standing as parents in Portugal. A school cannot lawfully recognise only one of you, and both can be the official "encarregado de educação".' },
  { badge: 'know', title: 'Your child\'s name', body: 'Children of same-sex couples can carry both parents\' surnames. Schools must use the name on the child\'s documents — including a chosen name where records have been updated.' },
  { badge: 'practical', title: 'If a school pushes back', body: 'It is rare, but if it happens, document it and raise it with the school\'s direction in writing. ILGA Portugal and the parents network can both help you escalate calmly.' },
]

export const VOICES: Voice[] = [
  { text: 'My kid starts school in September. The intake form had two parent fields, no gender specified. I asked about using both our names everywhere and they said yes without hesitation.', who: 'Nuno, queer-parents' },
  { text: 'We crossed out "mãe / pai" and wrote our names. The teacher photocopied it as the example for the office. Small thing, but it mattered.', who: 'Carla, queer-parents' },
]
