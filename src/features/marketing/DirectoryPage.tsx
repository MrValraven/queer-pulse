import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import m from './marketing.module.css'
import s from './DirectoryPage.module.css'

type Tint = 'coral' | 'jade' | 'plum'
interface Biz {
  name: string
  cat: string
  hood: string
  owned: boolean
  member?: string
  av: string
  tint: Tint
  desc: string
}

const CATS = [
  { c: 'all', label: 'All' },
  { c: 'food', label: 'Food & drink' },
  { c: 'design', label: 'Design & craft' },
  { c: 'health', label: 'Health & care' },
  { c: 'space', label: 'Spaces' },
  { c: 'culture', label: 'Culture' },
  { c: 'tech', label: 'Tech' },
  { c: 'grooming', label: 'Barbershop & Salon' },
  { c: 'fitness', label: 'Gym & Fitness' },
]
const CAT_LABEL: Record<string, string> = Object.fromEntries(CATS.map((c) => [c.c, c.label]))

const tintBg: Record<Tint, string> = { coral: 'rgba(232,119,90,.15)', jade: 'rgba(74,140,111,.15)', plum: 'rgba(45,27,61,.1)' }
const tintFg: Record<Tint, string> = { coral: '#C85A40', jade: '#4A8C6F', plum: '#2D1B3D' }

const BIZS: Biz[] = [
  { name: 'Atelier Pulso', cat: 'design', hood: 'Príncipe Real', owned: true, member: 'ines', av: 'AP', tint: 'coral', desc: 'Graphic design studio specialising in brand identity and editorial work for cultural institutions and small presses. Open by appointment.' },
  { name: 'Queer Supper Club', cat: 'food', hood: 'Mouraria', owned: true, member: 'tomas', av: 'QS', tint: 'coral', desc: 'Monthly intimate dinners hosted by Tomás Beto — twelve seats, seasonal menu, honest cooking. The most important table in Mouraria.' },
  { name: 'Estúdio Beatriz Pinto', cat: 'design', hood: 'Graça', owned: true, member: 'beatriz', av: 'BP', tint: 'plum', desc: 'Ceramics studio producing functional pieces with a slow aesthetic. Workshop sessions monthly. Spare desks to share.' },
  { name: 'Opus Diversus', cat: 'health', hood: 'Intendente', owned: false, av: 'OD', tint: 'jade', desc: 'LGBTQ+-affirming mental health support — therapy, peer groups, crisis support. Sliding scale fees. Portuguese and English.' },
  { name: 'Livraria Bertha', cat: 'culture', hood: 'Príncipe Real', owned: true, av: 'LB', tint: 'plum', desc: 'Queer-run independent bookshop with a strong feminist and LGBTQ+ section. Regular readings, launches, and community events.' },
  { name: 'Café Mouraria Velha', cat: 'food', hood: 'Mouraria', owned: false, av: 'CM', tint: 'jade', desc: 'Family-run café known among the community for warmth and a complete absence of hostility. Excellent pastéis.' },
  { name: 'Bairro Alto Studio', cat: 'tech', hood: 'Bairro Alto', owned: true, member: 'diogo', av: 'BA', tint: 'jade', desc: 'Music production studio available for session hire. Diogo and the team specialise in electronic and experimental work.' },
  { name: 'Espaço Intendente', cat: 'space', hood: 'Intendente', owned: false, av: 'EI', tint: 'plum', desc: 'Community coworking space, explicitly LGBTQ+-friendly. Day passes and monthly desks at accessible prices.' },
  { name: 'A Farinha', cat: 'food', hood: 'Arroios', owned: true, av: 'AF', tint: 'coral', desc: 'Queer-owned natural wine bar and small plates restaurant. Natural wine list, seasonal kitchen, generous hospitality.' },
  { name: 'Studio André Quintela', cat: 'design', hood: 'Cais do Sodré', owned: true, member: 'andre', av: 'AQ', tint: 'jade', desc: 'Portrait photography studio. Analog film, medium format, darkroom on site. Priority allocation for community members.' },
  { name: 'Clínica da Estrela', cat: 'health', hood: 'Estrela', owned: false, av: 'CE', tint: 'plum', desc: 'General practice with two LGBTQ+-affirming GPs and a trans-competent endocrinologist. Accepts SNS referrals.' },
  { name: 'Galeria Lume', cat: 'culture', hood: 'Marvila', owned: true, av: 'GL', tint: 'coral', desc: 'Artist-run gallery in a Marvila warehouse. Programming focuses on queer and feminist artists, emphasis on emerging work.' },
  { name: 'Navalha', cat: 'grooming', hood: 'Príncipe Real', owned: true, av: 'NV', tint: 'coral', desc: 'Queer-owned barbershop known for trans haircuts done right. No awkward questions. No gendered pricing.' },
  { name: 'Salão Mouraria', cat: 'grooming', hood: 'Mouraria', owned: false, av: 'SM', tint: 'jade', desc: 'Neighbourhood salon adopted by the queer community. Bilingual, trans-welcoming, affordable.' },
  { name: 'Studio Cabelo', cat: 'grooming', hood: 'Intendente', owned: true, av: 'SC', tint: 'plum', desc: 'Gender-neutral pricing on every service — never more based on hair length or gender. Clean space, good music.' },
  { name: 'Academia Livre', cat: 'fitness', hood: 'Cais do Sodré', owned: false, av: 'AL', tint: 'jade', desc: 'The most trans-inclusive gym in the city. Gender-neutral changing rooms on every floor, no body-shaming culture.' },
  { name: 'Corpo Livre', cat: 'fitness', hood: 'Bairro Alto', owned: true, av: 'CL', tint: 'plum', desc: 'Feminist and queer-centred fitness studio. Small classes, no mirrors, no scales. Body-neutral by design.' },
  { name: 'Movimento', cat: 'fitness', hood: 'Alfama', owned: true, av: 'MV', tint: 'coral', desc: 'Yoga, capoeira, and weights in a converted Alfama warehouse. Queer-run, sliding-scale memberships.' },
]

export function DirectoryPage() {
  const [cat, setCat] = useState('all')
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return BIZS.filter((b) => {
      if (cat !== 'all' && b.cat !== cat) return false
      if (q && !(b.name.toLowerCase().includes(q) || b.hood.toLowerCase().includes(q) || b.desc.toLowerCase().includes(q))) return false
      return true
    })
  }, [cat, query])

  return (
    <PageShell>
      <header className={m.hero}>
        <div className="wrap">
          <div className={m.eyebrow}>Queer business directory</div>
          <h1 className={m.heroTitle}>
            Find your <em>people's places.</em>
          </h1>
          <p className={m.heroSub}>Queer-owned businesses and queer-friendly professionals in Lisbon. Vetted by the community, maintained by the community.</p>
          <div className={s.heroNote}>
            <span className={s.live} /> Community-verified · updated monthly
          </div>
        </div>
      </header>

      <div className={s.bar}>
        <div className="wrap">
          <div className={s.search}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <circle cx={11} cy={11} r={7} />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input type="text" placeholder="Search by name, neighbourhood, or type…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className={s.pills}>
            {CATS.map((c) => (
              <button key={c.c} className={[s.pill, cat === c.c && s.pillOn].filter(Boolean).join(' ')} onClick={() => setCat(c.c)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className={s.content}>
        <div className="wrap">
          <div className={s.count}>
            Showing <b>{visible.length}</b> of {BIZS.length} places
          </div>
          <div className={s.grid}>
            {visible.length === 0 && <div className={s.empty}>No places match — try a broader filter.</div>}
            {visible.map((b) => (
              <div key={b.name} className={s.card}>
                <div className={s.top}>
                  <span className={s.av} style={{ background: tintBg[b.tint], color: tintFg[b.tint] }}>
                    {b.av}
                  </span>
                  <span className={`${s.badge} ${b.owned ? s.owned : s.friendly}`}>{b.owned ? 'Queer-owned' : 'LGBTQ+ friendly'}</span>
                </div>
                <div>
                  <div className={s.name}>{b.name}</div>
                  <div className={s.cat}>{CAT_LABEL[b.cat]}</div>
                  <div className={s.hood}>📍 {b.hood}</div>
                </div>
                <div className={s.desc}>{b.desc}</div>
                <div className={s.foot}>
                  {b.member ? (
                    <Link to="/profile" className={s.memberLink}>
                      Member-run →
                    </Link>
                  ) : (
                    <span />
                  )}
                  <a className={s.visit} href="#">
                    Visit →
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className={s.submitStrip}>
            <div>
              <h3>
                Know a place worth <em>adding?</em>
              </h3>
              <p>If you run or know a queer-owned or queer-friendly business in Lisbon that belongs here, tell us. We review every suggestion before it goes live.</p>
            </div>
            <Button size="lg" href="mailto:hello@queerpulse.pt?subject=Directory suggestion">
              Suggest a place
            </Button>
          </div>
        </div>
      </section>

      <section className={m.outro}>
        <div className="wrap">
          <h2>
            New to Lisbon? <em>You're not starting from zero.</em>
          </h2>
          <p>Join the network and get the full directory, member recommendations, and a community that knows the city.</p>
          <Button size="lg" to="/invite">
            Request an invite
          </Button>
        </div>
      </section>
    </PageShell>
  )
}
