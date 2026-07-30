import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../../app/providers/useCommunityMembership";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDate } from "../../../shared/lib/date";
import type { Membership } from "../membership.types";
import { getMyCommunities } from "./communities.api";

/** Stable empty map so live-mode consumers don't see a new object every render. */
const EMPTY: Record<string, Membership> = {};

/**
 * `Membership.joinedAt` is a DISPLAY label, not a timestamp — the demo store
 * seeds it as `"March 2025"` / `"just now"` and the communities-home sidebar
 * renders it verbatim. The API sends a full ISO string, so it has to be
 * formatted here or a live member sees `2025-03-14T09:22:31.000Z` in their
 * sidebar. Month + year matches the demo shape (a join date needs no day).
 */
function joinedLabel(iso: string, locale: string): string {
  const parsedDate = new Date(iso);
  if (Number.isNaN(parsedDate.getTime())) return iso;
  return formatDate(parsedDate, locale, { month: "short", year: "numeric" });
}

/**
 * The viewer's complete membership map, keyed by community slug.
 *
 * Surfaces that aggregate across *all* your communities (the communities home,
 * the feed's cross-community pulse) need the whole map, not a page of it. In
 * live mode that comes from `GET /me/communities`, which returns a bare array
 * for exactly this reason — reconstructing it by filtering paginated
 * `GET /communities?filter=mine` pages is incomplete by construction, since only
 * the pages already fetched would ever be counted.
 *
 * Demo mode reads the session membership store (`CommunityMembershipProvider`),
 * which seeds the mock flagships and records demo joins — unchanged behaviour,
 * and no network.
 */
export function useMyCommunities(
  options: { enabled?: boolean } = {},
): Record<string, Membership> {
  const { enabled = true } = options;
  const { demoMode } = useDemoMode();
  const { memberships } = useCommunityMembership();
  const { language } = useTranslation();

  const query = useQuery<Record<string, Membership>>({
    // `language` is in the key because the joined labels below are locale-
    // formatted — switching language must re-derive them.
    queryKey: ["my-communities", language],
    // Live-only fetch; callers may additionally gate it via `options.enabled`
    // (e.g. a profile viewing another member doesn't consume this map).
    enabled: !demoMode && enabled,
    queryFn: async () => {
      const rows = await getMyCommunities();
      return Object.fromEntries(
        rows.map((r) => [
          r.slug,
          { role: r.role, joinedAt: joinedLabel(r.joinedAt, language) },
        ]),
      );
    },
  });

  if (demoMode) return memberships;
  return query.data ?? EMPTY;
}
