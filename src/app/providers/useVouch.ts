import {
  createContext,
  useContext,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useGivenVouches } from "../../features/members/api/useGivenVouches";

export interface VouchContextValue {
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
export interface VouchStore extends VouchContextValue {
  setVouched: Dispatch<SetStateAction<string[]>>;
}

export const VouchContext = createContext<VouchStore | null>(null);

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
    // cases where the old effect left the persisted list alone. The query now
    // returns rich faces; the local store only needs the slugs.
    if (!serverVouched) return;
    setVouched(serverVouched.map((givenVouch) => givenVouch.slug));
  }, [serverVouched, setVouched]);

  return store;
}
