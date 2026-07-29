import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DEFAULT_WORK_PREFERENCES,
  normalizeWorkPreferences,
  putWorkPreferences,
  type WorkPreferencesDTO,
} from "../../features/economy/api/workPreferences.api";
import { useDemoMode } from "./DemoModeProvider";
import { useAuth } from "./authContext";
import { logError } from "../../shared/observability/logger";
import {
  WorkProfileContext,
  type WorkProfileContextValue,
} from "./useWorkProfile";

/**
 * The member's Work Profile safety preferences — out-at-work disclosure, trans
 * supports, and the verified-safe-employers-only filter the jobs board reads.
 *
 * Dual-mode: demo mode never touches the network and keeps the same in-memory
 * session behaviour the prototype always had (seeded from
 * `DEFAULT_WORK_PREFERENCES`, `save()` resolves true). Live mode hydrates from
 * GET /me/work-preferences and writes through PUT /me/work-preferences.
 *
 * Because this is outness-disclosure state, the provider keeps two copies: the
 * `draft` the editor mutates, and `persisted` — the last values the server
 * confirmed. A failed write restores `draft` from `persisted`, so what a member
 * sees is always what is actually stored about them.
 */
export function WorkProfileProvider({ children }: { children: ReactNode }) {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const queryClient = useQueryClient();

  const [draft, setDraft] = useState<WorkPreferencesDTO>(
    DEFAULT_WORK_PREFERENCES,
  );
  // Server truth. A ref (not state) because nothing renders from it directly —
  // it only ever seeds the draft and restores it after a failed write.
  const persisted = useRef<WorkPreferencesDTO>(DEFAULT_WORK_PREFERENCES);

  const live = !demoMode && loggedIn;

  // Whether this live session has already adopted the server's values.
  const hydrated = useRef(false);

  const hydrate = useCallback((data: WorkPreferencesDTO) => {
    if (hydrated.current) return;
    hydrated.current = true;
    persisted.current = data;
    setDraft(data);
  }, []);

  // Leaving live mode (sign-out, or the demo toggle) drops back to the safe
  // defaults rather than leaving another session's disclosure settings on
  // screen — and re-arms the latch so the next session hydrates for itself.
  useEffect(() => {
    if (live) return;
    hydrated.current = false;
    persisted.current = DEFAULT_WORK_PREFERENCES;
    // Resets on the external live/demo mode change, re-arming the hydration latch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(DEFAULT_WORK_PREFERENCES);
  }, [live]);

  const { mutateAsync: writePreferences, isPending: saving } = useMutation({
    mutationKey: ["workPreferences", "save"],
    mutationFn: putWorkPreferences,
  });

  const setOutAtWork = useCallback((v: string) => {
    setDraft((prev) => normalizeWorkPreferences({ ...prev, outAtWork: v }));
  }, []);

  const setSafeOnly = useCallback((v: boolean) => {
    setDraft((prev) => ({ ...prev, safeOnly: v }));
  }, []);

  const toggleTransSupport = useCallback((id: string) => {
    setDraft((prev) => {
      const has = prev.transSupport.some((x) => x === id);
      const next: string[] = has
        ? prev.transSupport.filter((x) => x !== id)
        : [...prev.transSupport, id];
      return normalizeWorkPreferences({ ...prev, transSupport: next });
    });
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    if (!live) {
      // Demo: the session copy is the only store there is, so it's already saved.
      persisted.current = draft;
      return true;
    }
    try {
      const saved = await writePreferences(draft);
      persisted.current = saved;
      setDraft(saved);
      queryClient.setQueryData(["workPreferences", demoMode], saved);
      return true;
    } catch (err) {
      logError(err, { scope: "workPreferences.save" });
      // Never leave an unwritten disclosure setting on screen.
      setDraft(persisted.current);
      return false;
    }
  }, [live, draft, writePreferences, queryClient, demoMode]);

  const value = useMemo<WorkProfileContextValue>(
    () => ({
      outAtWork: draft.outAtWork,
      setOutAtWork,
      transSupport: draft.transSupport,
      toggleTransSupport,
      safeOnly: draft.safeOnly,
      setSafeOnly,
      saving,
      save,
      hydrate,
    }),
    [draft, setOutAtWork, toggleTransSupport, setSafeOnly, saving, save, hydrate],
  );

  return (
    <WorkProfileContext.Provider value={value}>
      {children}
    </WorkProfileContext.Provider>
  );
}
