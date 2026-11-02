import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { partnerCardToPlace } from "./directoryPartners.adapters";
import {
  getDirectoryPartners,
  type DirectoryPartnerPlace,
} from "./directoryPartners.api";
import { DIRECTORY_KEY } from "./directoryQueryKey";

/** Prefix of every partners query, so an admin mutation can invalidate the
 *  public row in both modes at once. */
export const DIRECTORY_PARTNERS_QUERY_ROOT = [
  DIRECTORY_KEY,
  "partners",
] as const;

export const directoryPartnersKey = (isDemoMode: boolean) =>
  [DIRECTORY_KEY, "partners", isDemoMode] as const;

export interface DirectoryPartnersResult {
  partners: DirectoryPartnerPlace[];
  isLoading: boolean;
  isError: boolean;
}

/** Returned while loading or after a failure: one shared array, so a caller's
 *  memo over `partners` stays stable from render to render. */
const NO_PARTNERS: DirectoryPartnerPlace[] = [];

/**
 * The public "Businesses we partner with" row. Live, it reads
 * `GET /directory/partners`; demo, it reads the shared demo store the admin
 * Partners tab writes to. A failed read stays quiet (`silentError`): the row
 * keeps closed and the directory below carries on.
 */
export function useDirectoryPartners(): DirectoryPartnersResult {
  const { demoMode } = useDemoMode();
  const query = useQuery<DirectoryPartnerPlace[]>({
    queryKey: directoryPartnersKey(demoMode),
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const demoStore = await import("../directoryPartnersDemoStore");
        return demoStore.demoPublicDirectoryPartners();
      }
      const cards = await getDirectoryPartners(signal);
      return cards.map(partnerCardToPlace);
    },
  });
  return {
    partners: query.data ?? NO_PARTNERS,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
