import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Language, TFunction } from "../../../shared/i18n/types";
import { COMMUNITIES, type Community } from "../adminCommunities.data";
import {
  cardDtoToCommunity,
  detailDtoToCommunity,
} from "./adminCommunities.adapters";
import { getAdminCommunities, getAdminCommunity } from "./adminCommunities.api";
import { loadModerationTranslate } from "./moderationTranslate";

export const ADMIN_COMMUNITIES_KEY = "admin-communities";

/** The exact query key `useAdminCommunity` caches one community's detail under.
 *  Shared so a mutation can optimistically `setQueryData`/invalidate the same
 *  entry without the key drifting out of sync. `demoMode` and `language` are
 *  part of the key because the demo fixture and the locale-mapped adaptation
 *  are both cache-distinct. */
export function adminCommunityDetailQueryKey(
  slug: string,
  demoMode: boolean,
  language: Language,
) {
  return [ADMIN_COMMUNITIES_KEY, "detail", slug, demoMode, language] as const;
}

/**
 * A `translate` bound to the *resolved* catalogs for `language` (with EN as the
 * universal fallback), rather than the provider's `t`.
 *
 * The adapters classify chrome (activity labels, moderator role lines, a queue
 * item's category/status/reason) through `translate()`, and this mapping
 * happens inside the react-query `queryFn` the moment a fetch resolves. The
 * provider's `t`, however, resolves lazy namespaces out of React state that
 * only fills in AFTER a post-commit effect loads the chunk — so a `queryFn`
 * mapping DTOs can win that race and bake raw `admin:…` keys into the cached,
 * adapted result, which then never re-maps because the query key hasn't
 * changed. Awaiting the catalogs makes the adaptation deterministic regardless
 * of provider timing. `language` still sits in the query key, so a language
 * switch refetches and rebuilds this translator for the new locale.
 *
 * FE-ADM-26: this used to bind `admin` alone. The scoped queue's report reason
 * now comes from the shared `safety` taxonomy (`REASON_LABEL_KEYS`), so it
 * delegates to the two-namespace loader the moderation queue also uses.
 */
function loadAdminTranslate(language: Language): Promise<TFunction> {
  return loadModerationTranslate(language);
}

/** `useAdminCommunities`'s query data — the adapted cards plus whether the
 *  backend's scan behind them hit its cap (mirrors `useTrustNetwork`'s
 *  `TrustGraphData.truncated`, folded into the returned data rather than a
 *  second query). */
export interface AdminCommunitiesResult {
  communities: Community[];
  truncated: boolean;
}

/**
 * Every community on the platform, for the admin grid. Demo mode returns the
 * colocated fixture and never hits the network — this is an admin-only
 * endpoint that 403s for anyone else, and more importantly the fixture is
 * fabricated data that must not appear as platform truth unless the operator
 * explicitly turned "Populate platform" on.
 *
 * `language` sits in the query key (not just `fmt`/`t` in the closure)
 * because `cardDtoToCommunity` resolves catalog keys and locale-formats
 * numbers/dates through them — a language switch must re-map the already
 * fetched DTOs, not just re-render stale English strings.
 */
export function useAdminCommunities() {
  const { demoMode } = useDemoMode();
  const { language } = useTranslation();
  const fmt = useFormat();
  return useQuery<AdminCommunitiesResult>({
    queryKey: [ADMIN_COMMUNITIES_KEY, demoMode, language],
    initialData: demoMode
      ? { communities: COMMUNITIES, truncated: false }
      : undefined,
    queryFn: async () => {
      if (demoMode) return { communities: COMMUNITIES, truncated: false };
      // Map with a catalog-bound translator (namespace guaranteed loaded), not
      // the provider's lazy `t`, so the adapted result can't bake a raw
      // `admin:…` key when the fetch wins the namespace-load race.
      const [listDto, translate] = await Promise.all([
        getAdminCommunities(),
        loadAdminTranslate(language),
      ]);
      return {
        communities: listDto.items.map((cardDto) =>
          cardDtoToCommunity(cardDto, translate, fmt),
        ),
        truncated: listDto.truncated,
      };
    },
  });
}

/**
 * One community, with its moderators and scoped queue. `slug` is nullable
 * because the grid view renders with no community selected; `enabled` keeps
 * the query from firing until a card is opened.
 */
export function useAdminCommunity(slug: string | null) {
  const { demoMode } = useDemoMode();
  const { language } = useTranslation();
  const fmt = useFormat();
  return useQuery<Community | undefined>({
    queryKey: [ADMIN_COMMUNITIES_KEY, "detail", slug, demoMode, language],
    enabled: slug !== null,
    initialData: demoMode
      ? COMMUNITIES.find((community) => community.slug === slug)
      : undefined,
    queryFn: async () => {
      if (demoMode) {
        return COMMUNITIES.find((community) => community.slug === slug);
      }
      if (slug === null) return undefined;
      // Catalog-bound translator (see useAdminCommunities) — deterministic
      // regardless of lazy-namespace timing.
      const [detailDto, translate] = await Promise.all([
        getAdminCommunity(slug),
        loadAdminTranslate(language),
      ]);
      return detailDtoToCommunity(detailDto, translate, fmt);
    },
  });
}
