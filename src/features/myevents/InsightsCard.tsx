import { sx } from './myEvents.styles'

/** "Your year so far" plum stats panel beneath the calendar. */
export function InsightsCard() {
  return (
    <div className={sx('insights')}>
      <div className={sx('ins-eyebrow')}>Your year so far</div>
      <div className={sx('ins-stat')}><em>12</em> gatherings</div>
      <div className={sx('ins-sub')}>You've been to 12 gatherings this year — a little more each month.</div>
      <div className={sx('ins-row')}>
        <div className={sx('ins-item')}><div className={sx('ins-n')}>3</div><div className={sx('ins-l')}>months in a row</div></div>
        <div className={sx('ins-item')}><div className={sx('ins-n')}>Reads</div><div className={sx('ins-l')}>your top circle</div></div>
        <div className={sx('ins-item')}><div className={sx('ins-n')}>2</div><div className={sx('ins-l')}>you hosted</div></div>
      </div>
    </div>
  )
}
