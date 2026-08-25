import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  replaceBoard,
  replaceGroups,
  replaceShapings,
  replaceSkills,
  replaceSocials,
  replaceWork,
} from "./members.api";
import {
  boardToDto,
  groupsToDto,
  shapingsToDto,
  skillsToDto,
  socialsToDto,
  workToDto,
} from "./members.adapters";
import type { Member } from "../data/members";

/**
 * The sub-lists on a member's own profile that persist via their own PUTs. Every
 * field is optional: the caller passes only the lists the member actually
 * changed this session, and each present list is full-replaced. An omitted list
 * is left untouched server-side (no PUT is issued for it).
 */
export interface ProfileLists {
  work?: Member["work"];
  skills?: Member["skills"];
  board?: Member["board"];
  groups?: Member["groups"];
  shapings?: Member["shapings"];
  socials?: Member["socials"];
}

/**
 * Persist the logged-in member's changed profile sub-lists (work, skills, board,
 * groups, shapings, socials) via their dedicated `PUT /profiles/me/*` endpoints.
 * Fired alongside the core `PATCH /profiles/me` save.
 *
 * - **Demo mode:** a no-op — the ProfileProvider keeps the lists in local state.
 * - **Live mode:** each PROVIDED list is a full-replace PUT; they run in parallel
 *   and any failure rejects the mutation so the save flow can surface it. Lists
 *   the member didn't change are omitted by the caller and never re-sent.
 */
export function useUpdateProfileLists() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, ProfileLists>({
    mutationFn: async (lists) => {
      if (demoMode) return;
      const pendingReplacements: Promise<unknown>[] = [];
      if (lists.work)
        pendingReplacements.push(replaceWork(workToDto(lists.work)));
      if (lists.skills)
        pendingReplacements.push(replaceSkills(skillsToDto(lists.skills)));
      if (lists.board)
        pendingReplacements.push(replaceBoard(boardToDto(lists.board)));
      if (lists.groups)
        pendingReplacements.push(replaceGroups(groupsToDto(lists.groups)));
      if (lists.shapings)
        pendingReplacements.push(
          replaceShapings(shapingsToDto(lists.shapings)),
        );
      if (lists.socials)
        pendingReplacements.push(replaceSocials(socialsToDto(lists.socials)));
      await Promise.all(pendingReplacements);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      void queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
