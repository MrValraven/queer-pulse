import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { COMMUNITIES, type Community } from "../adminCommunities.data";
import {
  updateAdminCommunitySettings,
  type UpdateAdminCommunitySettingsDto,
} from "./adminCommunities.api";
import { adminCommunityDetailQueryKey } from "./useAdminCommunities";
import { useDemoAwareMutation } from "./demoAwareMutation";
import { setDemoFeaturedSlug } from "../../communities/featuredCommunity.demo";

export interface UpdateAdminCommunityVars {
  slug: string;
  /** Only the toggled fields — a partial PATCH so one toggle never overwrites
   *  the other. */
  patch: UpdateAdminCommunitySettingsDto;
}

interface UpdateAdminCommunityContext {
  /** The pre-mutation cached community, kept so an error can roll the
   *  optimistic patch back. */
  previous?: Community;
}

/**
 * Persist a community's safety-policy toggles (second-vouch, auto-freeze) from
 * the admin detail Settings tab. The toggle updates optimistically in both
 * modes so it never lags the tap.
 *
 * Demo mode never touches the network — this is an admin-only endpoint that
 * 403s for anyone else, and the fixture must not appear to mutate platform
 * truth unless the operator turned "Populate platform" on — so it also patches
 * the fixture object in place, keeping the toggle's new state through a
 * refetch (window focus / remount) for the rest of the session.
 *
 * Live mode PATCHes `/admin/communities/:slug` and invalidates the detail
 * query so it re-adapts from the authoritative server response.
 */
export function useUpdateAdminCommunity() {
  const { demoMode } = useDemoMode();
  const { language } = useTranslation();
  const queryClient = useQueryClient();

  return useDemoAwareMutation<
    void,
    Error,
    UpdateAdminCommunityVars,
    UpdateAdminCommunityContext
  >({
    demoMode,
    logLabel: "admin.community.updateSettings",
    logContext: ({ slug, patch }) => ({ slug, ...patch }),
    demoResult: () => undefined,
    live: async ({ slug, patch }) => {
      await updateAdminCommunitySettings(slug, patch);
    },
    onMutate: async ({ slug, patch }) => {
      const key = adminCommunityDetailQueryKey(slug, demoMode, language);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Community>(key);
      if (previous) {
        queryClient.setQueryData<Community>(key, { ...previous, ...patch });
      }
      // No backend to persist to in demo — keep the fixture itself in sync so a
      // later refetch doesn't revert the toggle for the session.
      if (demoMode) {
        const fixture = COMMUNITIES.find(
          (community) => community.slug === slug,
        );
        if (fixture) Object.assign(fixture, patch);
        // Keep the Discover page's demo hero card in sync with the admin
        // toggle. No need to loop-clear other COMMUNITIES fixture rows'
        // `isFeatured` here — nothing in the admin grid shows a "which one is
        // featured, globally" list, so there's no visible cross-row clobber;
        // live mode's backend already enforces the real singleton.
        if (patch.isFeatured !== undefined) {
          setDemoFeaturedSlug(patch.isFeatured ? slug : null);
        }
      }
      return { previous };
    },
    onError: (_error, { slug }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          adminCommunityDetailQueryKey(slug, demoMode, language),
          context.previous,
        );
      }
    },
    onLiveSuccess: (_data, { slug }) => {
      void queryClient.invalidateQueries({
        queryKey: adminCommunityDetailQueryKey(slug, demoMode, language),
      });
    },
  });
}
