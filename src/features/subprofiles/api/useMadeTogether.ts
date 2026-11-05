import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { getMadeTogether, type MadeTogetherItemDTO } from "./subprofiles.api";
import {
  toMadeTogetherCardView,
  type MadeTogetherCardView,
} from "./madeTogether.adapters";

/** The strip's default size; the endpoint takes 1 to 12. */
export const MADE_TOGETHER_DEFAULT_LIMIT = 8;
const MADE_TOGETHER_MAX_LIMIT = 12;

/** Credits change slowly, so a fetched strip stays fresh for five minutes. */
const MADE_TOGETHER_STALE_TIME_MS = 5 * 60 * 1000;

export interface MadeTogetherResult {
  /** The cards, newest work first. Empty while loading, on a failure, or when
   *  nobody has credited anyone yet: the page then hides the section. */
  cards: MadeTogetherCardView[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/** One shared empty list, so a loading strip keeps a stable `cards`. */
const NO_CARDS: MadeTogetherCardView[] = [];

const clampLimit = (limit: number) =>
  Math.min(MADE_TOGETHER_MAX_LIMIT, Math.max(1, Math.round(limit)));

/**
 * The directory's "Made together" strip: recent work where one persona
 * credited another. Live calls `GET /subprofiles/made-together`; demo reads
 * the authored `madeTogether.data.ts` fixture. Both go through
 * `toMadeTogetherCardView`, so the two modes hand the strip identical view
 * models. The language rides in the key because each card's date label is
 * formatted in it.
 */
export function useMadeTogether(
  limit: number = MADE_TOGETHER_DEFAULT_LIMIT,
): MadeTogetherResult {
  const { demoMode } = useDemoMode();
  const { language } = useTranslation();
  const clampedLimit = clampLimit(limit);
  const query = useQuery<MadeTogetherCardView[]>({
    queryKey: ["subprofiles", "madeTogether", demoMode, clampedLimit, language],
    staleTime: MADE_TOGETHER_STALE_TIME_MS,
    queryFn: async ({ signal }) => {
      let items: MadeTogetherItemDTO[];
      if (demoMode) {
        const { MADE_TOGETHER_DEMO_ITEMS } =
          await import("../data/madeTogether.data");
        items = MADE_TOGETHER_DEMO_ITEMS.slice(0, clampedLimit);
      } else {
        const response = await getMadeTogether(clampedLimit, signal);
        items = response.items ?? [];
      }
      return items.map((item) => toMadeTogetherCardView(item, language));
    },
  });
  return {
    cards: query.data ?? NO_CARDS,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
