import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

/**
 * Logged-in page frame: the single site-wide Navbar (which reflects auth state)
 * + main content + the full site Footer. `unreadCount` feeds the nav's
 * notifications bell.
 */
export function AppShell({
  children,
  unreadCount,
}: {
  children: ReactNode;
  unreadCount?: number;
}) {
  return (
    <>
      <Navbar unreadCount={unreadCount} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
