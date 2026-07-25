import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";
import { VouchMemberModal } from "../../features/members/VouchMemberModal";
import { useAuth } from "./authContext";
import { useVouchMutations } from "../../features/members/api/useVouchMutations";
import { useGivenVouches } from "../../features/members/api/useGivenVouches";

interface VouchContextValue {
  /** Member slugs the current user has vouched for, most-recent first. */
  vouched: string[];
  /** Has the current user already vouched for this member slug? */
  hasVouched: (slug: string) => boolean;
  /** Open the vouch modal addressed to a member slug. */
  openVouch: (slug: string) => void;
  /** Withdraw an existing vouch for a member slug. */
  removeVouch: (slug: string) => void;
}

/**
 * The context actually carried. `setVouched` is internal plumbing for the
 * hydration in `useVouch()`, kept out of the public `VouchContextValue` both
 * hooks are annotated to return.
 */
interface VouchStore extends VouchContextValue {
  setVouched: Dispatch<SetStateAction<string[]>>;
}

const VouchContext = createContext<VouchStore | null>(null);
const STORAGE_KEY = "qp.vouches.v1";

function readInitial(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
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

function useVouchStore(): VouchStore {
  const ctx = useContext(VouchContext);
  if (!ctx) {
    throw new Error("useVouch must be used within VouchProvider");
  }
  return ctx;
}

/**
 * The local vouch store, its mutators and the modal opener, with **no query
 * subscription**.
 *
 * Use this when the local/optimistic list is all you need — notably any demo-
 * only derivation, or a consumer that only opens the modal. Calling `useVouch()`
 * there would re-introduce the eager `/me/vouches/given` request this phase
 * removes, and nothing would visibly break: only the request-budget test would
 * catch it.
 */
export function useVouchActions(): VouchContextValue {
  return useVouchStore();
}

/**
 * The full vouch view: the local store hydrated from the server's list of
 * vouches you've given.
 *
 * Subscribing here is what fires `GET /me/vouches/given` — on a profile page or
 * the connections page, not on `/feed`. Same return shape as before phase 4.
 *
 * Hydration replaces the list wholesale, exactly as the provider's old effect
 * did — the server is authoritative and the local copy is a cache. Safe from
 * several subscribers at once: react-query hands them all the same `data`
 * reference, so this only re-runs when a fetch resolves, which `staleTime:
 * Infinity` limits to once per session.
 */
export function useVouch(): VouchContextValue {
  const store = useVouchStore();
  const { setVouched } = store;
  const { data: serverVouched } = useGivenVouches();

  useEffect(() => {
    // `undefined` covers demo, logged out, in-flight and failed — the four
    // cases where the old effect left the persisted list alone.
    if (!serverVouched) return;
    setVouched(serverVouched);
  }, [serverVouched, setVouched]);

  return store;
}
