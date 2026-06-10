import type { ReactNode } from 'react'
import { AppNav } from './AppNav'

/** Logged-in page frame: floating app nav + main content (no marketing footer). */
export function AppShell({
  children,
  unreadCount,
}: {
  children: ReactNode
  unreadCount?: number
}) {
  return (
    <>
      <AppNav unreadCount={unreadCount} />
      <main>{children}</main>
    </>
  )
}
