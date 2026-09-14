import { createContext } from "react";

/**
 * Opens the profile editor from the board section's "Post to board" CTA
 * (`BoardSection` → `BoardFooterStrip`).
 *
 * Desktop read-mode reaches `BoardSection` through `restBelowHero`, a
 * `ReactNode` assembled once in `ProfilePage` by calling `profileBelowHeroNodes`
 * — a plain helper function, not JSX. Passing the "open the editor" closure
 * as one of that helper's arguments trips `react-hooks/refs`
 * ("Passing a ref to a function may read its value during render"): the
 * closure calls `enterEdit`, which writes `ProfilePage`'s scroll-position
 * ref, and the lint rule can't prove a plain function won't invoke a
 * ref-touching callback synchronously during render the way it can for a
 * value handed to JSX (where `onEdit={() => enterEdit(false)}` on
 * `ProfileLayoutSwitch` is fine) or to a hook. Context sidesteps this the
 * same way: the provider assigns the closure as a JSX prop (safe), and
 * `BoardSection` reads it back with `useContext` (also safe) instead of
 * receiving it through that plain-function chain.
 *
 * `MobileProfileTabPanels` could reach `BoardSection` through a pure JSX path
 * too (`ProfilePage` → `ProfileLayoutSwitch` → `MobileProfileView` →
 * `MobileProfileTabs` → `MobileProfileTabPanels`), and an earlier version of
 * this threaded a matching `onEditBoard` prop the whole way down for that
 * leg. That gave the mobile path two live sources for the same callback — a
 * prop chain and this context, both resolving to the same closure only
 * because nothing had changed either one yet — with no way to tell from the
 * call site which one actually won. `ProfileLayoutSwitch` renders inside this
 * context's provider on every layout, mobile included, so the context alone
 * is now the single source of truth for both; the four-file prop chain was
 * removed rather than kept as a redundant, always-agreeing shadow of it.
 */
export const ProfileEditBoardContext = createContext<(() => void) | undefined>(
  undefined,
);
