import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { VouchMemberModal } from "../../features/members/VouchMemberModal";
import { useAuth } from "./authContext";
import { useVouchMutations } from "../../features/members/api/useVouchMutations";
import { VouchContext, type VouchStore } from "./useVouch";

const STORAGE_KEY = "qp.vouches.v1";

function readInitial(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

/**
 * App-wide store of which members the current user has publicly vouched for,
 * plus the host for the vouch modal. Persists to localStorage so a vouch stays
 * reflected on the member's profile (their "Vouched for by…" row gains your
 * face) across pages and reloads.
 *
 * **The provider no longer fetches** (phase 4). Its keyless `useEffect` +
 * `getGivenVouches()` fired on every route; that now lives in
 * `useGivenVouches()`, subscribed only by `useVouch()`.
 *
 * What stays app-wide, and why it must:
 * - `vouched` — a localStorage store read by three different features, and the
 *   optimistic target of `useVouchMutations`. Cheap, synchronous, shared.
 * - `openSlug` + `<VouchMemberModal>` — a RENDER SIDE-EFFECT. The modal is a
 *   sibling of `children`, so any component anywhere can call `openVouch()` and
 *   have the modal appear. Moving this into a hook would mean every would-be
 *   opener has to render the modal itself. It does not move.
 */
export function VouchProvider({ children }: { children: ReactNode }) {
  const [vouched, setVouched] = useState<string[]>(readInitial);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vouched));
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  }, [vouched]);

  const { refresh } = useAuth();

  // The vouch / unvouch optimistic lifecycle (optimistic setVouched → API →
  // rollback on error → invalidate + refresh on settle) lives in React Query.
  //
  // Passing `setVouched` in is intentional and stays that way: the list it
  // mutates IS provider state (see the docblock above), so the mutations must
  // write there. Re-pointing them at a query cache would drag the localStorage
  // store out of the provider — the one thing this refactor must not do.
  const { unvouch } = useVouchMutations({ setVouched, refresh });

  const openVouch = useCallback((slug: string) => setOpenSlug(slug), []);
  const close = useCallback(() => setOpenSlug(null), []);

  const removeVouch = useCallback(
    (slug: string) => {
      unvouch.mutate(slug);
    },
    [unvouch],
  );

  const value = useMemo<VouchStore>(
    () => ({
      vouched,
      hasVouched: (slug) => vouched.includes(slug),
      openVouch,
      removeVouch,
      setVouched,
    }),
    [vouched, openVouch, removeVouch],
  );

  return (
    <VouchContext.Provider value={value}>
      {children}
      {openSlug && (
        <VouchMemberModal
          slug={openSlug}
          onClose={close}
          // The modal performs the real vouch write itself (useVouchMember).
          // onVouched only records it in the optimistic list that drives
          // `hasVouched` + the face-row — it must NOT fire its own POST here, or
          // the endpoint would 409 (the modal already created the row) and the
          // failure would roll this entry back out. Prepend without a network write.
          onVouched={() =>
            setVouched((prev) =>
              prev.includes(openSlug) ? prev : [openSlug, ...prev],
            )
          }
        />
      )}
    </VouchContext.Provider>
  );
}
