import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import type { Mention } from "../mentions.data";

export interface MentionDay {
  day: string;
  items: Mention[];
}

/**
 * @-mention thread source. Demo mode returns the colocated mock, grouped by day
 * (full fidelity: avatars, translated context, relative-time labels). Live mode
 * fetches `GET /mentions` — the current member's real `@`-mentions, hand-mapped
 * from the backend `mention` notifications (there is no mentions table; see
 * `queerpulse-backend/src/mentions`) into the same day-grouped shape, so the
 * panel renders identically in both modes. The demo mock stays the demo-only
 * fallback (the dual-mode contract in CLAUDE.md).
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
      if (demoMode) {
        // Code-split: the demo mock is only pulled into the bundle in demo mode.
        const { buildMentionDays } = await import("../mentions.mock");
        return buildMentionDays(t, fmt);
      }
      const { getMentions } = await import("./mentions.api");
      const { buildLiveMentionDays } = await import("./mentions.adapters");
      const rows = await getMentions();
      return buildLiveMentionDays(rows, t, fmt);
    },
  });
}
