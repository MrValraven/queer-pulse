import { useMemo, useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { Avatar, ImageSlot, Reveal, SectionHead } from '../../shared/components/ui'
import type { AvatarTint } from '../../shared/components/ui/Avatar'
import { useToast } from '../../shared/components/feedback/useToast'
import styles from './HousingPage.module.css'

interface Listing {
  type: string
  typeLabel: string
  typeColor: string
  typeText: string
  tint: 'coral' | 'jade' | 'plum'
  title: string
  hood: string
  beds: string
  avail: string
  desc: string
  price: string
  period: string
  poster: { initials: string; name: string; tint: AvatarTint }
}

const LISTINGS: Listing[] = [
  { type: 'sublet', typeLabel: 'Sublet', typeColor: 'rgba(232,119,90,.1)', typeText: 'var(--accent-ink)', tint: 'coral', title: 'Sunny one-bed in Príncipe Real — July & August', hood: 'Príncipe Real', beds: '1 bed', avail: '1 Jul', desc: 'Beautiful first-floor flat with a view of the garden square. Fully furnished, excellent light. Available while I travel for two months.', price: '€1,100', period: 'month', poster: { initials: 'IT', name: 'Inês T.', tint: 'coral' } },
  { type: 'room', typeLabel: 'Room share', typeColor: 'rgba(74,140,111,.1)', typeText: 'var(--jade)', tint: 'jade', title: 'Room in shared flat — Arroios, long-term', hood: 'Arroios', beds: '1 room', avail: 'Now', desc: 'Quiet three-bed flat shared with two queer women. Big room, own bathroom, good wifi. Looking for someone who keeps to themselves but is up for the occasional dinner.', price: '€750', period: 'month', poster: { initials: 'CN', name: 'Carla N.', tint: 'coral' } },
  { type: 'short', typeLabel: 'Short-term', typeColor: 'rgba(45,27,61,.08)', typeText: 'var(--plum)', tint: 'plum', title: 'Studio in Graça — 2 weeks minimum', hood: 'Graça', beds: 'Studio', avail: '15 Jun', desc: 'Small but well-designed studio in a converted building in Graça. Perfect for someone newly arrived or between places. The building has a rooftop with views.', price: '€85', period: 'night', poster: { initials: 'BP', name: 'Beatriz P.', tint: 'plum' } },
  { type: 'room', typeLabel: 'Room share', typeColor: 'rgba(74,140,111,.1)', typeText: 'var(--jade)', tint: 'jade', title: 'Room in Marvila warehouse flat — creative people', hood: 'Marvila', beds: '1 room', avail: '1 Jul', desc: 'Large warehouse converted to four bedrooms. Three of us currently live here — a musician, an engineer, and a photographer. Looking for a fourth.', price: '€800', period: 'month', poster: { initials: 'DV', name: 'Diogo V.', tint: 'jade' } },
  { type: 'studio', typeLabel: 'Studio', typeColor: 'rgba(122,82,184,.1)', typeText: '#7A52B8', tint: 'plum', title: 'Full flat in Cais do Sodré — 3 months', hood: 'Cais do Sodré', beds: '1 bed', avail: 'Aug', desc: 'My own flat while I go on residency. One bed, good light, close to everything. Priority to LGBTQ+ tenants. References exchanged.', price: '€1,350', period: 'month', poster: { initials: 'SA', name: 'Sofia A.', tint: 'jade' } },
  { type: 'sublet', typeLabel: 'Sublet', typeColor: 'rgba(232,119,90,.1)', typeText: 'var(--accent-ink)', tint: 'coral', title: 'Two-bedroom in Mouraria — June & July', hood: 'Mouraria', beds: '2 beds', avail: '1 Jun', desc: 'Traditional building, recently renovated. Two bedrooms, could work for a couple or two friends. Very central, heart of Mouraria.', price: '€950', period: 'month', poster: { initials: 'TB', name: 'Tomás B.', tint: 'coral' } },
]

const FILTERS = [
  { value: 'all', label: 'All listings' },
  { value: 'sublet', label: 'Sublet' },
  { value: 'room', label: 'Room share' },
  { value: 'short', label: 'Short-term' },
  { value: 'studio', label: 'Studio / whole flat' },
]

const LANDLORDS = [
  { name: 'Senhor Costa', hood: 'Arroios · Rooms + flats', stars: '★★★★★', note: '"Completely unfazed by our relationship, fixed things quickly, never dropped by unannounced. Recommended by 3 members."' },
  { name: 'Ana Ferreira', hood: 'Mouraria · Studio flats', stars: '★★★★★', note: '"Has been renting to queer tenants for 15 years. Genuinely lovely. Contracts are clear and fair."' },
  { name: 'Família Rodrigues', hood: 'Graça · Flats', stars: '★★★★☆', note: '"Older couple, very traditional but completely respectful. No problems. Good building, quiet street."' },
  { name: 'Paulo Matos', hood: 'Cais do Sodré · Rooms', stars: '★★★★★', note: '"Queer himself. Has a policy of never renting to people he thinks would make tenants uncomfortable."' },
]

const TIPS = [
  { num: '01', title: 'Budget for a competitive market', text: 'Rooms in central neighbourhoods go for €700–1000/month. Studios €900–1400. Things move quickly. Have documents ready: NIF, proof of income or a guarantor, and a cover message.' },
  { num: '02', title: 'Use the community board', text: 'The QueerPulse board consistently surfaces housing before it hits any portal. Post "looking for a room in [neighbourhood]" and the network will reply. It works.' },
  { num: '03', title: 'Know your rights as a tenant', text: "Portuguese tenancy law is reasonably protective. You need a written contract. Landlords can't evict without proper notice. ILGA Portugal can advise if you face discrimination." },
  { num: '04', title: 'Short-term first is fine', text: "It's completely valid to arrive with a short-term sublet for 2–3 months and find long-term housing once you know the city better." },
  { num: '05', title: 'Trust your gut on viewings', text: 'Meet the landlord before signing. Ask about other tenants. A bad feeling is worth more than a good price.' },
  { num: '06', title: 'In an emergency, ask the community', text: "If you're suddenly homeless or in a dangerous living situation, post to the board. The community responds quickly to genuine need." },
]

export function HousingPage() {
  const { showToast } = useToast()
  const [filter, setFilter] = useState('all')
  const visible = useMemo(() => (filter === 'all' ? LISTINGS : LISTINGS.filter((l) => l.type === filter)), [filter])

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            Housing Board
          </Reveal>
          <Reveal as="h1" delay={60}>
            Find a home among <em>people you can trust.</em>
          </Reveal>
          <Reveal as="p" delay={120}>
            A queer-specific housing board for Lisbon. Sublets, room shares, short-term stays, and
            landlord recommendations — all within the community network.
          </Reveal>
          <Reveal className={styles.note} delay={160}>
            <span className={styles.noteDot} />
            Every listing is posted by a verified QueerPulse member
          </Reveal>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.top}>
            <div className={styles.filters}>
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  className={[styles.chip, filter === f.value && styles.chipActive].filter(Boolean).join(' ')}
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button className={styles.listBtn} onClick={() => showToast('Listing submitted', 'info')}>
              + List your space
            </button>
          </div>
          <div className={styles.grid}>
            {visible.map((listing) => (
              <div key={listing.title} className={styles.card}>
                <ImageSlot tint={listing.tint} height={150} radius={0} placeholder={`Photo · ${listing.hood}`} />
                <div className={styles.cardBody}>
                  <span className={styles.type} style={{ background: listing.typeColor, color: listing.typeText }}>
                    {listing.typeLabel}
                  </span>
                  <div className={styles.cardTitle}>{listing.title}</div>
                  <div className={styles.details}>
                    <span className={styles.detail}>{listing.hood}</span>
                    <span className={styles.detail}>{listing.beds}</span>
                    <span className={styles.detail}>From {listing.avail}</span>
                  </div>
                  <p className={styles.cardDesc}>{listing.desc}</p>
                  <div className={styles.foot}>
                    <div className={styles.price}>
                      {listing.price} <span>/ {listing.period}</span>
                    </div>
                    <div className={styles.poster}>
                      <Avatar initials={listing.poster.initials} tint={listing.poster.tint} size={26} />
                      {listing.poster.name}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className={styles.landlords}>
        <div className="wrap">
          <SectionHead
            title={<>Community-endorsed <em>landlords</em></>}
            subtitle="Members have vouched for these landlords as queer-friendly, reliable, and fair. Not a guarantee — always do your own due diligence."
          />
          <div className={styles.llGrid}>
            {LANDLORDS.map((ll) => (
              <div key={ll.name} className={styles.llCard}>
                <span className={styles.llBadge}>🏅</span>
                <div>
                  <div className={styles.llName}>{ll.name}</div>
                  <div className={styles.llHood}>{ll.hood}</div>
                  <div className={styles.llStars}>{ll.stars}</div>
                  <div className={styles.llNote}>{ll.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.tips}>
        <div className="wrap">
          <SectionHead title={<>Housing in Lisbon — <em>what to know</em></>} />
          <div className={styles.tipsGrid}>
            {TIPS.map((tip) => (
              <div key={tip.num} className={styles.tipCard}>
                <div className={styles.tipNum}>{tip.num}</div>
                <div className={styles.tipTitle}>{tip.title}</div>
                <div className={styles.tipText}>{tip.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
