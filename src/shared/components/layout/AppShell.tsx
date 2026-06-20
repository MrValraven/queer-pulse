import type { ReactNode } from 'react'
import { Navbar } from './Navbar'

/**
 * Logged-in page frame: the single site-wide Navbar (which reflects auth state)
 * + main content, with no marketing footer. `unreadCount` feeds the nav's
 * notifications bell.
 */
export function AppShell({
  children,
  unreadCount,
}: {
  children: ReactNode
  unreadCount?: number
}) {
  return (
    <>
      <Navbar unreadCount={unreadCount} />
      <main>{children}</main>
    </>
  )
}
