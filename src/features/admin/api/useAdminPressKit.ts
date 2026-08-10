import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "./demoAwareMutation";
import {
  createDemoPressContact,
  createDemoPressCoverage,
  deleteDemoPressContact,
  deleteDemoPressCoverage,
  getDemoPressContacts,
  getDemoPressCoverage,
  getDemoPressFacts,
  reorderDemoPressContacts,
  reorderDemoPressCoverage,
  updateDemoPressContact,
  updateDemoPressCoverage,
} from "../adminPressKit.data";
import {
  createPressContact,
  createPressCoverage,
  deletePressContact,
  deletePressCoverage,
  getAdminPressContacts,
  getAdminPressCoverage,
  getPressKitPublic,
  reorderPressContacts,
  reorderPressCoverage,
  updatePressContact,
  updatePressCoverage,
  type AdminPressContactDTO,
  type AdminPressCoverageDTO,
  type PressContactInput,
  type PressContactPatch,
  type PressCoverageInput,
  type PressCoveragePatch,
  type PressKitFactDTO,
} from "./pressKit.api";

/** Shared key prefix for every admin press-kit query — coverage, contacts and
 *  the derived facts preview — so a single `invalidateQueries({ queryKey:
 *  [ADMIN_PRESS_KIT_KEY] })` after any mutation refreshes all of them,
 *  exactly like `ADMIN_LANDING_KEY` in `useLandingFeatures.ts`. */
const ADMIN_PRESS_KIT_KEY = "admin-press-kit";

/**
 * The ordered press-coverage rows, in `position` order. Demo mode reads the
 * module-scoped demo-session registry (`adminPressKit.data.ts`); live mode
 * calls `GET /admin/press-kit/coverage`. `demoMode` sits in the key so a mode
 * flip refetches from the correct source.
 */
export function useAdminPressCoverage() {
  const { demoMode } = useDemoMode();
  const query = useQuery<AdminPressCoverageDTO[]>({
    queryKey: [ADMIN_PRESS_KIT_KEY, "coverage", demoMode],
    queryFn: async () =>
      demoMode ? getDemoPressCoverage() : getAdminPressCoverage(),
  });
  return { ...query, coverage: query.data ?? [] };
}

/** The ordered press-desk contacts. See {@link useAdminPressCoverage}; live
 *  mode calls `GET /admin/press-kit/contacts`. */
export function useAdminPressContacts() {
  const { demoMode } = useDemoMode();
  const query = useQuery<AdminPressContactDTO[]>({
    queryKey: [ADMIN_PRESS_KIT_KEY, "contacts", demoMode],
    queryFn: async () =>
      demoMode ? getDemoPressContacts() : getAdminPressContacts(),
  });
  return { ...query, contacts: query.data ?? [] };
}

/**
 * The auto-derived headline `facts` from the PUBLIC read (`GET /press-kit`),
 * surfaced read-only so admins can see the numbers the public page shows.
 * Demo mode reads the demo fixture; live mode pulls `facts` off the public
 * response.
 */
export function usePressKitFacts() {
  const { demoMode } = useDemoMode();
  const query = useQuery<PressKitFactDTO[]>({
    queryKey: [ADMIN_PRESS_KIT_KEY, "facts", demoMode],
    queryFn: async () =>
      demoMode ? getDemoPressFacts() : (await getPressKitPublic()).facts,
  });
  return { ...query, facts: query.data ?? [] };
}

// ── Coverage mutations ──────────────────────────────────────────────────────
// Each invalidates on plain `onSuccess` (both modes) rather than
// `onLiveSuccess`, because demo mode's "network" is a synchronous write to a
// module-level registry: without a refetch react-query would keep serving the
// stale cached list. Same rationale as `useCreateLandingFeature`.

export function useCreatePressCoverage() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<AdminPressCoverageDTO, unknown, PressCoverageInput>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: [ADMIN_PRESS_KIT_KEY, "coverage", "create"],
    demoResult: (input) => createDemoPressCoverage(input),
    live: (input) => createPressCoverage(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_PRESS_KIT_KEY] });
    },
  });
}

export function useUpdatePressCoverage() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminPressCoverageDTO,
    unknown,
    { id: string; patch: PressCoveragePatch }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: [ADMIN_PRESS_KIT_KEY, "coverage", "update"],
    demoResult: ({ id, patch }) => updateDemoPressCoverage(id, patch),
    live: ({ id, patch }) => updatePressCoverage(id, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_PRESS_KIT_KEY] });
    },
  });
}

export function useDeletePressCoverage() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<void, unknown, { id: string }>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: [ADMIN_PRESS_KIT_KEY, "coverage", "delete"],
    demoResult: ({ id }) => deleteDemoPressCoverage(id),
    live: ({ id }) => deletePressCoverage(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_PRESS_KIT_KEY] });
    },
  });
}

export function useReorderPressCoverage() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminPressCoverageDTO[],
    unknown,
    { orderedIds: string[] }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: [ADMIN_PRESS_KIT_KEY, "coverage", "reorder"],
    demoResult: ({ orderedIds }) => reorderDemoPressCoverage(orderedIds),
    live: ({ orderedIds }) => reorderPressCoverage({ orderedIds }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_PRESS_KIT_KEY] });
    },
  });
}

// ── Contact mutations ───────────────────────────────────────────────────────
export function useCreatePressContact() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<AdminPressContactDTO, unknown, PressContactInput>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: [ADMIN_PRESS_KIT_KEY, "contacts", "create"],
    demoResult: (input) => createDemoPressContact(input),
    live: (input) => createPressContact(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_PRESS_KIT_KEY] });
    },
  });
}

export function useUpdatePressContact() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminPressContactDTO,
    unknown,
    { id: string; patch: PressContactPatch }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: [ADMIN_PRESS_KIT_KEY, "contacts", "update"],
    demoResult: ({ id, patch }) => updateDemoPressContact(id, patch),
    live: ({ id, patch }) => updatePressContact(id, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_PRESS_KIT_KEY] });
    },
  });
}

export function useDeletePressContact() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<void, unknown, { id: string }>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: [ADMIN_PRESS_KIT_KEY, "contacts", "delete"],
    demoResult: ({ id }) => deleteDemoPressContact(id),
    live: ({ id }) => deletePressContact(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_PRESS_KIT_KEY] });
    },
  });
}

export function useReorderPressContacts() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminPressContactDTO[],
    unknown,
    { orderedIds: string[] }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: [ADMIN_PRESS_KIT_KEY, "contacts", "reorder"],
    demoResult: ({ orderedIds }) => reorderDemoPressContacts(orderedIds),
    live: ({ orderedIds }) => reorderPressContacts({ orderedIds }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_PRESS_KIT_KEY] });
    },
  });
}
