import { type ReactNode } from 'react'

export type Region = 'pt' | 'eu' | 'int'
export type Tint = 'coral' | 'jade' | 'plum'

export interface Stat {
  value: ReactNode
  label: string
}
export interface Collab {
  kicker: string
  title: string
  dek: string
  footLeft: string
  footRight: string
}
export interface TimelineItem {
  date: string
  title: ReactNode
  body: string
  tint?: Tint
}
export interface Prose {
  heading: string
  body: ReactNode
}
export interface InfoRow {
  label: string
  value: string
  accent?: 'jade' | 'coral'
}
export interface Contact {
  phone?: string
  phoneNote?: string
  email?: string
  website?: string
  address?: string
}

export interface Partner {
  /* card */
  slug: string
  av: string
  logo: string
  bg: string
  color: string
  region: Region
  regionLabel: string
  name: string
  city: string
  desc: string
  tags: string[]
  /* detail */
  eyebrow: string
  tagline: string
  tier: string
  since: string
  about: ReactNode[]
  stats: Stat[]
  aboutMore: Prose[]
  jointWork: Collab[]
  timeline: TimelineItem[]
  how: Prose[]
  funding: ReactNode
  atGlance: InfoRow[]
  contact: Contact
}

export const PARTNERS: Partner[] = [
  {
    slug: 'ilga-portugal', av: 'IL', logo: 'ILGA', bg: 'rgba(74,140,111,.15)', color: 'var(--jade)',
    region: 'pt', regionLabel: 'Portugal', name: 'ILGA Portugal', city: 'Lisbon',
    desc: "Portugal's leading LGBTQ+ rights organisation. Legal support, crisis services, advocacy. Our most essential partnership — institutional knowledge and political relationships.",
    tags: ['Rights', 'Legal', 'Crisis support'],
    eyebrow: 'Partner · Advocacy organisation',
    tagline: "The country's oldest LGBTQ+ advocacy organisation — legal aid, hate-crime support, policy work, and the lifeline number behind half of Lisbon.",
    tier: 'Founding partner', since: 'Partnered since 2022 · 4 years',
    about: [
      <><strong>ILGA Portugal</strong> was founded in 1995 as the first LGBTQ+ rights organisation in the country. They run the national LGBT Helpline, operate community centres in Lisbon and Porto, file legal cases on behalf of members, lobby for legislation, and publish the annual <em>Anti-LGBT+ Discrimination Report</em>.</>,
      <>Our partnership is operational, not ceremonial. ILGA refers callers from their helpline to specific QueerPulse spaces and members; we route reports filed on QueerPulse to ILGA's casework team when they involve legal questions; we share an emergency response protocol.</>,
    ],
    stats: [
      { value: <em>1995</em>, label: 'Founded' },
      { value: '2.1k', label: 'Cases supported / year' },
      { value: '96%', label: 'Of QP legal referrals routed here' },
      { value: <em>4</em>, label: 'Years partnered' },
    ],
    aboutMore: [
      { heading: 'What this partnership means in practice', body: <>If you file a hate-crime report through QueerPulse, an ILGA casework lead reads it within 24 hours and reaches out if you've consented. If you call ILGA's helpline and want a connection to a community, they have a list of QP-vetted hosts they can hand off to. If we spot a systemic pattern — a hospital quietly refusing trans care — ILGA writes it up.</> },
      { heading: 'Where the boundaries are', body: <>ILGA is independent. They don't moderate QueerPulse content. We don't speak for ILGA's policy positions. Either organisation can publicly disagree with the other, and we have — about the 2024 self-determination amendments and the 2025 census language.</> },
    ],
    jointWork: [
      { kicker: 'Live · since 2023', title: 'Hate-crime reporting bridge', dek: 'Reports filed on QueerPulse route to ILGA casework with consent. 268 cases handled this way in 2025.', footLeft: 'Operational', footRight: '268 cases' },
      { kicker: 'Live · since 2022', title: 'Crisis-line handoff protocol', dek: 'Members in crisis chat can be connected to the LGBT Helpline without re-explaining.', footLeft: 'Operational', footRight: '1.4k handoffs' },
      { kicker: 'Live · since 2024', title: 'Free 30-min legal consults', dek: "Members get one free 30-min consult with ILGA's legal team per year — workplace, housing, discrimination.", footLeft: 'Open · 4 slots / week', footRight: 'Book' },
      { kicker: 'Published · Apr 2026', title: 'Anti-LGBT+ Discrimination Report 2025', dek: 'Co-distributed; the Magazine ran the long-read summary and an interview with the lead researcher.', footLeft: 'Report', footRight: '12.8k reads' },
      { kicker: 'Annual · each June', title: 'Pride legal-observer training', dek: 'ILGA trains QP-recruited volunteer legal observers for Lisboa Pride. 40 trained for 2026.', footLeft: 'This year', footRight: '40 observers' },
      { kicker: 'Recruiting · always', title: 'Helpline volunteer pipeline', dek: "QP members trained and rotated into ILGA's helpline cohort. 90 hours over 3 months.", footLeft: 'Apply', footRight: 'Next cohort: Sep' },
    ],
    timeline: [
      { date: '14 May 2026', title: <>Joint statement on the <em>census language amendment</em></>, body: 'We co-signed a public statement calling for non-binary recognition in the 2031 census.' },
      { date: '8 Apr 2026', title: 'Anti-LGBT+ Discrimination Report 2025 — co-distribution', body: "Magazine cover story + report PDF distributed to 12.8k members. ILGA's casework lead joined the launch.", tint: 'jade' },
      { date: '21 Feb 2026', title: '300th hate-crime case routed', body: '300 reports filed through QueerPulse have now been picked up by an ILGA lawyer. 64% closed with outcome.', tint: 'plum' },
      { date: '18 Nov 2025', title: 'Free legal consult programme launched', body: 'One 30-min consult per member per year. 4 slots a week filled within 2 hours of launch.' },
      { date: '12 May 2022', title: 'Founding partnership signed', body: 'First operational MOU — helpline handoff and report bridge. Set up in 6 weeks.', tint: 'plum' },
    ],
    how: [
      { heading: 'The case bridge', body: <>Anyone with a casework need — discrimination, hate crime, employment, housing — can opt into routing. Once they sign a one-page consent, the report goes into ILGA's queue with a <strong>P1/P2/P3</strong> tag. P1 ≤ 24 hours, P2 ≤ 5 days, P3 best-effort.</> },
      { heading: 'The helpline handoff', body: <>ILGA operators have a one-pager of QP chapters by region. If a caller asks "is there a community I can join?", they get a host's name and number. <em>No identifying data flows back to us.</em></> },
      { heading: "What we don't do", body: <>We don't share member identities, message contents, or directory data. We don't moderate together. We don't co-sign policy positions automatically — every joint statement is approved on both sides.</> },
    ],
    funding: <><b>Funding transparency:</b> ILGA's partnership is unpaid. We pay ILGA per-case for the legal consult programme (€45 / consult, sustainer-funded). Everything else is reciprocal infrastructure.</>,
    atGlance: [
      { label: 'Type', value: 'Advocacy NGO' },
      { label: 'Founded', value: '1995' },
      { label: 'HQ', value: 'Lisbon' },
      { label: 'Reach', value: 'Portugal-wide' },
      { label: 'Partner tier', value: 'Founding', accent: 'coral' },
      { label: 'Status', value: '● Active', accent: 'jade' },
    ],
    contact: { phone: '218 873 918', phoneNote: 'helpline', email: 'ilga@ilga-portugal.pt', website: 'ilga-portugal.pt', address: 'R. dos Fanqueiros 38, Lisboa' },
  },

  {
    slug: 'opus-diversus', av: 'OD', logo: 'OD', bg: 'rgba(232,119,90,.14)', color: 'var(--accent-ink)',
    region: 'pt', regionLabel: 'Portugal', name: 'Opus Diversus', city: 'Lisbon',
    desc: 'Mental health, community support, and peer group programmes for LGBTQ+ people. A space that takes care seriously — as a political act.',
    tags: ['Mental health', 'Peer support'],
    eyebrow: 'Partner · Health & wellbeing',
    tagline: 'Affirming mental health care and peer support, run by clinicians who treat care itself as a political act.',
    tier: 'Health partner', since: 'Partnered since 2023 · 3 years',
    about: [
      <><strong>Opus Diversus</strong> runs LGBTQ+-affirming therapy, peer-support groups, and a weekly drop-in, on a sliding scale that turns nobody away. Many of their clinicians share the experience they treat.</>,
      <>With QueerPulse, the partnership is about access and training: they deliver the clinical backbone of our peer-support volunteering, and we route members who need real care to people who won't make them explain themselves first.</>,
    ],
    stats: [
      { value: <em>6h</em>, label: 'Peer-support training delivered' },
      { value: '3', label: 'Programmes run jointly' },
      { value: '88%', label: 'Of QP wellbeing referrals routed here' },
      { value: <em>3</em>, label: 'Years partnered' },
    ],
    aboutMore: [
      { heading: 'What this partnership means in practice', body: <>Opus Diversus trains and supervises the QueerPulse peer-support volunteers, runs the monthly debrief, and takes warm referrals from our crisis chat. <em>Safeguarding records stay with them, separate from your QP profile.</em></> },
      { heading: 'Where the boundaries are', body: <>Clinical decisions are theirs alone. We don't see therapy notes; they don't moderate the platform. Their sliding scale is theirs to set.</> },
    ],
    jointWork: [
      { kicker: 'Live · since 2023', title: 'Peer-support volunteer training', dek: "Opus Diversus trains and supervises QueerPulse's drop-in peer supporters.", footLeft: 'Operational', footRight: 'Monthly cohort' },
      { kicker: 'Live · since 2024', title: 'Warm-referral pathway', dek: 'Members in crisis chat can be handed directly to an affirming clinician.', footLeft: 'Operational', footRight: '210 referrals' },
      { kicker: 'Weekly · ongoing', title: 'Open drop-in night', dek: 'A weekly peer-support drop-in promoted to members — no booking, no fee.', footLeft: 'Open', footRight: 'Thu 19:00' },
    ],
    timeline: [
      { date: '1 May 2026', title: 'New peer-support cohort started', body: 'Eight new QueerPulse volunteers began the 6-hour training and supervision cycle.' },
      { date: '12 Jan 2026', title: '200th warm referral', body: 'The crisis-chat handoff passed 200 members connected to a clinician.', tint: 'jade' },
      { date: '9 Mar 2023', title: 'Health partnership signed', body: 'Agreed the training-and-referral model that still runs today.', tint: 'plum' },
    ],
    how: [
      { heading: 'Training & supervision', body: <>Opus Diversus delivers the peer-support curriculum and runs the monthly supervised debrief. <strong>Volunteers are never alone in the room</strong> and a clinician is always on call.</> },
      { heading: 'Referrals, not records', body: <>We pass a warm introduction with consent; they take it from there. <em>We never see what happens next, and that's the point.</em></> },
    ],
    funding: <><b>Funding transparency:</b> QueerPulse part-funds the training cohort; therapy itself runs on Opus Diversus's own sliding scale. No member data is sold or shared.</>,
    atGlance: [
      { label: 'Type', value: 'Health practice' },
      { label: 'Focus', value: 'Mental health' },
      { label: 'HQ', value: 'Intendente, Lisbon' },
      { label: 'Reach', value: 'Lisbon' },
      { label: 'Partner tier', value: 'Health', accent: 'coral' },
      { label: 'Status', value: '● Active', accent: 'jade' },
    ],
    contact: { email: 'ola@opusdiversus.pt', website: 'opusdiversus.pt', address: 'R. do Benformoso 140, Lisboa' },
  },

  {
    slug: 'rede-ex-aequo', av: 'RA', logo: 'rea', bg: 'rgba(45,27,61,.1)', color: 'var(--plum)',
    region: 'pt', regionLabel: 'Portugal', name: 'Rede ex aequo', city: 'Nationwide',
    desc: 'Youth LGBTQ+ association with groups across Portugal. Peer support, youth activism, and a strong track record of building young queer community.',
    tags: ['Youth', 'Peer groups'],
    eyebrow: 'Partner · Youth association',
    tagline: 'The national youth LGBTQ+ association — weekly groups, school work, and decades of building young queer community.',
    tier: 'Youth partner', since: 'Partnered since 2023 · 3 years',
    about: [
      <><strong>Rede ex aequo</strong> runs peer-support groups for LGBTQ+ young people across Portugal and trains facilitators to hold them safely. Their school-inclusion work reaches classrooms most networks never touch.</>,
      <>Our partnership keeps the under-18 work where it belongs — with the specialists. We channel volunteers and resources to them and keep a careful line between the adult network and youth spaces.</>,
    ],
    stats: [
      { value: <em>20+</em>, label: 'Years of youth work' },
      { value: '6', label: 'School programmes supported' },
      { value: '9', label: 'QP facilitators trained' },
      { value: <em>3</em>, label: 'Years partnered' },
    ],
    aboutMore: [
      { heading: 'What this partnership means in practice', body: <>QueerPulse members can train as Rede ex aequo youth facilitators (with full safeguarding checks), and we fund materials for their weekly groups. <em>Consistency is the whole intervention</em> — so we ask for a school year, not a season.</> },
      { heading: 'Where the boundaries are', body: <>All under-18 contact happens through Rede ex aequo's safeguarding framework, not ours. The adult network and the youth groups stay firmly separate.</> },
    ],
    jointWork: [
      { kicker: 'Live · since 2023', title: 'Youth facilitator pipeline', dek: 'QP members trained and vetted into the weekly youth-group facilitation rota.', footLeft: 'Recruiting', footRight: 'Before Sept' },
      { kicker: 'Ongoing', title: 'School-inclusion materials fund', dek: 'We fund printed materials for inclusion workshops across six Lisbon schools.', footLeft: 'Funded', footRight: '6 schools' },
      { kicker: 'Annual', title: 'Youth-to-network bridge', dek: 'Members ageing out of youth groups get a soft landing into the QP Youth Network.', footLeft: 'Open', footRight: '18–25' },
    ],
    timeline: [
      { date: '2 May 2026', title: 'Spring facilitator training', body: 'New cohort of QP volunteers completed safeguarding and facilitation training.' },
      { date: '14 Sep 2025', title: 'New school year, three groups', body: 'Three weekly Alcântara-area youth groups resourced for the 2025–26 year.', tint: 'jade' },
      { date: '20 Apr 2023', title: 'Youth partnership signed', body: 'Agreed the facilitator pipeline and the strict youth/adult separation.', tint: 'plum' },
    ],
    how: [
      { heading: 'Trained, vetted, consistent', body: <>Every facilitator passes an <strong>enhanced working-with-minors check</strong> and commits to a school year. Rede ex aequo supervises; we recruit and resource.</> },
      { heading: 'A clean line', body: <>The youth groups are not part of the QueerPulse platform. <em>We send people and money, not oversight.</em></> },
    ],
    funding: <><b>Funding transparency:</b> QueerPulse funds materials and training costs; Rede ex aequo retains full programme control. No youth data ever reaches the platform.</>,
    atGlance: [
      { label: 'Type', value: 'Youth association' },
      { label: 'Founded', value: '2003' },
      { label: 'HQ', value: 'Lisbon' },
      { label: 'Reach', value: 'Nationwide' },
      { label: 'Partner tier', value: 'Youth', accent: 'coral' },
      { label: 'Status', value: '● Active', accent: 'jade' },
    ],
    contact: { email: 'geral@rea.pt', website: 'rea.pt', address: 'Lisboa · groups nationwide' },
  },

  {
    slug: 'panteras-rosa', av: 'PR', logo: 'PR', bg: 'rgba(74,140,111,.14)', color: 'var(--jade)',
    region: 'pt', regionLabel: 'Portugal', name: 'Panteras Rosa', city: 'Lisbon',
    desc: 'Trans rights activism, political organising, and community visibility. The people doing the harder, slower, legislative work that enables everything else.',
    tags: ['Trans rights', 'Activism'],
    eyebrow: 'Partner · Activist front',
    tagline: 'A lean, fast trans-rights front doing the slow legislative work — and the same-day campaigns — that the rest of us rely on.',
    tier: 'Advocacy partner', since: 'Partnered since 2023 · 3 years',
    about: [
      <><strong>Panteras Rosa</strong> organises for trans rights — street presence, political pressure, and the unglamorous legislative grind. They move fast and run on almost nothing.</>,
      <>QueerPulse adds capacity: our members supply the comms muscle and turnout, and we amplify their campaigns to people who'd otherwise never see them.</>,
    ],
    stats: [
      { value: '11', label: 'Joint campaigns' },
      { value: '12', label: 'QP comms volunteers' },
      { value: <em>2</em>, label: 'Briefs co-signed' },
      { value: <em>3</em>, label: 'Years partnered' },
    ],
    aboutMore: [
      { heading: 'What this partnership means in practice', body: <>When a bad bill drops, Panteras Rosa briefs and QueerPulse mobilises — comms volunteers turn a one-line ask into posts and turnout the same day. <em>Attention is half the fight.</em></> },
      { heading: 'Where the boundaries are', body: <>Panteras Rosa sets the political line; we don't. We amplify, we don't author their positions, and we say so plainly when we differ.</> },
    ],
    jointWork: [
      { kicker: 'Live · ongoing', title: 'Rapid-response comms crew', dek: 'QP members on call to turn campaign briefs into shareable assets within hours.', footLeft: 'Async', footRight: '12 volunteers' },
      { kicker: 'Recurring', title: 'Turnout mobilisation', dek: 'We push verified actions and demos to members across Lisbon.', footLeft: 'Operational', footRight: 'Per campaign' },
      { kicker: 'Joint advocacy', title: 'Co-signed legislative briefs', dek: 'Two submissions to the Assembleia da República co-signed in the last two years.', footLeft: 'Filed', footRight: 'Public' },
    ],
    timeline: [
      { date: '28 Apr 2026', title: 'Same-day response to clinic-access bill', body: 'Comms crew produced and shipped a full campaign kit within six hours of the bill dropping.' },
      { date: '6 Nov 2025', title: '10th joint campaign', body: 'Passed ten co-run campaigns since the partnership began.', tint: 'jade' },
      { date: '11 Mar 2023', title: 'Advocacy partnership signed', body: 'Agreed the comms-and-turnout support model.', tint: 'plum' },
    ],
    how: [
      { heading: 'Brief, build, ship', body: <>Panteras Rosa writes the brief; our crew turns it around. <strong>No standing meetings</strong> — it lives in a group chat and a shared drive, and moves at the speed a campaign needs.</> },
      { heading: 'Their line, our reach', body: <>We amplify and mobilise. <em>The political positions are theirs.</em> When we disagree, we say so rather than smudging it.</> },
    ],
    funding: <><b>Funding transparency:</b> Wholly volunteer and reciprocal. No money changes hands; we contribute people and platform reach.</>,
    atGlance: [
      { label: 'Type', value: 'Activist front' },
      { label: 'Focus', value: 'Trans rights' },
      { label: 'HQ', value: 'Lisbon' },
      { label: 'Reach', value: 'Portugal' },
      { label: 'Partner tier', value: 'Advocacy', accent: 'coral' },
      { label: 'Status', value: '● Active', accent: 'jade' },
    ],
    contact: { email: 'contacto@panterasrosa.pt', website: 'panterasrosa.pt', address: 'Lisboa' },
  },

  {
    slug: 'queer-nation-madrid', av: 'QN', logo: 'QN', bg: 'rgba(232,119,90,.12)', color: 'var(--accent-ink)',
    region: 'eu', regionLabel: 'Europe', name: 'Queer Nation Madrid', city: 'Madrid',
    desc: 'A sister network to QueerPulse — queer professional community in Madrid with whom we share events, members, and the occasional borrowed studio. Iberian solidarity.',
    tags: ['Network', 'Sister city'],
    eyebrow: 'Partner · Sister network',
    tagline: 'Our sister network across the border — shared members, shared events, and a standing open door in Madrid.',
    tier: 'Sister network', since: 'Partnered since 2024 · 2 years',
    about: [
      <><strong>Queer Nation Madrid</strong> is a queer professional community much like ours, one train ride away. We built the partnership the obvious way: by visiting, sharing what worked, and borrowing each other's rooms.</>,
      <>For members it means a real welcome in the other city — events you can walk into, hosts who'll meet you, and a reciprocal directory pass.</>,
    ],
    stats: [
      { value: '1.1k', label: 'Madrid members' },
      { value: '14', label: 'Shared events run' },
      { value: <em>2</em>, label: 'Cities, one pass' },
      { value: <em>2</em>, label: 'Years partnered' },
    ],
    aboutMore: [
      { heading: 'What this partnership means in practice', body: <>Travelling to Madrid? Flip on a reciprocal directory pass and you're a guest of Queer Nation for the trip — events, hosts, and the same vetting standard. <em>It works in both directions.</em></> },
      { heading: 'Where the boundaries are', body: <>Two independent networks, two moderation teams. We share a welcome, not a database — guest access is opt-in and time-limited.</> },
    ],
    jointWork: [
      { kicker: 'Live · since 2024', title: 'Reciprocal directory pass', dek: 'Members visiting the other city get time-limited guest access to events and hosts.', footLeft: 'Opt-in', footRight: 'Both ways' },
      { kicker: 'Recurring', title: 'Iberian exchange evenings', dek: 'Joint socials alternating between Lisbon and Madrid.', footLeft: 'Quarterly', footRight: '14 held' },
      { kicker: 'Ongoing', title: 'Shared host playbook', dek: 'We swap what works on hosting, safety, and vetting — openly.', footLeft: 'Open', footRight: 'Living doc' },
    ],
    timeline: [
      { date: '19 Apr 2026', title: 'Spring exchange in Madrid', body: 'Forty Lisbon members travelled for a joint social and host swap.' },
      { date: '7 Sep 2025', title: 'Directory pass launched', body: 'Reciprocal guest access went live for both cities.', tint: 'jade' },
      { date: '5 Feb 2024', title: 'Sister-network agreement', body: 'Signed the reciprocal, opt-in partnership.', tint: 'plum' },
    ],
    how: [
      { heading: 'Guest, not merge', body: <>A reciprocal pass grants <strong>time-limited guest access</strong> in the other city. Profiles aren't shared wholesale — you opt in for the trip.</> },
      { heading: 'Open playbooks', body: <>We share what works on safety and hosting freely. <em>Solidarity is cheaper than reinventing it twice.</em></> },
    ],
    funding: <><b>Funding transparency:</b> No money changes hands. Costs of joint events are split per-event; everything else is reciprocal.</>,
    atGlance: [
      { label: 'Type', value: 'Sister network' },
      { label: 'City', value: 'Madrid' },
      { label: 'Members', value: '~1,100' },
      { label: 'Reach', value: 'Madrid metro' },
      { label: 'Partner tier', value: 'Sister', accent: 'coral' },
      { label: 'Status', value: '● Active', accent: 'jade' },
    ],
    contact: { email: 'hola@queernationmadrid.es', website: 'queernationmadrid.es', address: 'Madrid' },
  },

  {
    slug: 'stonewall-berlin', av: 'SB', logo: 'SB', bg: 'rgba(45,27,61,.08)', color: 'var(--plum)',
    region: 'eu', regionLabel: 'Europe', name: 'Stonewall Berlin', city: 'Berlin',
    desc: 'Community network and cultural organisation in Berlin. We collaborate on exchange programmes for members travelling between the cities.',
    tags: ['Cultural exchange', 'Network'],
    eyebrow: 'Partner · Cultural network',
    tagline: 'A Berlin community-and-culture network — our route into a bigger scene, and a welcome for members heading north.',
    tier: 'Exchange partner', since: 'Partnered since 2024 · 2 years',
    about: [
      <><strong>Stonewall Berlin</strong> runs community programming and a cultural calendar in a city with a deep queer history. Our partnership is built around exchange — of members, of artists, of ideas.</>,
      <>Members moving between Lisbon and Berlin get a soft landing: introductions, event access, and a residency swap for queer artists once a year.</>,
    ],
    stats: [
      { value: '12', label: 'Members relocated, supported' },
      { value: <em>2</em>, label: 'Artist residencies / year' },
      { value: '8', label: 'Cultural events shared' },
      { value: <em>2</em>, label: 'Years partnered' },
    ],
    aboutMore: [
      { heading: 'What this partnership means in practice', body: <>Relocating to Berlin, or just visiting? Stonewall Berlin gives you a contact, a calendar, and a room of people who get it. <em>The hardest part of moving is the first month — this shrinks it.</em></> },
      { heading: 'Where the boundaries are', body: <>Independent organisations, shared programmes. Exchange access is per-programme and opt-in; neither moderates the other.</> },
    ],
    jointWork: [
      { kicker: 'Annual', title: 'Queer artist residency swap', dek: 'Two artists a year swap cities for a funded residency.', footLeft: 'Funded', footRight: '2 / year' },
      { kicker: 'Ongoing', title: 'Relocation soft-landing', dek: 'Members moving north get introductions, a calendar, and event access.', footLeft: 'Open', footRight: '12 supported' },
      { kicker: 'Recurring', title: 'Shared cultural programming', dek: 'Co-promoted talks and showcases between the two cities.', footLeft: 'Seasonal', footRight: '8 events' },
    ],
    timeline: [
      { date: '3 Apr 2026', title: 'Spring residency exchange', body: 'Two artists began funded cross-city residencies.' },
      { date: '22 Oct 2025', title: 'Relocation programme passed 10', body: 'Ten members supported through a Berlin move.', tint: 'jade' },
      { date: '14 Mar 2024', title: 'Exchange partnership signed', body: 'Agreed the residency and relocation framework.', tint: 'plum' },
    ],
    how: [
      { heading: 'Exchange, by programme', body: <>Each strand — residency, relocation, programming — has its own opt-in. <strong>Nothing is automatic</strong>; you join the programme you need.</> },
      { heading: 'Two histories, one welcome', body: <>We don't pretend to share Berlin's scene. <em>We just make the door easy to find.</em></> },
    ],
    funding: <><b>Funding transparency:</b> The residency swap is jointly funded; relocation support is volunteer-run. No member data is shared.</>,
    atGlance: [
      { label: 'Type', value: 'Cultural network' },
      { label: 'City', value: 'Berlin' },
      { label: 'Focus', value: 'Culture & exchange' },
      { label: 'Reach', value: 'Berlin' },
      { label: 'Partner tier', value: 'Exchange', accent: 'coral' },
      { label: 'Status', value: '● Active', accent: 'jade' },
    ],
    contact: { email: 'hallo@stonewall-berlin.de', website: 'stonewall-berlin.de', address: 'Berlin' },
  },

  {
    slug: 'african-queer-creatives', av: 'AC', logo: 'AQC', bg: 'rgba(74,140,111,.12)', color: 'var(--jade)',
    region: 'int', regionLabel: 'International', name: 'African Queer Creatives', city: 'Nairobi / London',
    desc: 'Network supporting queer creatives of African origin globally. A reminder that the queer experience is not Western, and that solidarity requires listening.',
    tags: ['African diaspora', 'Creatives'],
    eyebrow: 'Partner · Global creative network',
    tagline: 'A global network for queer creatives of African origin — and a standing correction to the idea that queerness is Western.',
    tier: 'Solidarity partner', since: 'Partnered since 2025 · 1 year',
    about: [
      <><strong>African Queer Creatives</strong> supports queer artists of African origin across the diaspora — commissions, showcases, and a network that spans continents. Our partnership is the youngest on this page, and the one we most consciously approach as students.</>,
      <>In practice it means platforming their artists in Lisbon on their terms, paying properly, and listening more than we lead.</>,
    ],
    stats: [
      { value: '3', label: 'Lisbon showcases hosted' },
      { value: '11', label: 'Artists platformed' },
      { value: '100%', label: 'Artists paid' },
      { value: <em>1</em>, label: 'Year partnered' },
    ],
    aboutMore: [
      { heading: 'What this partnership means in practice', body: <>We host showcases and commissions for AQC artists in Lisbon — <strong>curated by them, paid in full</strong>. We provide the room and the audience; they provide the work and the terms.</> },
      { heading: 'Where the boundaries are', body: <>This is a solidarity partnership, not a pipeline. <em>We listen more than we lead</em>, and curatorial control stays with AQC.</> },
    ],
    jointWork: [
      { kicker: 'Recurring', title: 'Lisbon showcase series', dek: 'AQC-curated showcases of diaspora artists, hosted with the Rainbow Arts Collective.', footLeft: 'Seasonal', footRight: '3 held' },
      { kicker: 'Ongoing', title: 'Paid commissions', dek: 'Commissions for AQC artists — every one paid in full, no exceptions.', footLeft: 'Open', footRight: '11 artists' },
      { kicker: 'Editorial', title: 'Magazine features', dek: 'Long-form features and interviews led by AQC writers.', footLeft: 'Published', footRight: 'Ongoing' },
    ],
    timeline: [
      { date: '25 Apr 2026', title: 'Spring diaspora showcase', body: 'Five artists shown in a Marvila warehouse, fully funded.' },
      { date: '18 Jan 2026', title: 'Commission fund opened', body: 'A paid-commission strand launched for AQC artists.', tint: 'jade' },
      { date: '9 Jun 2025', title: 'Solidarity partnership signed', body: 'Agreed terms led by AQC, with curatorial control theirs.', tint: 'plum' },
    ],
    how: [
      { heading: 'Their terms, our room', body: <>AQC curates and sets the terms; we provide space, audience, and budget. <strong>Every artist is paid in full.</strong></> },
      { heading: 'Listening first', body: <>We approach this as students. <em>Solidarity that doesn't listen is just branding.</em></> },
    ],
    funding: <><b>Funding transparency:</b> QueerPulse funds showcases and commissions; AQC keeps curatorial and editorial control. Artists are always paid.</>,
    atGlance: [
      { label: 'Type', value: 'Creative network' },
      { label: 'Bases', value: 'Nairobi / London' },
      { label: 'Focus', value: 'Diaspora arts' },
      { label: 'Reach', value: 'Global' },
      { label: 'Partner tier', value: 'Solidarity', accent: 'coral' },
      { label: 'Status', value: '● Active', accent: 'jade' },
    ],
    contact: { email: 'hello@africanqueercreatives.org', website: 'africanqueercreatives.org', address: 'Nairobi · London' },
  },

  {
    slug: 'queer-migrants-portugal', av: 'QM', logo: 'QM', bg: 'rgba(232,119,90,.1)', color: 'var(--accent-ink)',
    region: 'eu', regionLabel: 'Europe', name: 'Queer Migrants Portugal', city: 'Lisbon',
    desc: 'Support and advocacy for LGBTQ+ migrants and refugees navigating the Portuguese immigration system. We refer members to them, they refer people to us.',
    tags: ['Migration', 'Refugees'],
    eyebrow: 'Partner · Migrant support',
    tagline: 'Support and advocacy for queer migrants and refugees — and the people who actually understand the asylum maze.',
    tier: 'Support partner', since: 'Partnered since 2024 · 2 years',
    about: [
      <><strong>Queer Migrants Portugal</strong> helps LGBTQ+ migrants and refugees through the immigration and asylum system — legal aid, housing leads, and a community that speaks your language.</>,
      <>The partnership is a two-way referral seam: we send members who need specialist help, they connect newly-arrived people to community and events.</>,
    ],
    stats: [
      { value: '140+', label: 'People referred both ways' },
      { value: '5', label: 'Languages at intake' },
      { value: '2', label: 'Arrivals clinics supported' },
      { value: <em>2</em>, label: 'Years partnered' },
    ],
    aboutMore: [
      { heading: 'What this partnership means in practice', body: <>A member facing a visa or asylum problem gets a warm introduction to QMP's caseworkers. A newly-arrived person who finds QMP first gets pointed toward community here. <em>Every referral is a route someone has walked.</em></> },
      { heading: 'Where the boundaries are', body: <>QMP handles the legal casework; we don't. Immigration status data never touches the platform.</> },
    ],
    jointWork: [
      { kicker: 'Live · since 2024', title: 'Two-way referral pathway', dek: 'Warm introductions both directions — members to caseworkers, arrivals to community.', footLeft: 'Operational', footRight: '140+ referrals' },
      { kicker: 'Recurring', title: 'Multilingual arrivals clinic', dek: 'We support QMP\'s regular clinic for newly-landed queer migrants.', footLeft: 'Open', footRight: 'Monthly' },
      { kicker: 'Ongoing', title: 'Housing-lead sharing', dek: 'Queer-friendly housing leads shared with the Housing Justice Network.', footLeft: 'Open', footRight: 'Living list' },
    ],
    timeline: [
      { date: '11 Apr 2026', title: 'Arrivals clinic scaled up', body: 'Monthly multilingual clinic now covers five languages at intake.' },
      { date: '3 Dec 2025', title: '100th two-way referral', body: 'Passed one hundred people connected in both directions.', tint: 'jade' },
      { date: '16 Feb 2024', title: 'Support partnership signed', body: 'Agreed the referral seam and data boundaries.', tint: 'plum' },
    ],
    how: [
      { heading: 'Two-way, consent-first', body: <>Referrals move both directions and only with consent. <strong>Immigration status never reaches the platform</strong> — it stays in QMP's casework.</> },
      { heading: 'Specialists do the casework', body: <>We connect and resource; QMP advises. <em>The legal maze needs people who live in it.</em></> },
    ],
    funding: <><b>Funding transparency:</b> QueerPulse supports clinic costs; casework is QMP's own. No status or identity data is shared.</>,
    atGlance: [
      { label: 'Type', value: 'Migrant support' },
      { label: 'Focus', value: 'Migration & asylum' },
      { label: 'HQ', value: 'Lisbon' },
      { label: 'Reach', value: 'Portugal' },
      { label: 'Partner tier', value: 'Support', accent: 'coral' },
      { label: 'Status', value: '● Active', accent: 'jade' },
    ],
    contact: { email: 'ola@queermigrants.pt', website: 'queermigrants.pt', address: 'Lisboa' },
  },
]

export function getPartner(slug: string | undefined): Partner | undefined {
  return slug ? PARTNERS.find((p) => p.slug === slug) : undefined
}
