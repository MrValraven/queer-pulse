import { useMemo, useState } from 'react'
import { FiAward, FiStar } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Avatar, ImageSlot, Reveal, SectionHead } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { HOUSING_LISTINGS as LISTINGS } from './housingListings'
import { LANDLORDS } from './landlords'
import styles from './HousingPage.module.css'

const FILTERS = [
  { value: 'all', label: 'All listings' },
  { value: 'sublet', label: 'Sublet' },
  { value: 'room', label: 'Room share' },
  { value: 'short', label: 'Short-term' },
  { value: 'studio', label: 'Studio / whole flat' },
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
            <Reveal as="div" className={styles.filters}>
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  className={[styles.chip, filter === f.value && styles.chipActive].filter(Boolean).join(' ')}
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </Reveal>
            <Reveal as="button" className={styles.listBtn} delay={60} onClick={() => showToast('Listing submitted', 'info')}>
              + List your space
            </Reveal>
          </div>
          <Reveal as="div" className={styles.grid}>
            {visible.map((listing) => (
              <Link key={listing.title} to={`/housing/${listing.slug}`} className={styles.card}>
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
              </Link>
            ))}
          </Reveal>
        </div>
      </div>

      <section className={styles.landlords}>
        <div className="wrap">
          <Reveal>
            <SectionHead
              title={<>Community-endorsed <em>landlords</em></>}
              subtitle="Members have vouched for these landlords as queer-friendly, reliable, and fair. Not a guarantee — always do your own due diligence."
            />
          </Reveal>
          <div className={styles.llGrid}>
            {LANDLORDS.map((ll, i) => (
              <Reveal as={Link} key={ll.name} to={`/landlord/${ll.slug}`} className={styles.llCard} delay={i * 55}>
                <span className={styles.llBadge}><FiAward /></span>
                <div>
                  <div className={styles.llName}>{ll.name}</div>
                  <div className={styles.llHood}>{ll.hood}</div>
                  <div className={styles.llStars}>
                    {Array.from({ length: 5 }, (_, n) => (
                      <FiStar key={n} className={n < ll.stars ? styles.llStarOn : undefined} />
                    ))}
                  </div>
                  <div className={styles.llNote}>{ll.note}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.tips}>
        <div className="wrap">
          <Reveal>
            <SectionHead title={<>Housing in Lisbon — <em>what to know</em></>} />
          </Reveal>
          <div className={styles.tipsGrid}>
            {TIPS.map((tip, i) => (
              <Reveal as="div" key={tip.num} className={styles.tipCard} delay={i * 55}>
                <div className={styles.tipNum}>{tip.num}</div>
                <div className={styles.tipTitle}>{tip.title}</div>
                <div className={styles.tipText}>{tip.text}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
