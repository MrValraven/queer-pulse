export interface Expectation {
  title: string
  body: string
}

export interface Faq {
  q: string
  a: string
}

export const EXPECT: Expectation[] = [
  { title: 'No agenda, no pitch', body: "Nobody is going to ask what you do for work or try to recruit you for anything. The whole format is: show up, talk to whoever you end up next to, leave when you like." },
  { title: 'The book-swap table', body: "There's usually a small pile of books on the table. Bring one, take one, or just use it as something to do with your hands for the first ten minutes. It works." },
  { title: 'Come alone or bring someone', body: "Most people come alone the first time. You'll be looked after. If it helps to bring a friend, bring a friend — both are completely normal." },
]

export const VALUES = [
  'You don\'t need to be out, or out in any particular way, to be here.',
  'Ask before taking photos — always, of everyone.',
  'We look after first-timers; we were all one once.',
  'What\'s shared in person stays in person.',
]

export const FAQS: Faq[] = [
  { q: "What if I don't know anyone?", a: "Nobody does, the first time. The host is there early specifically to catch people at the door and introduce you. Say you're new — it's the easiest sentence to say here." },
  { q: "What if I'm really nervous?", a: "Almost everyone is, and almost everyone almost turns around at the door. The people setting up tables this month did exactly that at their first one. It gets easy fast." },
  { q: 'How will I find the group?', a: "The host posts where they'll be and what they're wearing — usually at a specific entrance or lift at a set time, then everyone moves together. Check the gathering's pinned post." },
  { q: 'Do I have to stay the whole time?', a: 'No. Leave whenever you like, no explanation needed. Staying twenty minutes still counts as coming.' },
]
