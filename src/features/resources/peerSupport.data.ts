export interface PeerStep {
  n: string
  title: string
  body: string
}

export const WHAT_IT_IS = [
  'Peer support is not therapy and it is not advice. It is sitting with someone who has been where you are and does not need it explained. No clinical notes, no diagnosis, no goal you have to reach by the end.',
  'In the Hub, peer support runs two ways: the open circle where the group shows up together, and one-to-one pairing when you want a single person to talk to over time. You choose which, and you can switch whenever.',
]

export const STEPS: PeerStep[] = [
  { n: '01', title: 'Tell us what you need', body: "Post in the Hub or message a mod. You can be as specific or as vague as you like — 'I just started HRT and want someone who gets it' is plenty to go on." },
  { n: '02', title: 'We pair you, gently', body: 'A mod suggests one or two peers whose experience overlaps with yours. Nothing is automatic and nobody sees your request but the mod team. You say yes or not-yet.' },
  { n: '03', title: 'You set the shape', body: 'Coffee, a walk, a voice note once a week, or the circle on Thursdays — whatever is sustainable for both of you. There is no minimum commitment and no awkwardness in stopping.' },
  { n: '04', title: 'You can become a peer too', body: 'Most people who are supported end up supporting someone else later. When you are ready, tell a mod. We run a short, no-pressure orientation on holding space and keeping confidentiality.' },
]
