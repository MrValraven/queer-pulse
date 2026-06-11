import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { linkToPath } from '../../app/routeMap'

const PROFILE_PATH = linkToPath('QueerPulse Profile.html')
const TRANS_HEALTH = linkToPath('QueerPulse Trans Healthcare.html')
const INVITE_PATH = linkToPath('QueerPulse Invite.html')

export type ProfileTint = 'a' | 'b' | 'c'

export interface TdovProfile {
  tint: ProfileTint
  pron: string
  nameMain: string
  nameEm: string
  role: string
  quote: ReactNode
  read: string
}

export const PROFILES: TdovProfile[] = [
  {
    tint: 'a',
    pron: 'she/her · 5 years on QP',
    nameMain: 'Anika ',
    nameEm: 'Kovač',
    role: 'Healthcare designer · open-clinic host · Trans & Non-Binary Network',
    quote: (
      <>"I host clinic nights because I needed one when I moved here and there <em>wasn't</em> one. That's the entire reason."</>
    ),
    read: '5 min read',
  },
  {
    tint: 'b',
    pron: 'he/him · co-founder',
    nameMain: 'Nuno ',
    nameEm: 'Alves',
    role: 'Trans Hub coordinator · maintainer of the vetted-provider list',
    quote: (
      <>"I keep one phone number on me at all times. It is the one printed on a sticker on Mercearia Rosa's door."</>
    ),
    read: '7 min read',
  },
  {
    tint: 'c',
    pron: 'she/her · clinician · cis ally',
    nameMain: 'Dr. Inês ',
    nameEm: 'Pereira',
    role: 'Psychologist · changed the protocol at Clínica do Largo · WPATH-certified',
    quote: (
      <>"I do not <em>treat</em> being trans. I treat what the world does to you for being trans."</>
    ),
    read: '9 min interview',
  },
  {
    tint: 'a',
    pron: 'they/them · 3 years on QP',
    nameMain: 'Rita ',
    nameEm: 'Vasquez',
    role: 'Therapist · co-host of the post-march decompression event',
    quote: (
      <>"My waiting room has soft lighting on purpose. Half of my job is undoing the last clinic."</>
    ),
    read: '4 min read',
  },
  {
    tint: 'b',
    pron: 'they/them · joined 2026',
    nameMain: 'Mira ',
    nameEm: 'Martín',
    role: 'Helpline volunteer · arrived from Madrid in 2025',
    quote: (
      <>"I take the 06:00–10:00 shift. Most people who call us at that hour <em>haven't slept.</em>"</>
    ),
    read: '6 min read',
  },
  {
    tint: 'c',
    pron: 'he/him · contributor',
    nameMain: 'Tó ',
    nameEm: 'Costa',
    role: "Writer · the magazine's translation editor · author of Issue 04 cover",
    quote: (
      <>"I translate everything we publish into the Portuguese my grandmother spoke. She doesn't read me; that's not the point."</>
    ),
    read: '8 min read',
  },
  {
    tint: 'a',
    pron: 'she/her · 22 years SNS',
    nameMain: 'Helena ',
    nameEm: 'Costa',
    role: 'Nurse · public hospital · podcast guest',
    quote: (
      <>"I came out at work in 2018. They started using my name in 2019. <em>That gap is the story.</em>"</>
    ),
    read: 'Podcast episode',
  },
]

export interface ResCard {
  cls: '' | 'coral' | 'plum'
  icon: string
  title: ReactNode
  body: ReactNode
  href: string
}

export const RES_CARDS: ResCard[] = [
  {
    cls: '',
    icon: '🕐',
    title: <>The vetted provider <em>list</em></>,
    body: (
      <>
        47 names · all re-verified in the last 90 days. GPs, mental health, endocrinology,
        gynaecology (trans-inclusive), dental. <em>Updated monthly by Nuno.</em>
      </>
    ),
    href: linkToPath('QueerPulse Trans Hub.html'),
  },
  {
    cls: 'coral',
    icon: '💬',
    title: <>Open clinic night · <em>every Thursday</em></>,
    body: (
      <>
        Café Beirão back room · GP, pharmacist, peer support. Free, no booking, no records.{' '}
        <em>Bring questions.</em>
      </>
    ),
    href: TRANS_HEALTH,
  },
  {
    cls: 'plum',
    icon: '🛡',
    title: <>Lei n.º 38/2018 <em>plain-language guide</em></>,
    body: (
      <>
        What the law actually says, what it doesn't, and what to bring to a doctor or a Câmara
        Municipal. EN &amp; PT.
      </>
    ),
    href: TRANS_HEALTH,
  },
  {
    cls: '',
    icon: '✉',
    title: <>The Trans Hub <em>bulletin</em></>,
    body: (
      <>
        Monthly. New provider names, hormone supply news, anonymised case notes.{' '}
        <em>1.4k subscribers · 74% open rate.</em>
      </>
    ),
    href: linkToPath('QueerPulse Newsletter.html'),
  },
]

export interface ActionItem {
  n: ReactNode
  title: ReactNode
  body: ReactNode
}

export const ACTIONS: ActionItem[] = [
  {
    n: <>0<em>1</em></>,
    title: <>Set your pronouns visibly · everywhere</>,
    body: (
      <>
        Not just on QueerPulse — at work, in email, on Slack, on the door of your office.{' '}
        <em>
          Cis people normalising the practice is what makes trans pronouns less visible as a mark.
        </em>{' '}
        Takes 4 minutes. <Link to={PROFILE_PATH}>Edit your QP profile →</Link>
      </>
    ),
  },
  {
    n: <>0<em>2</em></>,
    title: <>Fund the Trans Hub <em>directly</em></>,
    body: (
      <>
        The provider list, the bulletin, the open clinic night. €10 once · €5/month · whatever's
        honest. <em>Goes to a specific pool, not "general support."</em> 96% of every euro
        reaches the work. <Link to={INVITE_PATH}>Donate to Trans Hub →</Link>
      </>
    ),
  },
  {
    n: <>0<em>3</em></>,
    title: <>Print a guide. Bring it somewhere.</>,
    body: (
      <>
        The Lei n.º 38/2018 plain-language PDF. Bring three copies to your office HR, your GP,
        your favourite café. <em>Hand them over without a speech.</em> Print run is on us — link
        below. <Link to={TRANS_HEALTH}>Download the print PDF →</Link>
      </>
    ),
  },
]
