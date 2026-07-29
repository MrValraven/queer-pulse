import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  replaceAffiliations,
  type AffiliationDTO,
  type AffiliationInputDTO,
  type SubprofileDTO,
} from "./subprofiles.api";

/** Re-resolve an owner-edited affiliation input against the persona's
 *  currently-known (already-resolved) affiliations, so edits/reorders/removals
 *  keep their real `name`/`imageUrl` in demo mode. A genuinely new entry (not
 *  present before) falls back to its raw slug as a placeholder name — real
 *  resolution against the mock event/community registries is wired by the
 *  entity picker (Task C2) and the mock backfill (Task B2), not this hook. */
function demoResolveAffiliation(
  item: AffiliationInputDTO,
  known: AffiliationDTO[],
): AffiliationDTO {
  const existing = known.find(
    (affiliation) =>
      affiliation.targetType === item.targetType &&
      affiliation.targetSlug === item.targetSlug,
  );
  return {
    targetType: item.targetType,
    targetSlug: item.targetSlug,
    role: item.role,
    name: existing?.name ?? item.targetSlug,
    imageUrl: existing?.imageUrl ?? null,
  };
}

/**
 * Owner mutation for one persona's event/community affiliations ("Part of").
 * Mirrors `useSubprofileMutations`'s replace-section/replace-socials branch:
 * demo resolves optimistically from the mock registry with no network, live
 * calls the API. Success invalidates the same query keys as every other
 * subprofile mutation so the owner editor and public page both refetch.
 */
export function useAffiliations(subprofileId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["subprofiles"] });
    void queryClient.invalidateQueries({ queryKey: ["subprofile"] });
  };

  const replace = useMutation<SubprofileDTO, Error, AffiliationInputDTO[]>({
    mutationFn: async (items) => {
      if (!demoMode) return replaceAffiliations(subprofileId, items);
      const { mockSubprofileById } = await import("../data/subprofiles.data");
      const current = mockSubprofileById(subprofileId);
      if (!current) throw new Error("Subprofile not found");
      return {
        ...current,
        affiliations: items.map((item) =>
          demoResolveAffiliation(item, current.affiliations ?? []),
        ),
      };
    },
    onSuccess: invalidateAll,
  });

  return { replace };
}
