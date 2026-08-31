import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ChangemakerStory } from "../changemakerStories.types";
import { CHANGEMAKERS } from "../changemakerStories";
import { fetchChangemakers } from "./changemakers.api";
import { changemakerDtoToStory } from "./changemakers.adapters";

export interface HeroStat {
  value: string;
  labelKey: string;
}

// Demo-mode hero numbers — the prototype's original figures. Demo mode only:
// live mode shows the server's real counts, or no stat row until they arrive.
const DEMO_STATS: HeroStat[] = [
  { value: "34", labelKey: "community:changemakers.stat.profiled" },
  { value: "6", labelKey: "community:changemakers.stat.causeAreas" },
  { value: "1.2k", labelKey: "community:changemakers.stat.peopleHelped" },
  { value: "12", labelKey: "community:changemakers.stat.activeCampaigns" },
];

export interface ChangemakersResult {
  profiles: ChangemakerStory[];
  featured: ChangemakerStory | undefined;
  stats: HeroStat[];
  isLoading: boolean;
  /** True when the directory request failed. Without it an outage renders as
   *  the "no changemakers yet" empty state (DES-22). */
  isError: boolean;
  /** Re-runs the failed request. Wire it to `LoadErrorState`'s `onRetry`. */
  refetch: () => void;
}

export function useChangemakers(): ChangemakersResult {
  const { demoMode } = useDemoMode();
  const { language } = useTranslation();
  const formatters = useFormat();

  const query = useQuery({
    queryKey: ["changemakers", "list", language],
    enabled: !demoMode,
    queryFn: async () => {
      const response = await fetchChangemakers();
      const profiles = response.profiles.map((profile) =>
        changemakerDtoToStory(profile, (value) => formatters.date(value)),
      );
      const featuredDto = response.profiles.find(
        (profile) => profile.isFeatured,
      );
      const featuredSlug = (featuredDto ?? response.profiles[0])?.slug;
      return {
        profiles,
        featured: profiles.find((profile) => profile.slug === featuredSlug),
        stats: [
          {
            value: String(response.stats.profiled),
            labelKey: "community:changemakers.stat.profiled",
          },
          {
            value: String(response.stats.causeAreas),
            labelKey: "community:changemakers.stat.causeAreas",
          },
          {
            value: formatters.number(response.stats.peopleHelped),
            labelKey: "community:changemakers.stat.peopleHelped",
          },
          {
            value: String(response.stats.activeCampaigns),
            labelKey: "community:changemakers.stat.activeCampaigns",
          },
        ],
      };
    },
  });

  if (demoMode) {
    return {
      profiles: CHANGEMAKERS,
      featured: CHANGEMAKERS[0],
      stats: DEMO_STATS,
      isLoading: false,
      isError: false,
      refetch: () => {},
    };
  }

  // No fallback to DEMO_STATS in live: the prototype's figures ("1.2k people
  // helped") are invented, and painting them into the hero while the request
  // is in flight — or permanently, when it fails — is a claim the platform
  // cannot back. An empty list renders no stat row at all.
  return {
    profiles: query.data?.profiles ?? [],
    featured: query.data?.featured,
    stats: query.data?.stats ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
