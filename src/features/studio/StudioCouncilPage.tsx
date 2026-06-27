import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ImageSlot, FadeIn } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { StudioShell } from './StudioShell'
import { StudioLine } from './StudioSkeletons'
import { routes } from '../../app/routeMap'
import s from './council.module.css'

/** Mirrors the council .cur card: avatar row + bio + note + footer. */
function CouncilCardSkeleton() {
  return (
    <div className={s.cur}>
      <div className={s.curHead}>
        <StudioLine width={54} height={54} style={{ borderRadius: '50%', flex: 'none' }} />
        <div style={{ flex: 1 }}>
          <StudioLine width={70} height={11} />
          <StudioLine width="55%" height={20} style={{ marginTop: 8 }} />
          <StudioLine width="40%" height={11} style={{ marginTop: 8 }} />
        </div>
      </div>
      <StudioLine width="100%" height={13} style={{ marginTop: 16 }} />
      <StudioLine width="85%" height={13} style={{ marginTop: 8 }} />
      <StudioLine width="100%" height={64} style={{ marginTop: 16, borderRadius: 12 }} />
      <StudioLine width="60%" height={13} style={{ marginTop: 16 }} />
      <StudioLine width="100%" height={13} style={{ marginTop: 10 }} />
    </div>
  )
}

const FACTS = [
  { v: <><em>6</em> seats</>, l: '2-year terms · staggered' },
  { v: <>€<em>400</em></>, l: 'monthly stipend · on the ledger' },
  { v: <><em>52</em></>, l: 'slates programmed this year' },
  { v: <><em>9 Jun</em></>, l: 'next election · assembly' },
]

interface Member {
  tint: 'coral' | 'jade' | 'plum'
  seat: string
  pre: string
  em: string
  where: string[]
  bio: ReactNode
  noteDate: string
  note: ReactNode
  slatesCount: string
  slates: { pre: string; em?: string; post?: string; date: string; out: ReactNode }[]
  stat: ReactNode
  image?: string
}

const MEMBERS: Member[] = [
  { tint: 'coral', seat: 'Seat 1 · chair this quarter', pre: 'Sara ', em: 'Marques', where: ['Lisbon', 'DJ & programmer', 'since 2024'], bio: <>Ran the Casa do Comum Wednesday nights for a decade before the co-op existed. Programs for <em>the hour between sunset and the second bottle</em>.</>, noteDate: '9 Jun', note: <>"I keep coming back to Mariana's <em>Carta</em>. It's a hymn that refuses church. We led the week with it because the room needs permission to be tender on a Wednesday."</>, slatesCount: '18 this year', slates: [{ pre: 'Vespertina, ', em: 'vol. iv', date: '9 Jun · 12 tracks', out: <><em>€8.20</em> out</> }, { pre: 'Songs to play your ', em: 'mother', date: '2 Jun · 14 tracks', out: <><em>€11.4k</em> out</> }], stat: <><em>312</em> tracks programmed · <em>89</em> artists paid</>, image: 'https://images.unsplash.com/photo-1779497056298-7a23ec268963?q=80&w=600&auto=format&fit=crop' },
  { tint: 'jade', seat: 'Seat 4', pre: 'D. ', em: 'Okoye', where: ['London / Lagos', 'composer & archivist', 'since 2025'], bio: <>Builds the long mixes nobody else has time for — <em>trans composers 1972 to now</em>. Believes a playlist is an argument and a citation is a kindness.</>, noteDate: '5 Jun', note: <>"Half this week's grant strand went to people the algorithms had given up on. <em>That's the whole job.</em> Find the ones the metrics buried, pay them first."</>, slatesCount: '9 this year', slates: [{ pre: 'Trans ', em: 'composers', post: ', 1972–now', date: '28 May · 12 tracks', out: <><em>12</em> paid</> }, { pre: 'Songs for ', em: 'insomnia', date: '14 May · 22 tracks', out: <><em>€4.10</em> out</> }], stat: <><em>148</em> tracks programmed · <em>61</em> artists paid</>, image: 'https://images.unsplash.com/flagged/photo-1555604858-34f65cfdc1db?q=80&w=800&auto=format&fit=crop' },
  { tint: 'plum', seat: 'Seat 3', pre: 'Yara ', em: 'Reis', where: ['Lisbon', 'sound archivist', 'since 2024'], bio: <>Keeper of the <em>Lisbon dyke-bar standards</em> archive — field recordings, bootlegs, the songs that only existed in one room on one night.</>, noteDate: '2 Jun', note: <>"A recording held for clearance is not a recording withheld from you. It's a recording <em>waiting to pay the right person</em>."</>, slatesCount: '11 this year', slates: [{ pre: 'Lisbon dyke-bar ', em: 'standards', date: '21 May · 28 tracks', out: <><em>€9.30</em> out</> }, { pre: 'Almost ', em: 'asleep', date: '9 May · 31 tracks', out: <><em>€5.80</em> out</> }], stat: <><em>204</em> tracks programmed · <em>73</em> artists paid</>, image: 'https://images.unsplash.com/photo-1506863530036-1efeddceb993?q=80&w=800&auto=format&fit=crop' },
  { tint: 'coral', seat: 'Seat 2', pre: 'João ', em: 'Ribeiro', where: ['Porto', 'producer', 'since 2025'], bio: <>The one who programs the warm-ups and the come-downs. Runs the <em>made here</em> strand for first releases by members.</>, noteDate: '30 May', note: <>"Gave the spring grant to seven first-timers this week. Not one has a manager. <em>Good.</em> The point was never to find the ready — it was to make people ready."</>, slatesCount: '7 this year', slates: [{ pre: 'Kitchen ', em: 'warm-up', date: '23 May · 9 tracks', out: <><em>€3.20</em> out</> }, { pre: 'Made ', em: 'here', post: ', spring', date: '16 May · 5 tracks', out: <><em>€5.5k</em> grant</> }], stat: <><em>96</em> tracks programmed · <em>44</em> artists paid</>, image: 'https://images.unsplash.com/photo-1513517178-1aca306e52a9?q=80&w=800&auto=format&fit=crop' },
  { tint: 'jade', seat: 'Seat 5', pre: 'Akin ', em: 'Diallo', where: ['Dakar / Paris', 'artist-curator', 'since 2025'], bio: <>The only working touring artist on the council — programs from the road. Recuses from any vote on his own releases.</>, noteDate: '27 May', note: <>"Programmed from a dressing room in Marseille tonight. The council should always have one person who's <em>tired in the way the artists are tired</em>."</>, slatesCount: '6 this year', slates: [{ pre: 'Salt water, ', em: 'slowly', date: '19 May · 10 tracks', out: <><em>€4.60</em> out</> }, { pre: 'The long way ', em: 'home', date: '5 May · 14 tracks', out: <><em>€6.10</em> out</> }], stat: <><em>84</em> tracks programmed · <em>52</em> artists paid</>, image: 'https://images.unsplash.com/photo-1514960919797-5ff58c52e5ba?q=80&w=800&auto=format&fit=crop' },
  { tint: 'plum', seat: 'Seat 6 · newest', pre: 'Helena ', em: 'Pinto', where: ['Braga', 'choir director', 'since 2026'], bio: <>Came up through community choirs and brought all of them with her. Programs the choral and the congregational. Elected at the last assembly.</>, noteDate: '24 May', note: <>"My first month on the council. I keep wanting to apologise for picking so much choir music. Then I remember: <em>nobody else will</em>, and the choirs need paying too."</>, slatesCount: '3 this year', slates: [{ pre: 'Vespers, ', em: 'recorded', date: '17 May · 12 tracks', out: <><em>€3.40</em> out</> }, { pre: 'Fifteen voices, one ', em: 'stairwell', date: '10 May · 8 tracks', out: <><em>€2.80</em> out</> }], stat: <><em>28</em> tracks programmed · <em>19</em> artists paid</>, image: 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?q=80&w=800&auto=format&fit=crop' },
]

export function StudioCouncilPage() {
  const loading = useSimulatedLoad()
  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.pageH}>
          <div className={s.eb}>Governance · the council</div>
          <h1>
            Six people decide what the room <em>hears</em>.
          </h1>
          <div className={s.dek}>
            Elected yearly by the assembly, paid a flat stipend on the public ledger, term-limited to two years. They program the weekly set, run triage, and write the notes. <em>Everything they pick has their name on it.</em>
          </div>
        </div>

        <div className={s.intro}>
          <div className={s.lede}>
            The council isn't a tastemaker board behind glass. They listen in the open, <em>justify every pick in a paragraph</em>, and answer for the rate. You can read their notebooks, see their slates, and vote them out.
          </div>
          <div className={s.facts}>
            {FACTS.map((f, i) => (
              <div key={i} className={s.fact}>
                <div className={s.v}>{f.v}</div>
                <div className={s.l}>{f.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={s.curators}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CouncilCardSkeleton key={i} />)
            : MEMBERS.map((mem, idx) => (
            <FadeIn key={mem.em + mem.seat} delay={Math.min(idx, 8) * 60} className={s.cur}>
              <div className={s.curHead}>
                <div className={s.curAv}>
                  <ImageSlot src={mem.image} tint={mem.tint} width={54} height={54} radius={9999} shape="circle" placeholder="" initials={mem.pre[0] + mem.em[0]} />
                </div>
                <div>
                  <div className={s.seat}>{mem.seat}</div>
                  <h3>
                    {mem.pre}
                    <em>{mem.em}</em>
                  </h3>
                  <div className={s.where}>
                    {mem.where.map((w, i) => (
                      <span key={w} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                        {i > 0 && <span className={s.dot} />}
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className={s.curBio}>{mem.bio}</p>
              <div className={s.curNote}>
                <div className={s.nl}>From the notebook · {mem.noteDate}</div>
                <p>{mem.note}</p>
              </div>
              <div>
                <div className={s.slLbl}>Recent slates · {mem.slatesCount}</div>
                {mem.slates.map((sl) => (
                  <div key={sl.pre} className={s.slRow}>
                    <div className={s.st}>
                      {sl.pre}
                      {sl.em && <em>{sl.em}</em>}
                      {sl.post}
                    </div>
                    <div className={s.sd}>{sl.date}</div>
                    <div className={s.sp}>{sl.out}</div>
                  </div>
                ))}
              </div>
              <div className={s.curFoot}>
                <div className={s.curStat}>{mem.stat}</div>
                <Link to={routes.studioAlbum} className={s.bt}>
                  Their slate →
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </StudioShell>
  )
}
