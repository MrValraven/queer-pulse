import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  replaceAffiliations,
  type AffiliationDTO,
  type AffiliationInputDTO,
  type AffiliationOptionDTO,
  type SubprofileDTO,
} from "./subprofiles.api";

/** Resolve an owner-edited affiliation input to its display `name`/`imageUrl`
 *  in demo mode. A newly picked target resolves from the picker's options (the
 *  cached `useAffiliationOptions` lists), then from the persona's
 *  already-resolved affiliations (edits, reorders, removals), and only as a
 *  last resort from its raw slug. */
function demoResolveAffiliation(
  item: AffiliationInputDTO,
  pickerOptions: readonly AffiliationOptionDTO[],
  known: readonly AffiliationDTO[],
): AffiliationDTO {
  const isSameTarget = (candidate: {
    targetType: string;
    targetSlug: string;
  }) =>
    candidate.targetType === item.targetType &&
    candidate.targetSlug === item.targetSlug;
  const resolved = pickerOptions.find(isSameTarget) ?? known.find(isSameTarget);
  return {
    targetType: item.targetType,
    targetSlug: item.targetSlug,
    role: item.role,
    name: resolved?.name ?? item.targetSlug,
    imageUrl: resolved?.imageUrl ?? null,
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

  // Narrow, id-scoped invalidation — mirrors `useSubprofileMutations`: the
  // owner list (`["subprofiles"]` plural), THIS persona's owner-editor query
  // (`["subprofile", demoMode, subprofileId]`), and the public reads
  // (`["subprofile","public"]`) — never the bare `["subprofile"]` prefix that
  // would refetch every persona query app-wide.
  const invalidateOwned = () => {
    void queryClient.invalidateQueries({ queryKey: ["subprofiles"] });
    void queryClient.invalidateQueries({
      queryKey: ["subprofile", demoMode, subprofileId],
    });
    void queryClient.invalidateQueries({ queryKey: ["subprofile", "public"] });
  };

  const replace = useMutation<SubprofileDTO, Error, AffiliationInputDTO[]>({
    // SubprofileAffiliationsEditor toasts its own error, so silence the global
    // duplicate.
    meta: { silentError: true },
    mutationFn: async (items) => {
      if (!demoMode) return replaceAffiliations(subprofileId, items);
      const { mockSubprofileById } = await import("../data/subprofiles.data");
      const current = mockSubprofileById(subprofileId);
      if (!current) throw new Error("Subprofile not found");
      // Prefix match: the options key's 4th element (demo community key) varies.
      const pickerOptions = queryClient
        .getQueriesData<AffiliationOptionDTO[]>({
          queryKey: ["subprofileAffiliationOptions", true, subprofileId],
        })
        .flatMap(([, cachedOptions]) => cachedOptions ?? []);
      return {
        ...current,
        affiliations: items.map((item) =>
          demoResolveAffiliation(
            item,
            pickerOptions,
            current.affiliations ?? [],
          ),
        ),
      };
    },
    onSuccess: invalidateOwned,
  });

  return { replace };
}
