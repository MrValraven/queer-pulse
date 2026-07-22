import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { buildMentionDays } from "../mentions.data";
import type { Mention } from "../mentions.data";

export interface MentionDay {
  day: string;
  items: Mention[];
}

/**
 * @-mention thread source. Demo mode returns the colocated mock, grouped by day
 * (full fidelity: avatars, translated context, relative-time labels). Live mode
 * has no backend endpoint yet, so it returns an empty thread rather than leaking
 * the demo mentions into a real account — the page then shows its empty state.
 * When the backend grows a mentions endpoint, fetch it here and keep the mock as
 * the demo fallback (the dual-mode contract in CLAUDE.md).
 *
 * `language` is part of the queryKey because the built rows carry translated
 * `context` and `when` labels — switching language must rebuild the thread
 * rather than serve a stale cache entry.
 */
export function useMentions() {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  return useQuery<MentionDay[]>({
    queryKey: ["mentions", demoMode, language],
    queryFn: async () => {
      if (demoMode) return buildMentionDays(t, fmt);
      return [];
    },
  });
}
