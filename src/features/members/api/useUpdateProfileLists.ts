import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  replaceGroups,
  replaceShapings,
  replaceSkills,
  replaceSocials,
  replaceWork,
} from "./members.api";
import {
  groupsToDto,
  shapingsToDto,
  skillsToDto,
  socialsToDto,
  workToDto,
} from "./members.adapters";
import type { Member } from "../data/members";

/** The sub-lists on a member's own profile that persist via their own PUTs. */
export interface ProfileLists {
  work: Member["work"];
  skills: Member["skills"];
  groups: Member["groups"];
  shapings: Member["shapings"];
  socials: Member["socials"];
}

/**
 * Persist the logged-in member's profile sub-lists (work, skills, groups,
 * shapings) via their dedicated `PUT /profiles/me/*` endpoints. Fired alongside
 * the core `PATCH /profiles/me` save.
 *
 * - **Demo mode:** a no-op — the ProfileProvider keeps the lists in local state.
 * - **Live mode:** each list is a full-replace PUT; they run in parallel and any
 *   failure rejects the mutation so the save flow can surface it.
 */
export function useUpdateProfileLists() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, ProfileLists>({
    mutationFn: async (lists) => {
      if (demoMode) return;
      await Promise.all([
        replaceWork(workToDto(lists.work)),
        replaceSkills(skillsToDto(lists.skills)),
        replaceGroups(groupsToDto(lists.groups)),
        replaceShapings(shapingsToDto(lists.shapings)),
        replaceSocials(socialsToDto(lists.socials)),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
