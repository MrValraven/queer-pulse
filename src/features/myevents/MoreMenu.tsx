import { useEffect, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { sx } from './myEvents.styles'
import { useMyEvents } from './MyEventsContext'
import { Icons } from './MyEventsIcons'
import { COMMITTED } from './myEvents.helpers'
import { routes } from '../../app/routeMap'
import { gatheringPath } from '../gatherings/data'
import type { MyEvent } from './myEvents.types'

interface Item { icon: ReactNode; label: string; onClick: () => void; danger?: boolean }

function buildItems(ev: MyEvent, c: ReturnType<typeof useMyEvents>, nav: (path: string) => void): (Item | 'sep')[] {
  const t = (msg: string, type: 'success' | 'info' = 'info') => () => { c.closeMore(); c.toast(msg, type) }
  const go = (path: string) => () => { c.closeMore(); nav(path) }
  const share = () => {
    c.closeMore()
    const url = (typeof window !== 'undefined' ? window.location.origin : '') + (ev.slug ? gatheringPath(ev.slug) : routes.gathering)
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => c.toast('Event link copied — share it anywhere', 'success'),
        () => c.toast('Couldn’t copy the link — try again', 'info'),
      )
    } else {
      c.toast('Event link copied — share it anywhere', 'success')
    }
  }
  const items: (Item | 'sep')[] = [{ icon: Icons.share, label: 'Share this event', onClick: share }]
  if (ev.cat === 'going' || ev.cat === 'saved' || ev.cat === 'hosting') items.push({ icon: Icons.invite, label: 'Invite a friend', onClick: go(routes.invite) })
  if (ev.cat !== 'past' && ev.cat !== 'hosting' && ev.cat !== 'sent') items.push({ icon: Icons.msg, label: 'Message the host', onClick: go(routes.messages) })
  if (COMMITTED[ev.cat]) items.push({ icon: Icons.chat, label: 'Open group chat', onClick: go(routes.messages) })
  if (ev.cat === 'going' && !ev.cancelled) {
    items.push(ev.maybe
      ? { icon: Icons.maybe, label: 'Change to going', onClick: () => c.setGoing(ev.id) }
      : { icon: Icons.maybe, label: 'Mark as maybe', onClick: () => c.setMaybe(ev.id) })
  }
  if (ev.ticket) {
    items.push({ icon: Icons.ticket, label: 'Transfer ticket', onClick: t('Choose who to transfer your ticket to…') })
    items.push({ icon: Icons.refund, label: 'Request a refund', onClick: t('Refund requested — 3–5 days back to your card', 'success') })
    items.push({ icon: Icons.wallet, label: 'Add to Apple Wallet', onClick: t('Added to Apple Wallet', 'success') })
  }
  if (ev.cat === 'past' && ev.connect) items.push({ icon: Icons.connect, label: 'Connect with who you met', onClick: t('Showing people you met here…') })
  if (ev.cat !== 'hosting' && ev.cat !== 'sent') {
    items.push('sep')
    items.push({ icon: Icons.report, label: 'Report this event', onClick: () => c.openReport(ev.id), danger: true })
    items.push({ icon: Icons.block, label: 'Block the host', onClick: () => c.openBlock(ev.id), danger: true })
  }
  return items
}

/** Fixed-position overflow menu for an event card. */
export function MoreMenu() {
  const c = useMyEvents()
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)
  const { open, evId, x, y } = c.moreMenu
  const { closeMore } = c

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) closeMore() }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMore() }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open, closeMore])

  const ev = evId ? c.byId(evId) : undefined
  const left = Math.min(x, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 220)

  return (
    <div ref={ref} className={`${sx('more-menu')} ${open ? sx('show') : ''}`} role="menu" style={{ left, top: y }}>
      {open && ev && buildItems(ev, c, navigate).map((it, i) => (
        it === 'sep'
          ? <div key={`s${i}`} className={sx('mm-sep')} />
          : <button key={it.label} type="button" role="menuitem" className={sx(`mm-item${it.danger ? ' danger' : ''}`)} onClick={it.onClick}>{it.icon}{it.label}</button>
      ))}
    </div>
  )
}
