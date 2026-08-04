import {
  useAdminRoadmapIdeaMutations,
  type DeclineIdeaVars,
  type MergeIdeaVars,
  type UpdateRoadmapIdeaVars,
} from "./useAdminRoadmapIdeaMutations";
import {
  useAdminRoadmapItemMutations,
  type ArchiveRoadmapItemVars,
  type NotifyVotersVars,
  type UpdateItemDepsVars,
  type UpdateRoadmapItemVars,
} from "./useAdminRoadmapItemMutations";
import {
  useAdminRoadmapTeamMutations,
  type CreateRoadmapTeamVars,
  type UpdateRoadmapTeamVars,
} from "./useAdminRoadmapTeamMutations";

// Every admin roadmap write action in the Appendix, dual-mode, composed from
// three colocated action-group hooks (items, ideas, team+settings — each
// split out purely so no single hook function crosses ~200 lines; see their
// own file headers for the shared demo/live/audit/invalidate contract).
// `useAdminRoadmapMutations()` remains the one hook every admin roadmap
// component imports, so callers don't need to know about the group split.

export type {
  ArchiveRoadmapItemVars,
  CreateRoadmapTeamVars,
  DeclineIdeaVars,
  MergeIdeaVars,
  NotifyVotersVars,
  UpdateItemDepsVars,
  UpdateRoadmapIdeaVars,
  UpdateRoadmapItemVars,
  UpdateRoadmapTeamVars,
};

/**
 * All admin roadmap write actions, dual-mode. Returns bound `mutate`
 * functions (each still accepts a per-call `{ onSuccess, onError }` like any
 * react-query mutate function) so callers can toast locally, matching the
 * rest of the admin panels (see `AdminOrgTiersPage`).
 */
export function useAdminRoadmapMutations() {
  const items = useAdminRoadmapItemMutations();
  const ideas = useAdminRoadmapIdeaMutations();
  const team = useAdminRoadmapTeamMutations();

  return {
    createItem: items.createItem,
    updateItem: items.updateItem,
    deleteItem: items.deleteItem,
    updateDeps: items.updateDeps,
    duplicateItem: items.duplicateItem,
    archiveItem: items.archiveItem,
    notifyVoters: items.notifyVoters,
    bulkItems: items.bulkItems,
    createIdea: ideas.createIdea,
    updateIdea: ideas.updateIdea,
    deleteIdea: ideas.deleteIdea,
    promoteIdea: ideas.promoteIdea,
    mergeIdea: ideas.mergeIdea,
    declineIdea: ideas.declineIdea,
    reopenIdea: ideas.reopenIdea,
    createTeam: team.createTeam,
    updateTeam: team.updateTeam,
    deleteTeam: team.deleteTeam,
    updateSettings: team.updateSettings,
    pending: items.pending || ideas.pending || team.pending,
  };
}
