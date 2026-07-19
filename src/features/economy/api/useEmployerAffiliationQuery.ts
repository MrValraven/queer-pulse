import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { getAffiliation } from "./affiliation.api";

/**
 * Which company the current member is authorised to post jobs for.
 *
 * The view-model, not the DTO — `EmployerAffiliationDTO` also carries
 * `company.nameText`, which no consumer reads (PostJobPage resolves the company
 * separately through `useCompany`). Lives here rather than in the provider
 * because both the provider (overlay) and this query now produce values of this
 * shape, and the provider imports it from here.
 */
export interface EmployerAffiliation {
  companySlug: string;
  /** The member's role at the company, e.g. "Founder", "Hiring lead". */
  role: string;
  /** Live-only lifecycle: `pending` while affiliation is confirmed, then `active`.
   *  Optional — consumers only check the affiliation is non-null. */
  status?: "pending" | "active";
}

/**
 * The one place this cache key is spelled. `EmployerAffiliationProvider` writes
 * to it after a successful POST/DELETE, so a literal in two files would be a
 * silent drift waiting to happen.
 *
 * No `language` term: unlike `useJobs`/`useCompany`, this `queryFn` does not
 * resolve anything through `t`/`fmt` — it maps three scalar fields off the DTO,
 * so a language switch cannot stale it.
 */
export const affiliationQueryKey = (demoMode: boolean) =>
  ["employerAffiliation", demoMode] as const;

/**
 * The member's employer affiliation, from the server.
 *
 * This replaces the raw `useEffect` + promise that used to live in
 * `EmployerAffiliationProvider`. The point of the conversion is not tidiness:
 * without a query key there is no cache entry, so the value could not be
 * shared, deduped, invalidated, or — the reason for this phase — deferred until
 * a consumer actually subscribes. React-query fetches on first subscribe, so
 * mounting this hook only from `/post-job`'s read path is what takes
 * `/me/affiliation` off every other route.
 *
 * `enabled: !demoMode && loggedIn` reproduces the old effect's first line
 * (`if (demoMode || !loggedIn) return;`) exactly, and re-runs once login lands
 * because `loggedIn` is reactive. In demo mode the affiliation is owned entirely
 * by the provider's localStorage store, so this query is not merely disabled but
 * meaningless — the `queryFn`'s demo short-circuit is belt-and-braces against a
 * future caller passing `enabled` some other way.
 *
 * `meta.silentError` preserves the old behaviour precisely: the effect caught
 * and logged failures and the member saw nothing. Without it the app-wide
 * `QueryCache.onError` (src/shared/api/errorHandling.ts:56) would toast on any
 * 5xx for a request the member never asked for.
 */
export function useEmployerAffiliationQuery() {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();

  return useQuery<EmployerAffiliation | null>({
    queryKey: affiliationQueryKey(demoMode),
    enabled: !demoMode && loggedIn,
    meta: { silentError: true },
    queryFn: async () => {
      if (demoMode) return null;
      const dto = await getAffiliation();
      return dto
        ? {
            companySlug: dto.companySlug,
            role: dto.role,
            status: dto.status,
          }
        : null;
    },
  });
}
