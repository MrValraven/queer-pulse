import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ChangemakerStory } from "../changemakerStories.types";
import { getChangemaker } from "../changemakerStories";
import { fetchChangemaker } from "./changemakers.api";
import { changemakerDtoToStory } from "./changemakers.adapters";

export interface ChangemakerResult {
  changemaker: ChangemakerStory | undefined;
  isLoading: boolean;
}

export function useChangemaker(slug: string | undefined): ChangemakerResult {
  const { demoMode } = useDemoMode();
  const { language } = useTranslation();
  const formatters = useFormat();
  const shouldFetch = !demoMode && !!slug;

  const query = useQuery({
    queryKey: ["changemaker", slug, language],
    enabled: shouldFetch,
    queryFn: async () => {
      const dto = await fetchChangemaker(slug as string);
      return changemakerDtoToStory(dto, (value) => formatters.date(value));
    },
  });

  if (demoMode) {
    return { changemaker: slug ? getChangemaker(slug) : undefined, isLoading: false };
  }

  return {
    changemaker: query.data,
    isLoading: shouldFetch && query.isLoading,
  };
}
