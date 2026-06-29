import type { MouseEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { linkToPath } from '../../app/routeMap'
import { gatheringPath } from '../gatherings/data'
import { sx } from './myEvents.styles'
import { useMyEvents } from './MyEventsContext'
import { Icons } from './MyEventsIcons'
import { isToday } from './myEvents.helpers'
import type { MyEvent } from './myEvents.types'

const GATHERING = linkToPath('QueerPulse Gathering.html')

/** The specific gathering detail page for this event, or the generic listing. */
const detailPath = (ev: MyEvent) => (ev.slug ? gatheringPath(ev.slug) : GATHERING)
const TICKET = linkToPath('QueerPulse RSVP Ticket.html')
const MANAGE = linkToPath('QueerPulse Manage Gathering.html')
const COHOST = linkToPath('QueerPulse Co-host Invite.html')
const PHOTOS = linkToPath('QueerPulse Gathering Photos.html')
const RECEIPT = linkToPath('QueerPulse Receipt.html')

/** Right-hand action column, varying by category. */
export function EventSide({ ev }: { ev: MyEvent }) {
  const { rsvpSaved, acceptInvite, declineInvite, softRemove, toast } = useMyEvents()
  return (
    <div className={sx('ev-actions')}>
      {ev.cat === 'going' && (ev.cancelled
        ? <Button variant="ghost" to={GATHERING}>Find similar</Button>
        : <>
            {ev.ticket && <Button variant="ghost" to={TICKET}>View ticket</Button>}
            <Link className={sx('ev-link')} to={detailPath(ev)}>Event details →</Link>
          </>)}

      {ev.cat === 'hosting' && (
        <>
          <Button variant="primary" to={MANAGE}>Manage</Button>
          <Link className={sx('ev-link')} to={detailPath(ev)}>View listing →</Link>
        </>
      )}

      {ev.cat === 'waitlisted' && <Link className={sx('ev-link')} to={detailPath(ev)}>Event details →</Link>}

      {ev.cat === 'past' && (
        <>
          {ev.photos
            ? <Link className={sx('ev-link')} to={PHOTOS}>See photos →</Link>
            : <button type="button" className={sx('ev-link quiet')} onClick={() => toast('Opening your note…')}>Leave a note →</button>}
          {ev.receipt && <Link className={sx('ev-link quiet')} to={RECEIPT}>Receipt →</Link>}
        </>
      )}

      {ev.cat === 'saved' && (
        <>
          {ev.soldOut
            ? <Button variant="ghost" onClick={() => toast('Added to the waitlist — we’ll be in touch', 'success')}>Join waitlist</Button>
            : <Button variant="jade" onClick={() => rsvpSaved(ev.id)}>RSVP</Button>}
          <button type="button" className={sx('ev-link quiet')} onClick={() => softRemove(ev.id, 'Removed from saved')}>Remove →</button>
        </>
      )}

      {ev.cat === 'invite' && (
        <div className={sx('invite-row')}>
          <Button variant="jade" onClick={() => acceptInvite(ev.id)}>Accept</Button>
          <Button variant="ghost" onClick={() => declineInvite(ev.id)}>Decline</Button>
        </div>
      )}

      {ev.cat === 'sent' && <Link className={sx('ev-link')} to={MANAGE}>Manage →</Link>}
    </div>
  )
}

function ToolBtn({ on, danger, onClick, children }: { on?: boolean; danger?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={sx(`tool-btn${on ? ' on' : ''}${danger ? ' danger' : ''}`)} onClick={onClick}>{children}</button>
  )
}

/** The card-tools row, varying by category. */
export function EventTools({ ev, dayofShown, onToggleDayof }: { ev: MyEvent; dayofShown: boolean; onToggleDayof: () => void }) {
  const c = useMyEvents()
  const onMore = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    c.openMore(ev.id, r.left, r.bottom + 6)
  }
  const Bell = (
    <ToolBtn on={ev.reminder} onClick={() => c.toggleReminder(ev.id)}>
      {Icons.bell}<span>{ev.reminder ? 'Reminder on' : 'Remind me'}</span>
    </ToolBtn>
  )
  const Cal = <ToolBtn onClick={() => c.toast('Added to your calendar', 'success')}>{Icons.cal}Add to calendar</ToolBtn>
  const MoreBtn = (
    <button type="button" className={sx('tool-btn')} aria-label="More options" onClick={onMore}>{Icons.more}More</button>
  )
  const DayofBtn = isToday(ev) && ev.dayof
    ? <ToolBtn on={dayofShown} onClick={onToggleDayof}>{Icons.info}Day-of details</ToolBtn>
    : null

  if (ev.cat === 'going') {
    if (ev.cancelled) return null
    return (
      <div className={sx('card-tools')}>
        {Bell}{DayofBtn}
        {ev.maybe && <ToolBtn onClick={() => c.setGoing(ev.id)}>{Icons.check}Switch to going</ToolBtn>}
        {Cal}
        <ToolBtn onClick={() => c.openDetails(ev.id)}>{Icons.edit}Your details</ToolBtn>
        <ToolBtn danger onClick={() => c.cantGo(ev.id)}>{Icons.x}Can’t make it</ToolBtn>
        {MoreBtn}
      </div>
    )
  }
  if (ev.cat === 'hosting') {
    return (
      <div className={sx('card-tools')}>
        {Bell}{Cal}
        {!ev.cohost && <Link className={sx('tool-btn')} to={COHOST}>{Icons.plus}Invite a co-host</Link>}
        {MoreBtn}
      </div>
    )
  }
  if (ev.cat === 'waitlisted') {
    return (
      <div className={sx('card-tools')}>
        {Bell}
        <ToolBtn danger onClick={() => c.leaveWaitlist(ev.id)}>{Icons.leave}Leave waitlist</ToolBtn>
        {MoreBtn}
      </div>
    )
  }
  if (ev.cat === 'past') {
    return (
      <div className={sx('card-tools')}>
        {ev.noShow
          ? <ToolBtn onClick={() => c.toast('Opening a note to the host…')}>{Icons.info}Tell the host why</ToolBtn>
          : <ToolBtn onClick={() => c.toast('Thank-you sent to the host', 'success')}>{Icons.heart}Thank the host</ToolBtn>}
        {ev.connect && <ToolBtn onClick={() => c.toast('Showing people you met here…')}>{Icons.connect}Connect with who you met</ToolBtn>}
        {MoreBtn}
      </div>
    )
  }
  if (ev.cat === 'saved') {
    return <div className={sx('card-tools')}>{Bell}{MoreBtn}</div>
  }
  if (ev.cat === 'invite') {
    return (
      <div className={sx('card-tools')}>
        <ToolBtn onClick={() => c.toast('Opening a message to the host…')}>{Icons.msg}Ask a question</ToolBtn>
        {MoreBtn}
      </div>
    )
  }
  if (ev.cat === 'sent') {
    return (
      <div className={sx('card-tools')}>
        <ToolBtn onClick={() => c.toast(`Nudge sent to ${ev.invitee}`, 'success')}>{Icons.bell}Send a nudge</ToolBtn>
        <ToolBtn danger onClick={() => c.softRemove(ev.id, 'Invitation withdrawn')}>{Icons.x}Withdraw</ToolBtn>
      </div>
    )
  }
  return null
}
