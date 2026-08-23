import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  acceptCommunityRules,
  getCommunityPreferences,
  markCommunityWelcomeSeen,
  setCommunityNotificationLevel,
  type CommunityNotificationLevel,
  type CommunityPreferencesDTO,
} from "./communityPreferences.api";

/**
 * The viewer's own relationship with one community: how loudly they want to
 * hear from it, and whether they still owe a first read of its welcome.
 *
 * One query serves both, because the backend answers both from one call
 * (`shouldShowWelcome` is the decision already made server-side). Demo mode
 * never touches the network: it reports the platform default level and no
 * pending welcome, and the picker keeps its own local selection on top, so the
 * prototype pages behave exactly as they did.
 */

export interface CommunityPreferencesResult {
  notificationLevel: CommunityNotificationLevel;
  welcomeMessage: string | null;
  shouldShowWelcome: boolean;
  /** The community's current house-rules version, and whether this member
   *  owes a fresh read of it after an owner edited the rules. */
  rulesVersion: number;
  shouldReacceptRules: boolean;
  isLoading: boolean;
  isError: boolean;
}

/** The platform default a member starts on: the important thing stays loud,
 *  ordinary chatter does not. Mirrors the backend column default, so the
 *  control never shows a level the server would disagree with while the first
 *  read is still in flight. */
export const DEFAULT_NOTIFICATION_LEVEL: CommunityNotificationLevel =
  "announcements";

/** `["community-preferences", slug, demoMode]` — the one key both mutations
 *  below invalidate. Exported so a caller can seed or drop it. */
export const communityPreferencesKey = (
  slug: string | undefined,
  demoMode: boolean,
) => ["community-preferences", slug, demoMode] as const;

export function useCommunityPreferences(
  slug: string | undefined,
  options: { enabled?: boolean } = {},
): CommunityPreferencesResult {
  const { enabled = true } = options;
  const { demoMode } = useDemoMode();
  const query = useQuery<CommunityPreferencesDTO>({
    queryKey: communityPreferencesKey(slug, demoMode),
    enabled: enabled && !demoMode && Boolean(slug),
    queryFn: () => getCommunityPreferences(slug!),
  });

  if (demoMode) {
    return {
      notificationLevel: DEFAULT_NOTIFICATION_LEVEL,
      welcomeMessage: null,
      shouldShowWelcome: false,
      rulesVersion: 1,
      shouldReacceptRules: false,
      isLoading: false,
      isError: false,
    };
  }
  return {
    notificationLevel:
      query.data?.notificationLevel ?? DEFAULT_NOTIFICATION_LEVEL,
    welcomeMessage: query.data?.welcomeMessage ?? null,
    shouldShowWelcome: query.data?.shouldShowWelcome ?? false,
    rulesVersion: query.data?.rulesVersion ?? 1,
    // Defaults to false so a member is never prompted on a failed or in-flight
    // read. Being asked a visit later is better than being asked wrongly.
    shouldReacceptRules: query.data?.shouldReacceptRules ?? false,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/** PATCH /communities/:slug/preferences — the member's own level. */
export function useSetCommunityNotificationLevel(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, CommunityNotificationLevel>({
    // The picker toasts its own failure, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (notificationLevel) => {
      if (demoMode || !slug) return;
      await setCommunityNotificationLevel(slug, notificationLevel);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: communityPreferencesKey(slug, demoMode),
      });
    },
  });
}

/**
 * POST /communities/:slug/welcome-seen — stamps the member so the greeting
 * stops returning. Fired once the welcome has actually been rendered, so a
 * member who never reached the community still gets greeted next time.
 *
 * The cache is patched in place rather than invalidated: re-reading would
 * bring `shouldShowWelcome: false` back and yank the card out from under
 * someone mid-read. It is hidden by the card's own dismissal instead.
 */
export function useMarkCommunityWelcomeSeen(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    // Bookkeeping the member never asked for: a failure must not raise a toast.
    // The worst case is being greeted once more on the next visit.
    meta: { silentError: true },
    mutationFn: async () => {
      if (demoMode || !slug) return;
      await markCommunityWelcomeSeen(slug);
    },
    onSuccess: () => {
      queryClient.setQueryData<CommunityPreferencesDTO>(
        communityPreferencesKey(slug, demoMode),
        (previous) =>
          previous ? { ...previous, shouldShowWelcome: false } : previous,
      );
    },
  });
}

/**
 * POST /communities/:slug/rules-acceptance — records that this member has read
 * the community's house rules at the given version.
 *
 * A joining member accepts at the door, through the join call. This is the
 * path for someone already on the roster when an owner edits the rules: it is
 * a real platform record of what they agreed to, so the prompt stays answered
 * across their devices.
 */
export function useAcceptCommunityRules(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    // The notice toasts its own outcome, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (acceptedRulesVersion) => {
      if (demoMode || !slug) return;
      await acceptCommunityRules(slug, acceptedRulesVersion);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: communityPreferencesKey(slug, demoMode),
      });
    },
  });
}
