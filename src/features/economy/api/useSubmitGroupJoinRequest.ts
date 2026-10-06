import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  groupJoinDuplicateStandingFrom,
  submitGroupJoinRequest,
} from "./housingGroups.api";
import { VETTED_GROUPS } from "../housingGroups.data";
import type { MyHousingJoinRequest } from "../housingJoinRequests.data";
import { economyKeys } from "./economyKeys";

export interface GroupJoinRequestInput {
  slug: string;
  name: string;
  relationship: string;
  answers?: { questionId: string; answer: string }[];
  note?: string;
}

/**
 * POST /housing-groups/:slug/join-requests — a prospective member asking to
 * join an access-gated group, with their screening answers. Demo mode keeps a
 * short "sending…" beat and resolves with no network (mirrors
 * `useSubmitCoopJoinRequest`). Live mode calls the API.
 *
 * PRD-242: a success invalidates the caller's own applications, so the new
 * pending row appears on the group page from the server rather than from a
 * guess, and the page the outcome will later deep-link to already names it.
 *
 * A 409 (ENG-472) means the caller already asked or is already in, so the
 * page they are on is out of date: the group's detail read (its listings gate
 * carries the caller's standing) and their own applications are refetched.
 * The returned promise holds the modal's own `onError` until both settle, so
 * the modal closes onto a page that already shows the real standing.
 *
 * Demo mode has no server to refetch from: invalidating would only re-read the
 * static fixture and drop the request just sent, bringing "Ask to join" back.
 * So a demo success writes the pending row into the cache itself and skips the
 * invalidation, the same split `useSubmitGroupListing` makes for a demo room.
 */
export function useSubmitGroupJoinRequest() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<{ id: string } | null, Error, GroupJoinRequestInput>({
    // JoinGroupModal toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ slug, name, relationship, answers, note }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 650));
        return null;
      }
      return submitGroupJoinRequest(slug, {
        name,
        relationship,
        answers,
        note,
      });
    },
    onSuccess: (_created, { slug }) => {
      if (demoMode) {
        const pendingRow: MyHousingJoinRequest = {
          id: `demo-group-join-${Date.now()}`,
          name: VETTED_GROUPS.find((group) => group.id === slug)?.name ?? "",
          slug,
          status: "pending",
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData<MyHousingJoinRequest[]>(
          economyKeys.myGroupJoinRequests(true),
          (previous) => [pendingRow, ...(previous ?? [])],
        );
        return;
      }
      void queryClient.invalidateQueries({
        queryKey: economyKeys.myGroupJoinRequestsRoot,
      });
    },
    onError: async (error, { slug }) => {
      if (!groupJoinDuplicateStandingFrom(error)) return;
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: economyKeys.housingGroup(slug, demoMode),
        }),
        queryClient.invalidateQueries({
          queryKey: economyKeys.myGroupJoinRequestsRoot,
        }),
      ]);
    },
  });
}
