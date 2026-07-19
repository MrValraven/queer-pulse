import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { COMMUNITIES, type Community } from "../adminCommunities.data";
import {
  cardDtoToCommunity,
  detailDtoToCommunity,
} from "./adminCommunities.adapters";
import {
  getAdminCommunities,
  getAdminCommunity,
} from "./adminCommunities.api";

const ADMIN_COMMUNITIES_KEY = "admin-communities";

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
  const { t, language } = useTranslation();
  const fmt = useFormat();
  return useQuery<Community[]>({
    queryKey: [ADMIN_COMMUNITIES_KEY, demoMode, language],
    initialData: demoMode ? COMMUNITIES : undefined,
    queryFn: async () => {
      if (demoMode) return COMMUNITIES;
      const cardDtos = await getAdminCommunities();
      return cardDtos.map((cardDto) => cardDtoToCommunity(cardDto, t, fmt));
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
  const { t, language } = useTranslation();
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
      return detailDtoToCommunity(await getAdminCommunity(slug), t, fmt);
    },
  });
}
