import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { formatDate } from "../../../../shared/lib/date";
import type { IssueProductionDto } from "../../api/issueProduction.api";
import { IssueCostsCard } from "./IssueCostsCard";
import { PagesCard } from "./PagesCard";
import { PublishDateCard } from "./PublishDateCard";
import { ShipChecklistCard } from "./ShipChecklistCard";

export interface IssueRailProps {
  production: IssueProductionDto;
  isSavingSchedule: boolean;
  onShip: () => void;
  /** `null` clears the date and puts the issue back to unscheduled. */
  onSaveSchedule: (publishedOn: string | null, onSaved: () => void) => void;
}

/**
 * The issue-production side rail: the pre-ship checklist, the editable
 * publish date, and the page-count card. Extracted from
 * `IssueProductionPage` to keep that route component inside the 200-line
 * budget, and because the publish-date save owns a toast of its own.
 */
export function IssueRail({
  production,
  isSavingSchedule,
  onShip,
  onSaveSchedule,
}: IssueRailProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  return (
    <>
      <ShipChecklistCard checklist={production.shipChecklist} onShip={onShip} />
      <PublishDateCard
        // Remounts when the saved date changes so the picker's draft restarts
        // from what the server now holds instead of keeping a stale "changed"
        // state after a successful save.
        key={production.publishedOn ?? "unscheduled"}
        publishedOn={production.publishedOn}
        isSaving={isSavingSchedule}
        onSave={(publishedOn) =>
          onSaveSchedule(publishedOn, () =>
            showToast(
              publishedOn
                ? t("magazine:issue.publishDate.savedToast", {
                    date: formatDate(publishedOn),
                  })
                : t("magazine:issue.publishDate.clearedToast"),
              "success",
            ),
          )
        }
      />
      <PagesCard pages={production.pages} />
      {/* CON-18 — the money the desk could not total while every fee was
          free text. Reads its own endpoint, so it never delays the rest of
          the rail. */}
      <IssueCostsCard number={production.number} />
    </>
  );
}
