import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
import { ResourceHero } from './ResourceHero'
import { CATEGORIES, GUIDES, POPULAR } from './library.data'
import res from './resources.module.css'
import s from './library.module.css'

export function LibraryPage() {
  const [cat, setCat] = useState<string>('all')
  const [query, setQuery] = useState('')

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
        eyebrow="Resource Library"
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

          <Reveal as="div" className={s.chips} delay={60}>
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`${s.chip} ${cat === category.id ? s.chipOn : ''}`}
                onClick={() => setCat(category.id)}
              >
                {category.label}
              </button>
            ))}
          </Reveal>

          {results.length === 0 ? (
            <p className={s.empty}>No guides match that yet — try a different search.</p>
          ) : (
            <div className={res.grid}>
              {results.map((guide, index) => (
                <Reveal key={guide.title} className={res.card} delay={index * 45}>
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
                </Reveal>
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
        <Button to="/forum" variant="primary" size="lg">
          Ask the community
        </Button>
        <Button to="/contact" variant="ghost-dark" size="lg">
          Suggest a guide
        </Button>
      </Outro>
    </PageShell>
  )
}
