import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  replaceAffiliations,
  type AffiliationInputDTO,
  type AffiliationOptionDTO,
  type SubprofileDTO,
} from "./subprofiles.api";
import { subprofileToView } from "./subprofiles.adapters";
import { resolveAffiliation } from "../editorPreviewRows";

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
  const invalidateOwned = (targetId: string) => {
    void queryClient.invalidateQueries({ queryKey: ["subprofiles"] });
    void queryClient.invalidateQueries({
      queryKey: ["subprofile", demoMode, targetId],
    });
    void queryClient.invalidateQueries({ queryKey: ["subprofile", "public"] });
  };

  const replace = useMutation<
    SubprofileDTO,
    Error,
    {
      items: AffiliationInputDTO[];
      expectedEditVersion?: number;
      /** The persona to write to, when it differs from the hook's: the
       *  editor's save sends the fresh id an unlink earlier in the same save
       *  gave the persona (ENG-447). */
      subprofileId?: string;
    }
  >({
    // SubprofileAffiliationsEditor toasts its own error, so silence the global
    // duplicate.
    meta: { silentError: true },
    mutationFn: async ({
      items,
      expectedEditVersion,
      subprofileId: requestedId,
    }) => {
      const targetId = requestedId ?? subprofileId;
      if (!demoMode) {
        return replaceAffiliations(targetId, items, expectedEditVersion);
      }
      const { mockBumpEditVersion, mockSubprofileById } =
        await import("../data/subprofiles.data");
      const current = mockSubprofileById(targetId);
      if (!current) throw new Error("Subprofile not found");
      // Prefix match: the options key's 4th element (demo community key) varies.
      const pickerOptions = queryClient
        .getQueriesData<AffiliationOptionDTO[]>({
          queryKey: ["subprofileAffiliationOptions", true, targetId],
        })
        .flatMap(([, cachedOptions]) => cachedOptions ?? []);
      return {
        ...current,
        affiliations: items.map((item) =>
          resolveAffiliation(item, pickerOptions, current.affiliations ?? []),
        ),
        editVersion: mockBumpEditVersion(targetId),
      };
    },
    // The response is the whole owner view, so seed the owner-editor query
    // with it before invalidating, the way `useSubprofileMutations`' section
    // and socials writes do. A copy flow's editor can mount from this cache
    // before the refetch below lands; without this write it would seed its
    // `editVersion` from a stale pre-write read and conflict on its own first
    // save (I2).
    onSuccess: (data, variables) => {
      const targetId = variables.subprofileId ?? subprofileId;
      queryClient.setQueryData(
        ["subprofile", demoMode, targetId],
        subprofileToView(data),
      );
      invalidateOwned(targetId);
    },
  });

  return { replace };
}
