import { type DirectoryPlace, hoursRows, type Tint } from './directoryPlaces'
import { CAT_LABEL, stars } from './directorySpace.data'
import s from './DirectorySpacePage.module.css'

const TINT: Record<Tint, string> = { coral: s.tCoral, jade: s.tJade, plum: s.tPlum }

const Check = () => (
  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
)
const Dash = () => (
  <svg viewBox="0 0 24 24"><line x1={5} y1={12} x2={19} y2={12} /></svg>
)

interface Props {
  place: DirectoryPlace
}

export function DirectorySpaceMain({ place }: Props) {
  const words = place.name.split(' ')
  const last = words.pop()
  const lead = words.join(' ')
  const rows = hoursRows(place.hoursType)
  const todayIdx = (new Date().getDay() + 6) % 7

  return (
    <main>
      <header className={s.head}>
        <div className={s.eyebrow}>{CAT_LABEL[place.cat]} · {place.hood} · Lisbon</div>
        <h1 className={s.h1}>{lead && `${lead} `}<em>{last}.</em></h1>
        <p className={s.tagline}>{place.tagline}</p>
        <div className={s.pills}>
          <span className={[s.pill, place.owned ? s.verified : s.friendlyPill].join(' ')}>
            {place.owned ? 'Verified queer-owned' : 'LGBTQ+ friendly'}
          </span>
          {place.pills.map((p) => (
            <span key={p} className={s.pill}>{p}</span>
          ))}
        </div>
        <div className={s.ratingRow}>
          <div className={s.rating}>
            <span className={s.stars}>{stars(Math.round(Number(place.rating.score)))}</span>
            <b>{place.rating.score}</b>
            <span>· {place.rating.count} reviews</span>
          </div>
        </div>
      </header>

      <section className={s.sec}>
        <h2>What it <em>actually is.</em></h2>
        {place.whatItIs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <section className={s.sec}>
        <h2>What members say it's <em>good for</em></h2>
        <p className={s.subLine}>Aggregated from {place.rating.count} reviews.</p>
        <div className={s.features}>
          {place.goodFor.map((f) => (
            <div key={f.label} className={[s.feature, !f.yes && s.featureMaybe].filter(Boolean).join(' ')}>
              <div className={s.featureIc}>{f.yes ? <Check /> : <Dash />}</div>
              {f.label}
            </div>
          ))}
        </div>
      </section>

      <section className={s.sec}>
        <h2>Hours</h2>
        <p className={s.subLine}>{place.hoursNote}</p>
        {place.hoursType === 'appointment' ? (
          <div className={s.apptNote}>
            <div className={s.featureIc}>
              <svg viewBox="0 0 24 24"><circle cx={12} cy={12} r={9} /><path d="M12 7v5l3 2" /></svg>
            </div>
            {place.hoursNote}
          </div>
        ) : (
          <div className={s.hoursTable}>
            {rows.map((r, i) => (
              <div key={r.day} className={[s.hoursRow, i === todayIdx && s.hoursToday, r.closed && s.hoursClosed].filter(Boolean).join(' ')}>
                <span className={s.hoursDay}>
                  {r.day}
                  {i === todayIdx && <span className={s.todayTag}>Today</span>}
                </span>
                <span>{r.val}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={s.sec}>
        <h2>Member reviews · <em>{place.rating.count}</em></h2>
        <p className={s.subLine}>Sorted by most helpful.</p>
        {place.reviews.map((rev) => (
          <div key={rev.name} className={s.rev}>
            <div className={s.revHead}>
              <div className={[s.revAv, TINT[rev.tint]].join(' ')}>{rev.initials}</div>
              <div>
                <div className={s.revName}>{rev.name}</div>
                <div className={s.revByline}>{rev.byline}</div>
              </div>
              <span className={s.revStars}>{stars(rev.stars)}</span>
            </div>
            <div className={s.revText}>{rev.text}</div>
            <div className={s.revHelpful}><b>{rev.helpful}</b> members found this helpful</div>
          </div>
        ))}
      </section>
    </main>
  )
}
