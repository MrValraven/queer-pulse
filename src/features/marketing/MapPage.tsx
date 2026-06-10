import { useMemo, useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import s from './MapPage.module.css'

interface Bairro {
  name: string
  path: string
  fill: string
  stroke: string
  lx: number
  ly: number
  bx: number
  by: number
}

const BAIRROS: Bairro[] = [
  { name: 'LX Factory', path: 'M 10 400 C 18 390 42 383 76 380 L 120 377 L 126 408 C 122 432 120 454 119 458 L 52 460 L 12 454 Z', fill: '#D6C8B5', stroke: '#C0B09E', lx: 67, ly: 421, bx: 122, by: 382 },
  { name: 'Santos', path: 'M 118 360 C 130 350 162 344 204 342 L 216 372 C 213 398 210 430 207 458 L 176 460 L 112 456 C 110 432 114 388 118 360 Z', fill: '#CEDFC6', stroke: '#B0CAA4', lx: 164, ly: 408, bx: 214, by: 360 },
  { name: 'Cais do Sodré', path: 'M 202 328 C 224 318 268 313 312 315 L 326 353 C 322 382 318 430 314 458 L 288 460 L 198 455 C 196 428 198 366 202 328 Z', fill: '#D8E8CF', stroke: '#B8D0B0', lx: 258, ly: 402, bx: 316, by: 356 },
  { name: 'Bairro Alto', path: 'M 128 250 C 146 234 192 228 230 232 L 244 264 C 241 294 237 334 236 350 L 202 364 C 176 358 154 355 140 351 L 128 315 Z', fill: '#EAD9C8', stroke: '#D0C0B0', lx: 186, ly: 297, bx: 232, by: 300 },
  { name: 'Príncipe Real', path: 'M 122 168 C 142 155 184 150 230 153 L 250 185 C 247 211 244 240 242 258 L 216 270 C 186 270 156 268 130 263 L 120 227 Z', fill: '#F2D9C8', stroke: '#D8C0B0', lx: 185, ly: 211, bx: 236, by: 214 },
  { name: 'Mouraria', path: 'M 270 185 C 292 176 336 172 386 176 L 398 212 C 395 250 390 292 388 306 L 356 320 C 326 316 294 311 266 307 L 257 270 Z', fill: '#E2D0E9', stroke: '#C8B8D4', lx: 329, ly: 248, bx: 392, by: 252 },
  { name: 'Intendente', path: 'M 262 107 C 284 97 334 93 382 97 L 396 131 C 396 156 396 176 395 190 L 264 197 L 255 162 Z', fill: '#DAEADD', stroke: '#BAD0BC', lx: 328, ly: 148, bx: 393, by: 151 },
  { name: 'Alfama', path: 'M 376 208 C 404 199 452 194 498 198 L 513 262 C 510 308 506 350 502 364 L 460 393 C 432 384 402 378 378 372 L 358 318 L 364 265 Z', fill: '#EBE0C8', stroke: '#D0CAB0', lx: 436, ly: 293, bx: 500, by: 295 },
]

interface Venue {
  id: string
  name: string
  bairro: string
  type: string
  vibe: string[]
  accessible: boolean
  address: string
  hours: string
  note: string
  beenHere: number
}

const VENUES: Venue[] = [
  { id: 'v1', name: 'Finalmente', bairro: 'Príncipe Real', type: 'bar', vibe: ['mixed', 'masc-leaning'], accessible: true, address: 'Rua da Palmeira 38', hours: '11pm – 6am', note: 'The longest-running queer bar in Lisbon. Come for the drag shows on weekends — they are unmissable.', beenHere: 247 },
  { id: 'v2', name: 'Trumps', bairro: 'Príncipe Real', type: 'club', vibe: ['mixed'], accessible: false, address: 'Rua da Imprensa Nacional 104B', hours: 'Thu–Sat 11pm – 6am', note: 'The closest thing Lisbon has to a legendary queer institution. Three rooms, one very good time.', beenHere: 189 },
  { id: 'v3', name: 'Bar 106', bairro: 'Príncipe Real', type: 'bar', vibe: ['mixed', 'masc-leaning'], accessible: true, address: 'Rua de São Marçal 106', hours: '9pm – 2am', note: 'Low-key and brilliant. The best place to start a Príncipe Real evening before it gets loud.', beenHere: 134 },
  { id: 'v4', name: 'Hot Clube de Portugal', bairro: 'Príncipe Real', type: 'café', vibe: ['mixed', 'sober-friendly'], accessible: false, address: 'Praça da Alegria 48', hours: 'Tue–Sat 10pm – 2am', note: 'Historic jazz club, wholly queer-welcoming and entirely its own thing.', beenHere: 71 },
  { id: 'v5', name: 'Ler Devagar', bairro: 'LX Factory', type: 'bookshop', vibe: ['mixed'], accessible: true, address: 'Rua Rodrigues de Faria 103', hours: 'Mon–Fri 11am – 8pm · weekends 10am – 9pm', note: 'The most beautiful bookshop in Lisbon. Not exclusively queer but completely welcoming.', beenHere: 156 },
  { id: 'v6', name: 'GAT Lisboa', bairro: 'Mouraria', type: 'clinic', vibe: ['mixed', 'trans-centred'], accessible: true, address: 'Rua de São Lázaro 58', hours: 'Mon–Fri 9am – 5pm', note: 'Free HIV and STI testing, trans health support, harm reduction. No judgment, no referral needed.', beenHere: 78 },
  { id: 'v7', name: 'Tasca do Chico', bairro: 'Mouraria', type: 'café', vibe: ['mixed', 'sober-friendly'], accessible: false, address: 'Rua do Diário de Notícias 39', hours: 'Mon–Sat 7pm – midnight', note: 'Fado and petiscos. Not queer-specific but genuinely feels like home.', beenHere: 203 },
  { id: 'v8', name: 'Casa Qui', bairro: 'Mouraria', type: 'community space', vibe: ['mixed', 'trans-centred', 'femme-leaning'], accessible: true, address: 'Largo do Intendente 27', hours: 'Tue–Sat 11am – 7pm', note: 'Queer community centre with events, legal support, and a library. Always something on.', beenHere: 88 },
  { id: 'v9', name: 'ILGA Portugal', bairro: 'Intendente', type: 'community space', vibe: ['mixed', 'trans-centred'], accessible: true, address: 'Rua dos Fanqueiros 38', hours: 'Mon–Fri 10am – 6pm', note: 'The main LGBTQ+ organisation in Portugal. Legal support, mental health, community programmes.', beenHere: 112 },
  { id: 'v10', name: 'Purex', bairro: 'Intendente', type: 'club', vibe: ['mixed', 'femme-leaning'], accessible: false, address: 'Rua das Salgadeiras 28', hours: 'Fri–Sat midnight – 6am', note: 'One of the most genuinely queer clubs in Lisbon. Eclectic music, no attitude.', beenHere: 143 },
  { id: 'v11', name: 'Opus Gay', bairro: 'Bairro Alto', type: 'bar', vibe: ['mixed', 'masc-leaning'], accessible: true, address: 'Rua da Atalaia 34', hours: 'Mon–Sat 10pm – 4am', note: 'Relaxed bar with a good terrace. Solid middle ground between loud and quiet.', beenHere: 119 },
  { id: 'v12', name: 'Shelter', bairro: 'Bairro Alto', type: 'club', vibe: ['masc-leaning'], accessible: false, address: 'Rua da Barroca 33', hours: 'Fri–Sat 11pm – 6am', note: 'Cruisy, dark, electronic. Knows exactly what it is.', beenHere: 98 },
  { id: 'v13', name: 'Checkpoint', bairro: 'Cais do Sodré', type: 'clinic', vibe: ['mixed', 'masc-leaning'], accessible: true, address: 'Rua do Crucifixo 100', hours: 'Mon–Fri 1pm – 8pm', note: 'Community-led HIV/STI testing and PrEP support. Walk-ins welcome.', beenHere: 67 },
  { id: 'v14', name: 'Sauna Saturno', bairro: 'Santos', type: 'sauna', vibe: ['masc-leaning'], accessible: true, address: 'Rua de Santos-o-Velho 14', hours: 'Daily 2pm – midnight', note: 'Clean, friendly, no pressure. Trans men welcome. Towel and locker included.', beenHere: 54 },
  { id: 'v15', name: 'A Cevicheria', bairro: 'Príncipe Real', type: 'café', vibe: ['mixed', 'sober-friendly'], accessible: true, address: 'Rua Dom Pedro V 129', hours: 'Mon–Sat 12pm – midnight', note: 'Not queer-specific but one of the most welcoming spots in Príncipe Real. Great natural wine list.', beenHere: 165 },
  { id: 'v16', name: 'Navalha', bairro: 'Príncipe Real', type: 'barbershop', vibe: ['mixed', 'masc-leaning', 'trans-centred'], accessible: true, address: 'Rua da Escola Politécnica 62', hours: 'Tue–Sat 10am – 7pm', note: 'Queer-owned barbershop with real expertise in trans haircuts. No awkward questions, no gendered pricing.', beenHere: 184 },
  { id: 'v17', name: 'Salão Mouraria', bairro: 'Mouraria', type: 'barbershop', vibe: ['mixed', 'femme-leaning'], accessible: false, address: 'Rua do Capelão 22', hours: 'Mon–Sat 9am – 6pm', note: 'Neighbourhood salon that became a queer anchor without fuss. Bilingual, trans-welcoming, affordable.', beenHere: 97 },
  { id: 'v18', name: 'Studio Cabelo', bairro: 'Intendente', type: 'barbershop', vibe: ['mixed'], accessible: true, address: 'Largo do Intendente 4', hours: 'Tue–Sat 11am – 8pm', note: 'Gender-neutral pricing across the board. They will not charge you more because of your hair length.', beenHere: 122 },
  { id: 'v19', name: 'A Tesoura', bairro: 'Santos', type: 'barbershop', vibe: ['femme-leaning', 'mixed'], accessible: false, address: 'Rua de Santos-o-Velho 8', hours: 'Wed–Sun 10am – 6pm', note: 'Small queer-run salon. Specialises in curly and natural hair. Known in the trans femme community for getting it right.', beenHere: 76 },
  { id: 'v20', name: 'Academia Livre', bairro: 'Cais do Sodré', type: 'gym', vibe: ['mixed', 'trans-centred'], accessible: true, address: 'Rua do Alecrim 44', hours: 'Mon–Fri 7am – 10pm · Sat–Sun 9am – 6pm', note: 'The most trans-inclusive gym in the city. Gender-neutral changing rooms on every floor, pronoun lanyards at reception.', beenHere: 143 },
  { id: 'v21', name: 'Corpo Livre', bairro: 'Bairro Alto', type: 'gym', vibe: ['mixed', 'femme-leaning'], accessible: false, address: 'Rua Nova do Carvalho 18', hours: 'Mon–Fri 8am – 9pm · Sat 9am – 5pm', note: 'Feminist and queer-centred fitness space. Small classes, no mirrors, no weight scales. Body-neutral by design.', beenHere: 88 },
  { id: 'v22', name: 'Clube Intendente', bairro: 'Intendente', type: 'gym', vibe: ['mixed'], accessible: true, address: 'Rua do Benformoso 191', hours: 'Mon–Sat 7am – 10pm', note: 'Community gym with a genuinely welcoming culture. Queer swim sessions on Thursdays 7–9pm.', beenHere: 61 },
  { id: 'v23', name: 'Movimento', bairro: 'Alfama', type: 'gym', vibe: ['mixed', 'masc-leaning'], accessible: true, address: 'Rua dos Remedios 52', hours: 'Daily 8am – 10pm', note: 'Yoga, capoeira, and weights in a converted warehouse. Queer-run, sliding-scale memberships available.', beenHere: 54 },
]

const TYPES = [
  { t: 'all', label: 'All' },
  { t: 'bar', label: 'Bar' },
  { t: 'club', label: 'Club' },
  { t: 'café', label: 'Café' },
  { t: 'clinic', label: 'Clinic' },
  { t: 'bookshop', label: 'Bookshop' },
  { t: 'sauna', label: 'Sauna' },
  { t: 'community space', label: 'Community' },
  { t: 'barbershop', label: 'Barbershop / Salon' },
  { t: 'gym', label: 'Gym / Fitness' },
]
const VIBES = ['mixed', 'masc-leaning', 'femme-leaning', 'trans-centred', 'sober-friendly']

const TYPE_BG: Record<string, string> = { bar: 'rgba(232,119,90,.14)', club: 'rgba(45,27,61,.1)', café: 'rgba(74,140,111,.12)', clinic: 'rgba(74,140,111,.14)', bookshop: 'rgba(232,119,90,.1)', sauna: 'rgba(45,27,61,.08)', 'community space': 'rgba(74,140,111,.14)', barbershop: 'rgba(185,130,80,.15)', gym: 'rgba(80,120,185,.13)' }
const TYPE_FG: Record<string, string> = { bar: 'var(--accent-ink)', club: 'var(--plum)', café: 'var(--jade)', clinic: 'var(--jade)', bookshop: 'var(--accent-ink)', sauna: 'var(--ink-60)', 'community space': 'var(--jade)', barbershop: '#9A6820', gym: '#3A5EA0' }
const TYPE_ICON: Record<string, string> = { bar: '▮', club: '◉', café: '○', clinic: '+', bookshop: '◻', sauna: '〜', 'community space': '⬡', barbershop: '✂', gym: '◈' }
const VIBE_BG: Record<string, string> = { mixed: 'rgba(45,27,61,.06)', 'masc-leaning': 'rgba(45,27,61,.09)', 'femme-leaning': 'rgba(232,119,90,.09)', 'trans-centred': 'rgba(74,140,111,.1)', 'sober-friendly': 'rgba(74,140,111,.08)' }
const VIBE_FG: Record<string, string> = { mixed: 'var(--ink-60)', 'masc-leaning': 'var(--ink-60)', 'femme-leaning': 'var(--accent-ink)', 'trans-centred': 'var(--jade)', 'sober-friendly': 'var(--jade)' }

export function MapPage() {
  const [bairro, setBairro] = useState<string | null>(null)
  const [type, setType] = useState('all')
  const [vibes, setVibes] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [been, setBeen] = useState<Record<string, number>>({})

  const items = useMemo(
    () =>
      VENUES.filter((v) => {
        if (bairro && v.bairro !== bairro) return false
        if (type !== 'all' && v.type !== type) return false
        if (vibes.length && !vibes.some((f) => v.vibe.includes(f))) return false
        return true
      }),
    [bairro, type, vibes],
  )

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    items.forEach((v) => {
      c[v.bairro] = (c[v.bairro] ?? 0) + 1
    })
    return c
  }, [items])

  function toggleVibe(v: string) {
    setVibes((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]))
    setExpanded(null)
  }
  function selectBairro(name: string | null) {
    setBairro(name)
    setExpanded(null)
  }

  // Group by bairro when none selected
  const groups = useMemo(() => {
    if (bairro) return null
    const g: { bairro: string; venues: Venue[] }[] = []
    items.forEach((v) => {
      let grp = g.find((x) => x.bairro === v.bairro)
      if (!grp) {
        grp = { bairro: v.bairro, venues: [] }
        g.push(grp)
      }
      grp.venues.push(v)
    })
    return g
  }, [items, bairro])

  function VenueCard({ v }: { v: Venue }) {
    const isExp = expanded === v.id
    const beenCount = been[v.id] ?? v.beenHere
    const marked = been[v.id] !== undefined
    return (
      <div className={[s.vc, isExp && s.vcExpanded].filter(Boolean).join(' ')} onClick={() => setExpanded(isExp ? null : v.id)}>
        <div className={s.vcHead}>
          <span className={s.vcIcon} style={{ background: TYPE_BG[v.type], color: TYPE_FG[v.type] }}>
            {TYPE_ICON[v.type]}
          </span>
          <div className={s.vcInfo}>
            <div className={s.vcName}>{v.name}</div>
            <div className={s.vcBairro}>{v.bairro}</div>
          </div>
          <div className={s.vcRight}>
            <span className={s.vcTypeTag} style={{ background: TYPE_BG[v.type], color: TYPE_FG[v.type] }}>
              {v.type}
            </span>
            {v.accessible && <span className={s.vcAccess}>♿</span>}
          </div>
        </div>
        <div className={s.vcVibes}>
          {v.vibe.map((t) => (
            <span key={t} className={s.vt} style={{ background: VIBE_BG[t], color: VIBE_FG[t] }}>
              {t}
            </span>
          ))}
        </div>
        {isExp && (
          <div className={s.vcBody}>
            <div className={s.vcRow}>
              <span className={s.vcRowIcon}>📍</span>
              <span>{v.address}</span>
            </div>
            <div className={s.vcRow}>
              <span className={s.vcRowIcon}>◷</span>
              <span>{v.hours}</span>
            </div>
            <div className={s.vcNote}>{v.note}</div>
            <div className={s.vcBeenRow}>
              <div className={s.beenCount}>
                <b>{beenCount}</b> people been here
              </div>
              <button
                className={[s.beenBtn, marked && s.beenDone].filter(Boolean).join(' ')}
                onClick={(e) => {
                  e.stopPropagation()
                  if (!marked) setBeen((cur) => ({ ...cur, [v.id]: v.beenHere + 1 }))
                }}
              >
                {marked ? '✓ Been there' : "I've been here"}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <PageShell>
      <header className={s.hero}>
        <div className="wrap">
          <div className={s.eye}>Lisbon · Community guide</div>
          <h1>
            The queer <em>city guide</em>
          </h1>
          <p>Bars, clubs, cafés, clinics, bookshops, saunas and community spaces — mapped by people who've actually been there.</p>
          <div className={s.stats}>
            <div className={s.stat}>
              <b>23</b>
              <span>venues listed</span>
            </div>
            <div className={s.stat}>
              <b>8</b>
              <span>neighbourhoods</span>
            </div>
            <div className={s.stat}>
              <b>Community</b>
              <span>maintained</span>
            </div>
          </div>
        </div>
      </header>

      <div className={s.filterBar}>
        <div className="wrap">
          <div className={s.fbInner}>
            <span className={s.fbLabel}>Type</span>
            {TYPES.map((t) => (
              <button key={t.t} className={[s.chip, type === t.t && s.chipOn].filter(Boolean).join(' ')} onClick={() => { setType(t.t); setExpanded(null) }}>
                {t.label}
              </button>
            ))}
            <span className={s.fbSep} />
            <span className={s.fbLabel}>Vibe</span>
            {VIBES.map((v) => (
              <button key={v} className={[s.chip, s.vibe, vibes.includes(v) && s.chipOn].filter(Boolean).join(' ')} onClick={() => toggleVibe(v)}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className={s.body}>
          <div className={s.mapPanel}>
            <svg viewBox="0 0 580 520" className={s.svg} xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="sketch" x="-5%" y="-5%" width="110%" height="110%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={2} result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
                </filter>
                <pattern id="waterLines" x="0" y="0" width="9" height="9" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="9" x2="9" y2="0" stroke="rgba(100,150,180,.18)" strokeWidth="0.7" />
                </pattern>
              </defs>

              <rect x="0" y="0" width="580" height="468" fill="#EDE6DA" />
              {['M 40 420 Q 160 408 280 414 Q 400 420 530 408', 'M 30 370 Q 140 358 270 364 Q 400 370 540 358', 'M 50 310 Q 180 298 300 304 Q 420 310 540 300', 'M 70 250 Q 190 238 320 244 Q 440 250 545 240', 'M 100 190 Q 220 178 340 184 Q 450 190 540 182'].map((d, i) => (
                <path key={i} d={d} fill="none" stroke="rgba(45,27,61,.04)" strokeWidth="1" />
              ))}

              {BAIRROS.map((b) => {
                const cls = [s.bairro, bairro === b.name && s.bairroActive, bairro && bairro !== b.name && s.bairroDimmed].filter(Boolean).join(' ')
                return (
                  <g key={b.name} className={cls} onClick={() => selectBairro(b.name)}>
                    <title>{b.name}</title>
                    <path className={s.zone} filter="url(#sketch)" d={b.path} fill={b.fill} stroke={b.stroke} />
                    <text className={s.bairroLabel} x={b.lx} y={b.ly}>
                      {b.name}
                    </text>
                  </g>
                )
              })}

              <path d="M 0 462 Q 90 450 200 455 Q 310 460 420 452 Q 500 446 580 454 L 580 520 L 0 520 Z" fill="#C0D8E8" />
              <path d="M 0 462 Q 90 450 200 455 Q 310 460 420 452 Q 500 446 580 454 L 580 520 L 0 520 Z" fill="url(#waterLines)" />
              <text className={s.riverLabel} x="290" y="492">
                Rio Tejo
              </text>

              {/* Venue count badges */}
              {BAIRROS.filter((b) => counts[b.name]).map((b) => (
                <g key={`badge-${b.name}`} style={{ pointerEvents: 'none' }}>
                  <circle cx={b.bx} cy={b.by} r="9" fill="var(--accent)" opacity="0.9" />
                  <text x={b.bx} y={b.by} textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: 'var(--sans)', fontSize: 9, fontWeight: 700, fill: '#fff' }}>
                    {counts[b.name]}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <aside className={s.sidebar}>
            <div className={s.sbTop}>
              <div>
                <div className={s.sbHeading}>{bairro ?? 'All venues'}</div>
                <div className={s.sbCount}>
                  <b>{items.length}</b> venue{items.length !== 1 ? 's' : ''}
                </div>
              </div>
              {bairro && (
                <button className={s.clear} onClick={() => selectBairro(null)}>
                  ✕ Clear
                </button>
              )}
            </div>

            {items.length === 0 && <div className={s.empty}>No venues match these filters.</div>}

            {groups
              ? groups.map((g) => (
                  <div key={g.bairro}>
                    <div className={s.groupHead}>{g.bairro}</div>
                    {g.venues.map((v) => (
                      <VenueCard key={v.id} v={v} />
                    ))}
                  </div>
                ))
              : items.map((v) => <VenueCard key={v.id} v={v} />)}
          </aside>
        </div>
      </div>
    </PageShell>
  )
}
