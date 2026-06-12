import { useState } from 'react'
import { PageHero, PageShell } from '../../shared/components/layout'
import { Button, Outro } from '../../shared/components/ui'
import s from './PlatformsPage.module.css'

interface Platform {
  cat: string
  name: string
  icon: string
  ic: string
  it: string
  desc: string
  url: string
}

const CAT_ORDER = ['Dating', 'Media', 'Professional', 'Advocacy', 'Health', 'Portugal']
const CAT_LABELS: Record<string, string> = {
  Dating: 'Dating & Social',
  Media: 'News & Media',
  Professional: 'Professional Networks',
  Advocacy: 'Advocacy & Rights',
  Health: 'Health & Wellbeing',
  Portugal: 'Portugal & Lisbon',
}

const PLATFORMS: Platform[] = [
  { cat: 'Dating', name: 'Grindr', icon: 'Gr', ic: 'rgba(74,140,111,.14)', it: 'var(--jade)', desc: 'The largest location-based social app for gay, bi, trans, and queer people. Used by millions globally.', url: 'grindr.com' },
  { cat: 'Dating', name: 'HER', icon: 'HER', ic: 'rgba(232,119,90,.12)', it: 'var(--accent-ink)', desc: 'Dating and social app for LGBTQ+ women, non-binary, and queer people. Community features beyond dating.', url: 'weareher.com' },
  { cat: 'Dating', name: 'Lex', icon: 'Lex', ic: 'rgba(45,27,61,.07)', it: 'var(--plum)', desc: 'A text-based social and personal ads app for queer, lesbian, bi, trans and non-binary people. Community first.', url: 'lex-app.com' },
  { cat: 'Dating', name: 'Feeld', icon: 'Ff', ic: 'rgba(122,82,184,.1)', it: '#7A52B8', desc: 'For open-minded individuals exploring connections beyond traditional dating norms.', url: 'feeld.co' },
  { cat: 'Media', name: 'them.', icon: 'tm', ic: 'rgba(45,27,61,.07)', it: 'var(--plum)', desc: "Condé Nast's LGBTQ+ digital media platform, covering culture, politics, and identity with a progressive lens.", url: 'them.us' },
  { cat: 'Media', name: 'PinkNews', icon: 'PN', ic: 'rgba(232,119,90,.1)', it: 'var(--accent-ink)', desc: "Europe's largest LGBTQ+ news service. Breaking news, analysis, and features on rights and culture.", url: 'pinknews.co.uk' },
  { cat: 'Media', name: 'The Advocate', icon: 'Av', ic: 'rgba(74,140,111,.12)', it: 'var(--jade)', desc: "The world's longest-running LGBTQ+ news magazine, founded in 1967.", url: 'advocate.com' },
  { cat: 'Professional', name: 'Out in Tech', icon: 'OT', ic: 'rgba(74,140,111,.12)', it: 'var(--jade)', desc: 'A non-profit community of LGBTQ+ people in tech. Events, mentoring, and job opportunities worldwide.', url: 'outintech.org' },
  { cat: 'Professional', name: 'Lesbians Who Tech', icon: 'LW', ic: 'rgba(232,119,90,.1)', it: 'var(--accent-ink)', desc: 'Global community for LGBTQ+ women and allies in tech. One of the largest professional networks.', url: 'lesbianswhotech.org' },
  { cat: 'Professional', name: 'Out & Equal', icon: 'O=', ic: 'rgba(45,27,61,.07)', it: 'var(--plum)', desc: 'Global non-profit focused on LGBTQ+ workplace equality. Partnerships, research, and events.', url: 'outandequal.org' },
  { cat: 'Advocacy', name: 'ILGA World', icon: 'IW', ic: 'rgba(74,140,111,.12)', it: 'var(--jade)', desc: 'The International LGBTI Association. Rights advocacy and country-by-country legal data.', url: 'ilga.org' },
  { cat: 'Advocacy', name: 'Rainbow Railroad', icon: 'RR', ic: 'rgba(232,119,90,.1)', it: 'var(--accent-ink)', desc: 'Helping LGBTQI+ people escape state-sponsored violence in over 80 countries.', url: 'rainbowrailroad.org' },
  { cat: 'Advocacy', name: 'Equaldex', icon: 'Eq', ic: 'rgba(74,140,111,.1)', it: 'var(--jade)', desc: 'Collaborative knowledge base mapping LGBTQ+ rights and laws country by country.', url: 'equaldex.com' },
  { cat: 'Health', name: 'The Trevor Project', icon: 'Tv', ic: 'rgba(232,119,90,.1)', it: 'var(--accent-ink)', desc: 'Leading suicide prevention organisation for LGBTQ+ youth. Crisis support, research, and education.', url: 'thetrevorproject.org' },
  { cat: 'Health', name: 'Trans Lifeline', icon: 'TL', ic: 'rgba(74,140,111,.12)', it: 'var(--jade)', desc: 'Peer support hotline run by and for trans people. A model for trans-led mental health support.', url: 'translifeline.org' },
  { cat: 'Portugal', name: 'ILGA Portugal', icon: 'IL', ic: 'rgba(74,140,111,.14)', it: 'var(--jade)', desc: "Portugal's leading LGBTQ+ rights organisation. Legal support, advocacy, crisis line, programming.", url: 'ilga-portugal.pt' },
  { cat: 'Portugal', name: 'Opus Diversus', icon: 'OD', ic: 'rgba(232,119,90,.1)', it: 'var(--accent-ink)', desc: 'Mental health and peer support for LGBTQ+ people in Portugal. Training for allied professionals.', url: 'opusdiversus.org' },
  { cat: 'Portugal', name: 'Rede ex aequo', icon: 'Re', ic: 'rgba(45,27,61,.08)', it: 'var(--plum)', desc: 'Youth-focused LGBTQ+ association with peer support and advocacy groups across Portugal.', url: 'ex-aequo.pt' },
  { cat: 'Portugal', name: 'Panteras Rosa', icon: 'PR', ic: 'rgba(74,140,111,.1)', it: 'var(--jade)', desc: 'Trans rights activism and advocacy. Political campaigning and community organising in Portugal.', url: 'panterasrosa.com' },
]

const FILTERS = ['all', ...CAT_ORDER]

export function PlatformsPage() {
  const [filter, setFilter] = useState('all')
  const cats = filter === 'all' ? CAT_ORDER : [filter]

  return (
    <PageShell>
      <PageHero
        eyebrow="Queer platforms"
        title={<>The wider <em>queer web.</em></>}
        sub="Apps, media, professional networks, and advocacy organisations that are genuinely useful for queer people — beyond QueerPulse itself."
      >
        <div className={s.bar}>
          <div className={s.filters}>
            {FILTERS.map((f) => (
              <button key={f} className={[s.chip, filter === f && s.chipOn].filter(Boolean).join(' ')} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : CAT_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
      </PageHero>

      <section className={s.body}>
        <div className="wrap">
          <div className={s.note}>
            <span className={s.pnDot} />
            <p>
              <b>A note on this list:</b> We include platforms we think are genuinely useful for queer people. This is not an endorsement of any company's practices. Always make your own informed choices about data, safety, and privacy — especially on dating and social apps.
            </p>
          </div>

          {cats.map((cat) => {
            const items = PLATFORMS.filter((p) => p.cat === cat)
            if (!items.length) return null
            return (
              <div key={cat}>
                <h2 className={s.secTitle}>{CAT_LABELS[cat]}</h2>
                <div className={s.grid}>
                  {items.map((p) => (
                    <a key={p.name} href={`https://${p.url}`} target="_blank" rel="noreferrer" className={s.card}>
                      <span className={s.icon} style={{ background: p.ic, color: p.it }}>
                        {p.icon}
                      </span>
                      <div>
                        <div className={s.pCat}>{CAT_LABELS[p.cat]}</div>
                        <div className={s.pName}>{p.name}</div>
                        <p className={s.pDesc}>{p.desc}</p>
                        <div className={s.pUrl}>↗ {p.url}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <Outro
        title={<>Something missing? <em>Tell us.</em></>}
        sub="Know a platform, resource, or community that should be here? Suggest it and we'll add it to the directory."
      >
        <Button size="lg" to="/forum">
          Suggest a platform →
        </Button>
      </Outro>
    </PageShell>
  )
}
