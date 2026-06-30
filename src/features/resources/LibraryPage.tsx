import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button, FadeIn, FilterChips, Outro, Reveal, SkeletonLine } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { routes } from '../../app/routeMap'
import { ResourceHero } from './ResourceHero'
import { CATEGORIES, GUIDES, POPULAR } from './library.data'
import res from './resources.module.css'
import s from './library.module.css'

function GuideSkeleton() {
  // Mirrors the real guide card: meta line, title, description, footer row.
  return (
    <div className={res.card}>
      <SkeletonLine width="40%" height={12} style={{ marginTop: 14 }} />
      <SkeletonLine width="80%" height={19} style={{ marginTop: 6 }} />
      <SkeletonLine width="100%" height={13} style={{ marginTop: 8 }} />
      <SkeletonLine width="90%" height={13} style={{ marginTop: 6 }} />
      <div className={res.cardFoot}>
        <SkeletonLine width="30%" height={13} />
        <SkeletonLine width="35%" height={13} />
      </div>
    </div>
  )
}

export function LibraryPage() {
  const [cat, setCat] = useState<string>('all')
  const [query, setQuery] = useState('')
  const loading = useSimulatedLoad()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return GUIDES.filter((guide) => {
      const matchCat = cat === 'all' || guide.cat === cat
      const matchQuery =
        !q || `${guide.title} ${guide.desc} ${guide.catLabel}`.toLowerCase().includes(q)
      return matchCat && matchQuery
    })
  }, [cat, query])

  return (
    <PageShell>
      <ResourceHero
        eyebrow="Guide Library"
        eyebrowDotColor="var(--jade)"
        title={<>Every guide, <em>in one place.</em></>}
        lead="Housing, health, legal, finance, and trans-specific guides — written and vetted by the community, kept current, and free to share with anyone who needs them."
        anchors={[
          { label: 'Browse all', href: '#browse' },
          { label: 'Legal', href: '#browse' },
          { label: 'Health', href: '#browse' },
          { label: 'Housing', href: '#browse' },
        ]}
      />

      <section className={`${res.section} ${res.sectionPaper}`} id="browse">
        <div className="wrap">
          <Reveal className={s.toolbar}>
            <label className={s.search}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <circle cx={11} cy={11} r={7} />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                placeholder="Search guides — pronouns, PrEP, tenancy…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </Reveal>

          <Reveal as="div" delay={60}>
            <FilterChips
              className={s.chips}
              options={CATEGORIES.map((category) => ({ value: category.id, label: category.label }))}
              value={cat}
              onChange={setCat}
            />
          </Reveal>

          {loading ? (
            <div className={res.grid} aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <GuideSkeleton key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <p className={s.empty}>No guides match that yet — try a different search.</p>
          ) : (
            <div className={res.grid}>
              {results.map((guide, index) => (
                <FadeIn key={guide.title} className={res.card} delay={Math.min(index, 8) * 60}>
                  <span className={s.resMeta}>{guide.catLabel}</span>
                  <div className={res.cardName} style={{ fontSize: 19 }}>
                    {guide.title}
                  </div>
                  <div className={res.cardSpec}>{guide.desc}</div>
                  <div className={res.cardFoot}>
                    <span className={res.cardLoc}>{guide.meta}</span>
                    <Link to={guide.to} className={res.cardCta}>
                      Read the guide →
                    </Link>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}

          <Reveal className={s.popular} delay={120}>
            <span>Most read:</span>
            {POPULAR.map((term) => (
              <button key={term} type="button" onClick={() => setQuery(term)}>
                {term}
              </button>
            ))}
          </Reveal>
        </div>
      </section>

      <Outro
        title={<>Can't find <em>what you need?</em></>}
        sub="Ask in the forum — someone has usually been through it. Or suggest a guide we should write next."
      >
        <Button to={routes.forum} variant="primary" size="lg">
          Ask the community
        </Button>
        <Button to={routes.contact} variant="ghost-dark" size="lg">
          Suggest a guide
        </Button>
      </Outro>
    </PageShell>
  )
}
