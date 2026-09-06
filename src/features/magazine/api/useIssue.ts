import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { CropRect } from "../../../shared/components/ui/cropGeometry";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDayMonthYear, issueTitleNode } from "./magazine.adapters";
import { getIssue, getIssues, type IssueDTO } from "./magazine.api";

export interface IssueCoverData {
  number: string;
  title: ReactNode;
  dek: string;
  publishedLabel: string;
  /** PRD-104 — the desk's uploaded cover art, or `null` when there is none and
   *  the cover slot keeps its tinted placeholder. */
  coverUrl: string | null;
  /** PRD-104 — the saved reframe for `coverUrl`, passed to `ImageSlot` as
   *  `focus` (a focal point), never as `crop`. */
  coverCrop?: CropRect;
  /** PRD-104 — true only for the issue currently on the newsstand. The cover
   *  used to stamp "Current" on every issue in the archive. */
  isCurrent: boolean;
}

/**
 * `IssuePage.tsx` renders the issue named by its `:number` route param
 * (CNT-8 fix — every issue link used to point at the same bare route, so no
 * past issue was reachable). With no `number` (the bare `/magazine/issue`
 * route, e.g. the masthead's "Current issue" link), it falls back to the
 * newest issue from `GET /magazine/issues` (already returned newest-first).
 * Demo mode keeps `IssueCover`'s hardcoded copy regardless.
 *
 * The list read is what answers "is this the current issue?" (PRD-104): it is
 * the same embargoed, number-descending set the archive renders, so its first
 * row IS the newsstand issue. It also already carries the addressed issue, so
 * the single-issue endpoint is only called for a number the list does not
 * hold, where it produces the honest 404 the page turns into its empty state.
 *
 * i18n: `language` joins the query key because `publishedLabel` is
 * locale-formatted via `fmt` — switching language must re-derive it.
 */
export function useIssue(number: string | undefined) {
  const { demoMode } = useDemoMode();
  const fmt = useFormat();
  const { language } = useTranslation();
  return useQuery<IssueCoverData | null>({
    queryKey: ["magazine-issue", demoMode, language, number ?? "current"],
    queryFn: async () => {
      if (demoMode) return null;
      const issues = await getIssues();
      const currentNumber = issues[0]?.number ?? null;
      let dto: IssueDTO | undefined;
      if (number) {
        dto = issues.find((issue) => issue.number === number);
        if (!dto) dto = await getIssue(number);
      } else {
        dto = issues[0];
      }
      if (!dto) return null;
      return {
        number: dto.number,
        title: issueTitleNode(dto.title),
        dek: dto.dek,
        publishedLabel: formatDayMonthYear(dto.publishedOn, fmt),
        coverUrl: dto.coverUrl,
        coverCrop: dto.crop,
        isCurrent: dto.number === currentNumber,
      };
    },
  });
}
