import { useMemo, useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { Avatar, Button, Reveal } from '../../shared/components/ui'
import type { AvatarTint } from '../../shared/components/ui/Avatar'
import { useToast } from '../../shared/components/feedback/useToast'
import { memberProfiles } from '../members/data/memberProfiles'
import styles from './BarterPage.module.css'

type Mode = 'offering' | 'seeking' | 'both'

interface Barter {
  id: string
  member?: string
  name?: string
  initials?: string
  tint?: AvatarTint
  hood?: string
  cat: string
  mode: Mode
  offer: string
  want: string
  offerDetail: string
  wantDetail: string
  tags: string[]
  days: number
}

const BARTERS: Barter[] = [
  { id: 'b1', member: 'ines', cat: 'creative', mode: 'both', offer: 'Brand identity design', want: 'Portuguese tax return help', offerDetail: 'Logo, type, colour — full brand for a small project or solo practice. Up to 3 rounds of revisions.', wantDetail: 'My imposto IRS is a mess. Two hours of your time, I give you a visual identity.', tags: ['design', 'branding', 'visual identity'], days: 3 },
  { id: 'b2', member: 'sofia', cat: 'creative', mode: 'both', offer: 'Short film editing (Premiere, DaVinci)', want: 'Legal advice on self-employment contracts', offerDetail: 'Rough cut to final export. Up to 15 minutes. I work fast and I listen.', wantDetail: 'Freelance contract review, recibos verdes questions. Nothing complicated — I just need someone who knows.', tags: ['video', 'editing', 'post-production'], days: 5 },
  { id: 'b3', member: 'andre', cat: 'creative', mode: 'offering', offer: 'Portrait session — analog, medium format', want: '', offerDetail: 'One roll of film, developed and scanned. For members who have never had a proper portrait. I will not make you uncomfortable.', wantDetail: '', tags: ['photography', 'film', 'portrait'], days: 1 },
  { id: 'b4', member: 'rui', cat: 'tech', mode: 'both', offer: 'Website build or debug (React, vanilla JS)', want: 'Cooking lessons or a meal', offerDetail: 'Two to four hours of real engineering help. Bugs, architecture, code review, building something from scratch.', wantDetail: 'I can code but I cannot cook. One proper meal or two lessons with someone who actually knows what they are doing.', tags: ['web dev', 'javascript', 'react'], days: 8 },
  { id: 'b5', member: 'carla', cat: 'tech', mode: 'seeking', offer: '', want: "UX feedback on a product I'm building", offerDetail: '', wantDetail: 'I have a prototype. I need two hours with someone who will actually use it and tell me what is wrong.', tags: ['UX', 'product', 'feedback'], days: 2 },
  { id: 'b6', name: 'Miguel F.', initials: 'MF', tint: 'jade', hood: 'Intendente', cat: 'tech', mode: 'offering', offer: 'Linux server setup and sysadmin', want: '', offerDetail: 'VPS, self-hosted services, email, backups. If you want to own your own infrastructure I can help you get there.', wantDetail: '', tags: ['linux', 'sysadmin', 'self-hosting'], days: 12 },
  { id: 'b7', name: 'Beatriz M.', initials: 'BM', tint: 'plum', hood: 'Graça', cat: 'legal', mode: 'both', offer: 'NHR and visa paperwork help (PT law)', want: 'Massage or bodywork', offerDetail: 'I have been through the NHR process, the D7 visa, the residency renewal. I know the forms.', wantDetail: 'I am a lawyer with a very bad back. I want proper hands-on bodywork. At least two sessions.', tags: ['visas', 'NHR', 'immigration', 'tax'], days: 6 },
  { id: 'b8', name: 'Tiago R.', initials: 'TR', tint: 'coral', hood: 'Mouraria', cat: 'legal', mode: 'offering', offer: 'Contract translation PT ↔ EN', want: '', offerDetail: 'Bilingual lawyer. I will translate and summarise any contract up to 10 pages. Plain language, fast turnaround.', wantDetail: '', tags: ['translation', 'contracts', 'legal'], days: 4 },
  { id: 'b9', member: 'mariana', cat: 'care', mode: 'offering', offer: 'Psychotherapy session (sliding scale barter)', want: '', offerDetail: 'One session, exchange for something useful to me. I work in Portuguese and English. Not crisis intervention.', wantDetail: '', tags: ['therapy', 'mental health', 'wellbeing'], days: 9 },
  { id: 'b10', name: 'Catarina L.', initials: 'CL', tint: 'jade', hood: 'Alfama', cat: 'care', mode: 'both', offer: 'Yoga and breathwork (1:1 or small group)', want: 'Graphic design for my practice', offerDetail: 'Trauma-informed, queer-affirming, body-neutral. All levels. I come to you if you have space.', wantDetail: 'A simple logo and one-page PDF. Something I can send to people. Clean, not corporate.', tags: ['yoga', 'breathwork', 'body-neutral'], days: 14 },
  { id: 'b11', name: 'Pedro V.', initials: 'PV', tint: 'coral', hood: 'Santos', cat: 'care', mode: 'seeking', offer: '', want: 'Haircut — someone trans-competent, not expensive', offerDetail: '', wantDetail: 'In exchange I offer two hours of furniture assembly, moving help, or general muscle-use.', tags: ['haircut', 'trans', 'grooming'], days: 1 },
  { id: 'b12', member: 'tomas', cat: 'food', mode: 'both', offer: 'A dinner for two, cooked properly', want: 'Photography of the dishes', offerDetail: 'Seasonal, no menu in advance. I cook what is good that week. Wine included.', wantDetail: 'I want actual photographs of the food, not phone photos. Someone who knows about light.', tags: ['cooking', 'dinner', 'food'], days: 7 },
  { id: 'b13', name: 'Joana S.', initials: 'JS', tint: 'jade', hood: 'Príncipe Real', cat: 'food', mode: 'offering', offer: 'Natural wine tasting and education (up to 4 people)', want: '', offerDetail: 'Two hours, six wines, no performance. I worked in wine for eight years. This is for people who want to actually learn.', wantDetail: '', tags: ['wine', 'food', 'education'], days: 11 },
  { id: 'b14', name: 'Kiko M.', initials: 'KM', tint: 'plum', hood: 'Marvila', cat: 'body', mode: 'both', offer: 'Capoeira basics (up to 4 sessions)', want: 'Web presence — something simple', offerDetail: 'Not performance capoeira. Movement, music, community. No experience needed. I teach slowly.', wantDetail: 'A single page with my bio, a contact form, and a photo. I do not know how to do it myself.', tags: ['capoeira', 'movement', 'body'], days: 3 },
  { id: 'b15', name: 'Rafa D.', initials: 'RD', tint: 'coral', hood: 'Cais do Sodré', cat: 'body', mode: 'seeking', offer: '', want: 'Running buddy — 3× per week, Ribeira', offerDetail: '', wantDetail: 'In return: I speak four languages and will tutor you in any of them for the same number of hours.', tags: ['running', 'fitness', 'outdoors'], days: 5 },
]

const MODES: { value: 'all' | Mode; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'offering', label: 'Offering' },
  { value: 'seeking', label: 'Seeking' },
]
const CATS = [
  { value: 'all', label: 'All categories' },
  { value: 'creative', label: 'Creative' },
  { value: 'tech', label: 'Tech' },
  { value: 'legal', label: 'Legal & admin' },
  { value: 'care', label: 'Care & health' },
  { value: 'food', label: 'Food & hosting' },
  { value: 'body', label: 'Body & movement' },
]
const BADGE: Record<Mode, string> = { offering: 'Offering', seeking: 'Seeking', both: 'Offering & seeking' }

function memberInfo(b: Barter) {
  if (b.member && memberProfiles[b.member]) {
    const m = memberProfiles[b.member]
    return { name: `${m.first} ${m.last}`, initials: m.initials, tint: m.tint, hood: m.hood }
  }
  return { name: b.name ?? '—', initials: b.initials ?? '?', tint: b.tint ?? 'jade', hood: b.hood ?? '' }
}

export function BarterPage() {
  const { showToast } = useToast()
  const [mode, setMode] = useState<'all' | Mode>('all')
  const [cat, setCat] = useState('all')
  const [query, setQuery] = useState('')

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return BARTERS.filter((b) => {
      if (mode === 'offering' && b.mode === 'seeking') return false
      if (mode === 'seeking' && b.mode === 'offering') return false
      if (cat !== 'all' && b.cat !== cat) return false
      if (q) {
        const hay = (b.offer + b.want + b.offerDetail + b.wantDetail + b.tags.join(' ')).toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [mode, cat, query])

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            Skills Exchange
          </Reveal>
          <Reveal as="h1" delay={60}>
            Skills are <em>the currency.</em>
          </Reveal>
          <Reveal as="p" delay={120}>
            A structured barter board — skills for skills, expertise for expertise. No money, no
            platform fees. Post what you can offer and what you're hoping for in return.
          </Reveal>
        </div>
      </div>

      <div className={styles.controls}>
        <div className="wrap">
          <div className={styles.controlsRow}>
            <input
              className={styles.search}
              type="text"
              placeholder="Search the exchange…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className={styles.modeTabs}>
              {MODES.map((m) => (
                <button
                  key={m.value}
                  className={[styles.modeTab, mode === m.value && styles.modeTabActive].filter(Boolean).join(' ')}
                  onClick={() => setMode(m.value)}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <span className={styles.count}>
              <b>{items.length}</b> post{items.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className={styles.cats}>
            {CATS.map((c) => (
              <button
                key={c.value}
                className={[styles.chip, cat === c.value && styles.chipActive].filter(Boolean).join(' ')}
                onClick={() => setCat(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            {items.length === 0 && (
              <div className={styles.empty}>Nothing matches — try broadening the filters.</div>
            )}
            {items.map((b) => {
              const info = memberInfo(b)
              return (
                <article key={b.id} className={styles.bc}>
                  <div className={styles.bcHead}>
                    <Avatar initials={info.initials} tint={info.tint} size={40} />
                    <div className={styles.bcMeta}>
                      <div className={styles.bcName}>{info.name}</div>
                      <div className={styles.bcHood}>{info.hood}</div>
                    </div>
                    <span className={`${styles.bcBadge} ${styles[b.mode]}`}>{BADGE[b.mode]}</span>
                  </div>
                  {b.offer && (
                    <div className={`${styles.bcBlock} ${styles.bcOffer}`}>
                      <div className={styles.bcLabel}>Offering</div>
                      <div className={styles.bcSkill}>{b.offer}</div>
                      <div className={styles.bcDesc}>{b.offerDetail}</div>
                    </div>
                  )}
                  {b.want && (
                    <div className={`${styles.bcBlock} ${styles.bcWant}`}>
                      <div className={styles.bcLabel}>Looking for</div>
                      <div className={styles.bcSkill}>{b.want}</div>
                      <div className={styles.bcDesc}>{b.wantDetail}</div>
                    </div>
                  )}
                  <div className={styles.btags}>
                    {b.tags.map((tag) => (
                      <span key={tag} className={styles.btag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className={styles.bcFoot}>
                    <span className={styles.bcDays}>{b.days === 1 ? 'Today' : `${b.days} days ago`}</span>
                    <button className={styles.bcReach} onClick={() => showToast(`Message sent to ${info.name}`, 'success')}>
                      Propose a swap →
                    </button>
                  </div>
                </article>
              )
            })}
          </div>

          <div className={styles.postStrip}>
            <div>
              <h3>
                Put something <em>on the table.</em>
              </h3>
              <p>Every exchange starts with a post. Tell the community what you can offer and what you're hoping for in return.</p>
            </div>
            <form
              className={styles.psForm}
              onSubmit={(e) => {
                e.preventDefault()
                showToast('Posted to the exchange', 'success')
              }}
            >
              <input className={styles.psInput} placeholder="I can offer — e.g. Portuguese lessons, logo design…" />
              <input className={styles.psInput} placeholder="I'm looking for — e.g. tax advice, moving help…" />
              <Button type="submit">Post to the exchange →</Button>
            </form>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
