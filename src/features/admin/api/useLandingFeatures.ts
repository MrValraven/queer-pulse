import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "./demoAwareMutation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  createDemoLandingFeature,
  deleteDemoLandingFeature,
  getDemoLandingEligible,
  getDemoLandingFeatures,
  reorderDemoLandingFeatures,
  updateDemoLandingFeature,
} from "../adminLanding.data";
import {
  dtoToLandingFeatureVM,
  type LandingFeatureVM,
} from "./landingFeatures.adapters";
import {
  createLandingFeature,
  deleteLandingFeature,
  getAdminLandingEligible,
  getAdminLandingFeatures,
  reorderLandingFeatures,
  updateLandingFeature,
  type AdminEligibleEntityDTO,
  type AdminLandingFeatureDTO,
  type LandingSection,
} from "./landingFeatures.api";

/** Shared key prefix for every admin landing-curation query — features AND
 *  eligible-pool alike — so a single `invalidateQueries({ queryKey:
 *  [ADMIN_LANDING_KEY] })` after any mutation refreshes both: a newly
 *  featured entity must disappear from the eligible picker in the same
 *  stroke it appears in the curated list. */
const ADMIN_LANDING_KEY = "admin-landing";

/**
 * One section's curated landing-page slots, in `position` order. Demo mode
 * reads the module-scoped demo-session registry (`adminLanding.data.ts`) —
 * seeded from the real homepage curation the first time any section is
 * read — and adapts each DTO through `dtoToLandingFeatureVM` exactly like
 * live mode does, so both modes exercise the same adapter/translation path.
 * Live mode calls `GET /admin/landing/features?section=...`.
 *
 * `language` sits in the query key because `dtoToLandingFeatureVM` resolves
 * `hiddenReason` through `t()` — a language switch must re-map the
 * already-fetched DTOs, not just re-render a stale English label.
 */
export function useLandingFeatures(section: LandingSection) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const query = useQuery<LandingFeatureVM[]>({
    queryKey: [ADMIN_LANDING_KEY, section, demoMode, language],
    queryFn: async () => {
      if (demoMode) {
        return getDemoLandingFeatures(section).map((dto) =>
          dtoToLandingFeatureVM(dto, t),
        );
      }
      const featureDtos = await getAdminLandingFeatures(section);
      return featureDtos.map((dto) => dtoToLandingFeatureVM(dto, t));
    },
  });
  return { ...query, features: query.data ?? [] };
}

/**
 * The "not yet featured" picker pool for `section`, narrowed by `search`.
 * Demo mode derives it from the same demo-session registry `useLandingFeatures`
 * reads — an entity the session has since featured drops out of this list
 * immediately, matching how the live `eligible` endpoint excludes anything
 * already in `landing_features` for that section. Live mode calls
 * `GET /admin/landing/eligible?section=...&search=...`.
 */
export function useLandingEligible(section: LandingSection, search: string) {
  const { demoMode } = useDemoMode();
  const query = useQuery<AdminEligibleEntityDTO[]>({
    queryKey: [ADMIN_LANDING_KEY, "eligible", section, search, demoMode],
    queryFn: async () => {
      if (demoMode) return getDemoLandingEligible(section, search);
      return getAdminLandingEligible(section, search);
    },
  });
  return { ...query, options: query.data ?? [] };
}

/**
 * Feature a new entity onto `section`'s landing slots.
 *
 * Demo mode writes straight into the demo-session registry
 * (`createDemoLandingFeature`) rather than the network — there is no server
 * to persist to, and the registry IS the demo session's source of truth, so
 * every other open tab/component reading it via `useLandingFeatures` must see
 * the addition too. Live mode calls `POST /admin/landing/features`.
 *
 * Unlike the rest of this file's mutations (which follow `useAdminMembers`'s
 * live-only-invalidation convention via `onLiveSuccess`), this one invalidates
 * on plain `onSuccess` — which `useDemoAwareMutation` runs in BOTH modes —
 * because demo mode's "network" is really just a synchronous write to a
 * module-level object: without a refetch, react-query would keep serving the
 * stale cached list and the newly created slot would never render.
 */
export function useCreateLandingFeature() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminLandingFeatureDTO,
    unknown,
    { section: LandingSection; targetId: string; copy: Record<string, unknown> }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: [ADMIN_LANDING_KEY, "create"],
    demoResult: ({ section, targetId, copy }) =>
      createDemoLandingFeature(section, targetId, copy),
    live: (variables) => createLandingFeature(variables),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_LANDING_KEY] });
    },
  });
}

/**
 * Edit one feature's `copy` and/or `active` flag.
 *
 * Demo mode patches the matching entry in the demo-session registry
 * (`updateDemoLandingFeature`); live mode calls
 * `PATCH /admin/landing/features/:id`. See {@link useCreateLandingFeature}
 * for why this refetches on plain `onSuccess` rather than `onLiveSuccess`.
 */
export function useUpdateLandingFeature() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminLandingFeatureDTO,
    unknown,
    { id: string; copy?: Record<string, unknown>; active?: boolean }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: [ADMIN_LANDING_KEY, "update"],
    demoResult: ({ id, copy, active }) =>
      updateDemoLandingFeature(id, { copy, active }),
    live: ({ id, copy, active }) => updateLandingFeature(id, { copy, active }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_LANDING_KEY] });
    },
  });
}

/**
 * Persist a section's new slot order after a drag-reorder.
 *
 * Demo mode re-derives `position` for every feature in `section` from
 * `orderedIds` (`reorderDemoLandingFeatures`); live mode calls
 * `PATCH /admin/landing/features/reorder`. See {@link useCreateLandingFeature}
 * for why this refetches on plain `onSuccess` rather than `onLiveSuccess`.
 */
export function useReorderLandingFeatures() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminLandingFeatureDTO[],
    unknown,
    { section: LandingSection; orderedIds: string[] }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: [ADMIN_LANDING_KEY, "reorder"],
    demoResult: ({ section, orderedIds }) =>
      reorderDemoLandingFeatures(section, orderedIds),
    live: (variables) => reorderLandingFeatures(variables),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_LANDING_KEY] });
    },
  });
}

/**
 * Remove a feature from the landing page entirely.
 *
 * Demo mode drops it from the demo-session registry
 * (`deleteDemoLandingFeature`); live mode calls
 * `DELETE /admin/landing/features/:id`. See {@link useCreateLandingFeature}
 * for why this refetches on plain `onSuccess` rather than `onLiveSuccess`.
 */
export function useDeleteLandingFeature() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<void, unknown, { id: string }>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: [ADMIN_LANDING_KEY, "delete"],
    demoResult: ({ id }) => deleteDemoLandingFeature(id),
    live: ({ id }) => deleteLandingFeature(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_LANDING_KEY] });
    },
  });
}
