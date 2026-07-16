import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getSubprofileDirectory,
  type SubprofileCardDTO,
  type SubprofileKind,
} from "./subprofiles.api";
import { mockDirectory } from "../data/subprofiles.data";

export interface SubprofileDirectoryFilters {
  kind?: SubprofileKind;
  query?: string;
}

/** Browse standalone (unlinked + published + open) personas, filterable by kind
 *  and free-text query. Demo filters the mock registry; live calls the directory
 *  endpoint. Cards are already presentation-ready, so no adapter is needed. */
export function useSubprofileDirectory(
  filters: SubprofileDirectoryFilters = {},
) {
  const { demoMode } = useDemoMode();
  const { kind, query } = filters;
  return useQuery<SubprofileCardDTO[]>({
    queryKey: ["subprofiles", "directory", demoMode, kind, query],
    queryFn: async () => {
      if (demoMode) return mockDirectory({ kind, query });
      const res = await getSubprofileDirectory({ kind, query });
      return res.items;
    },
  });
}
