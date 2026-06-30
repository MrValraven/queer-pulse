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
import {
  vouchFor,
  getGivenVouches,
} from "../../features/members/api/members.api";
import { queryClient } from "../../shared/api/queryClient";

interface VouchContextValue {
  /** Member slugs the current user has vouched for, most-recent first. */
  vouched: string[];
  /** Has the current user already vouched for this member slug? */
  hasVouched: (slug: string) => boolean;
  /** Open the vouch modal addressed to a member slug. */
  openVouch: (slug: string) => void;
  /** Record a vouch for a member slug (called by the modal on success). */
  addVouch: (slug: string) => void;
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
  const { refresh } = useAuth();

  useEffect(() => {
    if (demoMode) return;
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
  }, [demoMode]);

  const openVouch = useCallback((slug: string) => setOpenSlug(slug), []);
  const close = useCallback(() => setOpenSlug(null), []);
  const addVouch = useCallback(
    (slug: string) => {
      setVouched((prev) => (prev.includes(slug) ? prev : [slug, ...prev]));
      if (demoMode) return;
      vouchFor(slug)
        .then(() => {
          // Refresh the vouchee's profile + the directory so counts update.
          queryClient.invalidateQueries({ queryKey: ["profile"] });
          queryClient.invalidateQueries({ queryKey: ["members"] });
          // If the current user just crossed the threshold and got promoted,
          // pick up the new status claim. (No-op in demo.)
          void refresh();
        })
        .catch(() => {
          // Roll back the optimistic add on failure.
          setVouched((prev) => prev.filter((s) => s !== slug));
        });
    },
    [demoMode, refresh],
  );

  const value = useMemo<VouchContextValue>(
    () => ({
      vouched,
      hasVouched: (slug) => vouched.includes(slug),
      openVouch,
      addVouch,
    }),
    [vouched, openVouch, addVouch],
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
