import { BulkActionBar, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyEvents } from "./MyEventsContext";

/** Floating action bar shown while selecting events. */
export function BulkBar() {
  const { t } = useTranslation();
  const {
    selectMode,
    selectedCount,
    bulkAddCal,
    bulkExport,
    bulkCancel,
    closeBulk,
  } = useMyEvents();

  return (
    <BulkActionBar
      count={selectMode ? selectedCount : 0}
      label={t("myevents:bulk.selected", { count: selectedCount })}
      ariaLabel={t("myevents:bulk.selected", { count: selectedCount })}
      onClear={closeBulk}
      clearLabel={t("myevents:bulk.doneAria")}
    >
      <Button variant="ghost-dark" onClick={bulkAddCal}>
        {t("myevents:bulk.addToCalendar")}
      </Button>
      <Button variant="ghost-dark" onClick={bulkExport}>
        {t("myevents:bulk.export")}
      </Button>
      <Button variant="ghost-dark" onClick={bulkCancel}>
        {t("myevents:bulk.cancelRsvps")}
      </Button>
    </BulkActionBar>
  );
}
