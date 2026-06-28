export interface NavStep {
  n: string
  title: string
  body: string
}

export interface Tip {
  text: string
  who: string
}

export const STEPS: NavStep[] = [
  { n: '01', title: 'Register your accommodations', body: 'Ask your Centro de Saúde to record your access needs on file — mobility, sensory, communication. Once it is in the system you stop re-explaining it at every visit, and appointments can be booked accordingly.' },
  { n: '02', title: 'Ask for referrals plainly', body: "You are entitled to a specialist referral without it becoming an appointment about your identity. A short written summary of your history, handed over at the start, keeps the visit on the actual reason you came." },
  { n: '03', title: 'Choose accessibility-aware GPs', body: 'Some Lisbon practices are noticeably better — step-free, unhurried, willing to write things down. The group keeps a peer-maintained list; ask in the space for current names.' },
  { n: '04', title: 'Navigate the insurance paperwork', body: 'Reimbursement and atestado de incapacidade paperwork is its own maze. Keep copies of everything, ask for decisions in writing, and lean on the group — someone has filled in the same form.' },
]

export const TIPS: Tip[] = [
  { text: 'Bring a one-page summary of your conditions and meds to every new doctor. It has saved me the fifteen-minutes-of-explaining tax more times than I can count.', who: 'Mónica, disabled-queers' },
  { text: 'Permission to rest is also part of healthcare. I had to learn that the appointment I cancel to protect a bad day is not a failure.', who: 'Beatriz, disabled-queers' },
]
