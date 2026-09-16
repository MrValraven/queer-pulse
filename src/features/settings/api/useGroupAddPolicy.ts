import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { logError } from "../../../shared/observability/logger";
import type { GroupAddPolicy } from "../../../shared/contracts/contracts";
import {
  DEFAULT_GROUP_ADD_POLICY,
  getGroupAddPolicy,
  putGroupAddPolicy,
  type GroupAddPolicyDTO,
} from "./groupAddPolicy.api";

export interface GroupAddPolicyResult {
  /** `connections` (default) or `invite_only`, see `groupAddPolicy.api.ts`. */
  policy: GroupAddPolicy;
  /** Set it. Saves immediately (mirrors `useSuggestionVisibility`: this is the
   *  kind of privacy choice a member makes the moment they decide it). */
  setPolicy: (next: GroupAddPolicy) => void;
  /** True while the live setting is first loading. */
  isLoading: boolean;
}

const GROUP_ADD_POLICY_QUERY_KEY = ["group-add-policy"] as const;

/**
 * The member's "who can add me to groups" preference, dual-mode (PRD-353).
 *
 * - **Demo**: in-memory, `connections`, so the picker is interactive in the
 *   standalone prototype without touching the network.
 * - **Live**: hydrates from `GET /me/group-add-policy` (gated on a signed-in
 *   member) and writes each change through `PUT` with an optimistic cache
 *   update, rolling back to what the server last confirmed and toasting on
 *   failure.
 *
 * Saves on change rather than joining a pane's dirty/save flow, following
 * `useSuggestionVisibility`.
 */
export function useGroupAddPolicy(): GroupAddPolicyResult {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [demoPolicy, setDemoPolicy] = useState<GroupAddPolicy>(
    DEFAULT_GROUP_ADD_POLICY,
  );

  const query = useQuery<GroupAddPolicyDTO>({
    queryKey: GROUP_ADD_POLICY_QUERY_KEY,
    enabled: !demoMode && loggedIn,
    queryFn: () => getGroupAddPolicy(),
  });

  const setPolicy = useCallback(
    (next: GroupAddPolicy) => {
      if (demoMode) {
        setDemoPolicy(next);
        return;
      }
      queryClient.setQueryData<GroupAddPolicyDTO>(GROUP_ADD_POLICY_QUERY_KEY, {
        policy: next,
      });
      void putGroupAddPolicy(next)
        .then((fresh) =>
          queryClient.setQueryData<GroupAddPolicyDTO>(
            GROUP_ADD_POLICY_QUERY_KEY,
            fresh,
          ),
        )
        .catch((error) => {
          logError(error, { scope: "group-add-policy" });
          // Refetch rather than roll back to a captured "previous" value: that
          // value can be undefined before the first load ever resolved, or
          // itself just a still-in-flight optimistic write from an earlier
          // fast change, either way not something the server ever confirmed.
          // Invalidating gets the picker back to whatever is actually stored.
          void queryClient.invalidateQueries({
            queryKey: GROUP_ADD_POLICY_QUERY_KEY,
          });
          showToast(
            t("settings:visibility.groupAddPolicy.toastError"),
            "error",
          );
        });
    },
    [demoMode, queryClient, showToast, t],
  );

  const policy = demoMode
    ? demoPolicy
    : (query.data?.policy ?? DEFAULT_GROUP_ADD_POLICY);

  return {
    policy,
    setPolicy,
    isLoading: !demoMode && query.isLoading,
  };
}
