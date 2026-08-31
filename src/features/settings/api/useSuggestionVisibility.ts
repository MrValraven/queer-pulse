import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { logError } from "../../../shared/observability/logger";
import {
  DEFAULT_HIDE_FROM_SUGGESTIONS,
  getSuggestionVisibility,
  putSuggestionVisibility,
  type SuggestionVisibilityDTO,
} from "./suggestionVisibility.api";

export interface SuggestionVisibilityResult {
  /**
   * Whether this member may be recommended to others. THE CHECKBOX VALUE:
   * checked means "appear in suggested connections", matching the pane's
   * label, and the one inversion against the stored `hideFromSuggestions`
   * field lives here so no component has to hold it.
   */
  isAppearingInSuggestions: boolean;
  /** Flip it. Saves immediately. */
  setAppearingInSuggestions: (isAppearing: boolean) => void;
  /** True while the live setting is first loading. */
  isLoading: boolean;
}

const SUGGESTION_VISIBILITY_QUERY_KEY = ["suggestion-visibility"] as const;

/**
 * The member's "Appear in suggested connections" switch, dual-mode (PRD-16).
 *
 * - **Demo**: in-memory, appearing, so the toggle is interactive in the
 *   standalone prototype without touching the network.
 * - **Live**: hydrates from `GET /me/suggestion-visibility` (gated on a
 *   signed-in member) and writes each flip through `PUT` with an optimistic
 *   cache update, rolling back and toasting on failure.
 *
 * Saves on flip rather than joining the pane's dirty/save flow, following
 * `useLoginAlerts`. "Stop showing me to strangers" is the kind of thing a
 * member does the moment they decide it, and a switch that waits for a Save
 * button they might not find has not stopped anything.
 *
 * The switch is one-directional: it governs whether this member is offered to
 * OTHER people, and never whether they are offered other people. It also does
 * not affect the member directory or search, so a member who wants to
 * disappear more broadly needs their profile visibility setting instead.
 */
export function useSuggestionVisibility(): SuggestionVisibilityResult {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [demoHidden, setDemoHidden] = useState(DEFAULT_HIDE_FROM_SUGGESTIONS);

  const query = useQuery<SuggestionVisibilityDTO>({
    queryKey: SUGGESTION_VISIBILITY_QUERY_KEY,
    enabled: !demoMode && loggedIn,
    queryFn: () => getSuggestionVisibility(),
  });

  const setAppearingInSuggestions = useCallback(
    (isAppearing: boolean) => {
      const hideFromSuggestions = !isAppearing;
      if (demoMode) {
        setDemoHidden(hideFromSuggestions);
        return;
      }
      const previous = queryClient.getQueryData<SuggestionVisibilityDTO>(
        SUGGESTION_VISIBILITY_QUERY_KEY,
      );
      queryClient.setQueryData<SuggestionVisibilityDTO>(
        SUGGESTION_VISIBILITY_QUERY_KEY,
        { hideFromSuggestions },
      );
      void putSuggestionVisibility(hideFromSuggestions)
        .then((fresh) =>
          queryClient.setQueryData<SuggestionVisibilityDTO>(
            SUGGESTION_VISIBILITY_QUERY_KEY,
            fresh,
          ),
        )
        .catch((error) => {
          logError(error, { scope: "suggestion-visibility" });
          // Roll back to exactly what the server last said, rather than to the
          // inverse of what was sent: two fast flips would otherwise leave the
          // toggle showing a state nobody chose.
          queryClient.setQueryData<SuggestionVisibilityDTO>(
            SUGGESTION_VISIBILITY_QUERY_KEY,
            previous,
          );
          showToast(
            t("settings:visibility.suggestedConnections.toastError"),
            "error",
          );
        });
    },
    [demoMode, queryClient, showToast, t],
  );

  const hideFromSuggestions = demoMode
    ? demoHidden
    : (query.data?.hideFromSuggestions ?? DEFAULT_HIDE_FROM_SUGGESTIONS);

  return {
    isAppearingInSuggestions: !hideFromSuggestions,
    setAppearingInSuggestions,
    isLoading: !demoMode && query.isLoading,
  };
}
