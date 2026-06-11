import { linkToPath } from '../../app/routeMap'

export type TabId = 'notes' | 'chapters' | 'transcript'

export const SHOW = linkToPath('QueerPulse Podcast Show.html')
export const HOME = '/'
export const MEMBER = linkToPath('QueerPulse Profile.html')
export const ARTICLE = linkToPath('QueerPulse Article.html')

export const SPEEDS = ['0.8×', '1.0×', '1.2×', '1.5×', '2.0×']

export const CHAPTERS = [
  { time: '00:00', title: 'Cold open · "I make €38 less per hour than my non-affirming colleagues"' },
  { time: '05:23', title: 'How Inês ended up in Anjos · the Amsterdam years' },
  { time: '19:42', title: 'The 2022 protocol · what it actually says', current: true },
  { time: '30:45', title: 'The morning her boss tried to fire her' },
  { time: '39:24', title: 'Saturday phone calls · the unwritten part of the job' },
  { time: '47:00', title: "What she'd want a young GP to know · closing" },
]

export const TRANSCRIPT = [
  { who: 'Catarina', time: '00:01', text: "Inês, thank you for staying past closing. Set the scene — for someone who's never been here, what do we see when we walk in?" },
  { who: 'Inês', time: '00:14', text: "The first thing you see is the reception desk, but the second thing you see is that there isn't a reception form. It's been that way since 2022. People come in, give a name — whichever name they want — and we go from there. The receptionist has a small notebook and a very good memory." },
  { who: 'Catarina', time: '00:42', text: "That's the protocol change you're famous for. But that's only one of about a dozen, right?" },
  { who: 'Inês', time: '19:42', text: "So the protocol — the actual document — is two pages. People assume it's enormous because of how much friction it removed, but it's two pages. The first page is everything we stopped asking. The second page is everything we instead looked up from the patient's existing chart, with their consent, before they walked in.", current: true },
  { who: 'Catarina', time: '20:18', text: 'And the bureaucratic gauntlet on the way to getting that signed off was — how long?' },
  { who: 'Inês', time: '20:25', text: 'Eight months. Most of which was about who\'s liable if a patient is "misidentified" — a word I am, to be clear, not using approvingly. The legal team got there. Eventually.' },
]
