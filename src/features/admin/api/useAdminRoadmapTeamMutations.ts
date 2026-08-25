import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  readDemoRoadmap,
  writeDemoRoadmap,
  type AdminRoadmapHeroStat,
} from "../adminRoadmap.data";
import {
  demoCreateTeamMember,
  demoDeleteTeamMember,
  demoUpdateSettings,
  demoUpdateTeamMember,
} from "../adminRoadmapDemo";
import {
  createTeamMember,
  deleteTeamMember,
  updateRoadmapSettings,
  updateTeamMember,
  type RoadmapTeamMemberUpdateBody,
  type RoadmapTeamMemberWriteBody,
} from "./roadmapAdmin.api";
import { useInvalidateAdminRoadmap } from "./useInvalidateAdminRoadmap";

// Team-roster (Capacity view) + hero-stat settings admin roadmap actions —
// split out of `useAdminRoadmapMutations` purely for file/function size,
// same dual-mode + `meta: { silentError: true }` convention as
// `useAdminRoadmapItemMutations` (see that file's header doc).

/** `POST /admin/team` body plus a `name` the demo store persists directly on
 *  the roster row. Live resolves a roster row's display name server-side
 *  from `users` via `userId` (see `RoadmapAdminService.createTeamMember`);
 *  the demo store has no such lookup, so whichever member-picker UI wires
 *  this must supply the chosen member's display name alongside their demo
 *  `userId`. Stripped before the live request. */
export interface CreateRoadmapTeamVars extends RoadmapTeamMemberWriteBody {
  name: string;
}

export interface UpdateRoadmapTeamVars {
  id: string;
  body: RoadmapTeamMemberUpdateBody;
  /** Same demo-only display-name override as `CreateRoadmapTeamVars.name` —
   *  only meaningful when `body.userId` reassigns the row to someone else;
   *  omit to keep the roster row's existing name. Stripped before the live
   *  request. */
  name?: string;
}

export function useAdminRoadmapTeamMutations() {
  const { demoMode } = useDemoMode();
  const invalidate = useInvalidateAdminRoadmap();

  const createTeamMutation = useMutation({
    mutationFn: async ({ name, ...body }: CreateRoadmapTeamVars) => {
      if (demoMode) {
        const { state, result } = demoCreateTeamMember(
          readDemoRoadmap(),
          body,
          name,
        );
        writeDemoRoadmap(state);
        return result;
      }
      return createTeamMember(body);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const updateTeamMutation = useMutation({
    mutationFn: async ({ id, body, name }: UpdateRoadmapTeamVars) => {
      if (demoMode) {
        const { state, result } = demoUpdateTeamMember(
          readDemoRoadmap(),
          id,
          body,
          name,
        );
        writeDemoRoadmap(state);
        return result;
      }
      return updateTeamMember(id, body);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (id: string) => {
      if (demoMode) {
        const { state } = demoDeleteTeamMember(readDemoRoadmap(), id);
        writeDemoRoadmap(state);
        return;
      }
      return deleteTeamMember(id);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (heroStats: AdminRoadmapHeroStat[]) => {
      if (demoMode) {
        const { state, result } = demoUpdateSettings(
          readDemoRoadmap(),
          heroStats,
        );
        writeDemoRoadmap(state);
        return result;
      }
      return updateRoadmapSettings(heroStats);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  return {
    createTeam: createTeamMutation.mutate,
    updateTeam: updateTeamMutation.mutate,
    deleteTeam: deleteTeamMutation.mutate,
    updateSettings: updateSettingsMutation.mutate,
    pending:
      createTeamMutation.isPending ||
      updateTeamMutation.isPending ||
      deleteTeamMutation.isPending ||
      updateSettingsMutation.isPending,
  };
}
