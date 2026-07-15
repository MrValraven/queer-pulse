import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { VouchMemberModal } from "../../features/members/VouchMemberModal";
import { useDemoMode } from "./DemoModeProvider";
import { useAuth } from "./authContext";
import { getGivenVouches } from "../../features/members/api/members.api";
import { useVouchMutations } from "../../features/members/api/useVouchMutations";

interface VouchContextValue {
  /** Member slugs the current user has vouched for, most-recent first. */
  vouched: string[];
  /** Has the current user already vouched for this member slug? */
  hasVouched: (slug: string) => boolean;
  /** Open the vouch modal addressed to a member slug. */
  openVouch: (slug: string) => void;
  /** Record a vouch for a member slug (called by the modal on success). */
  addVouch: (slug: string) => void;
  /** Withdraw an existing vouch for a member slug. */
  removeVouch: (slug: string) => void;
}

const VouchContext = createContext<VouchContextValue | null>(null);
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
 * face) across pages and reloads. Data is still mock; this only tracks which
 * mock slugs the user has co-signed.
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

  const { demoMode } = useDemoMode();
  const { refresh, loggedIn } = useAuth();

  // The vouch / unvouch optimistic lifecycle (optimistic setVouched → API →
  // rollback on error → invalidate + refresh on settle) now lives in React Query.
  const { vouch, unvouch } = useVouchMutations({ setVouched, refresh });

  useEffect(() => {
    if (demoMode || !loggedIn) return;
    let active = true;
    getGivenVouches()
      .then((rows) => {
        if (active) setVouched(rows.map((r) => r.slug));
      })
      .catch(() => {
        /* not active / not authorized — leave as-is */
      });
    return () => {
      active = false;
    };
  }, [demoMode, loggedIn]);

  const openVouch = useCallback((slug: string) => setOpenSlug(slug), []);
  const close = useCallback(() => setOpenSlug(null), []);
  const addVouch = useCallback(
    (slug: string) => {
      vouch.mutate(slug);
    },
    [vouch],
  );

  const removeVouch = useCallback(
    (slug: string) => {
      unvouch.mutate(slug);
    },
    [unvouch],
  );

  const value = useMemo<VouchContextValue>(
    () => ({
      vouched,
      hasVouched: (slug) => vouched.includes(slug),
      openVouch,
      addVouch,
      removeVouch,
    }),
    [vouched, openVouch, addVouch, removeVouch],
  );

  return (
    <VouchContext.Provider value={value}>
      {children}
      {openSlug && (
        <VouchMemberModal
          slug={openSlug}
          onClose={close}
          onVouched={() => addVouch(openSlug)}
        />
      )}
    </VouchContext.Provider>
  );
}

export function useVouch() {
  const ctx = useContext(VouchContext);
  if (!ctx) {
    throw new Error("useVouch must be used within VouchProvider");
  }
  return ctx;
}
