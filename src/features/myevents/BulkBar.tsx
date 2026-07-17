import { useTranslation } from "../../shared/i18n/useTranslation";
import { sx } from "./myEvents.styles";
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
  const show = selectMode && selectedCount > 0;
  return (
    <div className={`${sx("bulkbar")} ${show ? sx("show") : ""}`}>
      <span className={sx("bulk-count")}>
        {t("myevents:bulk.selected", { count: selectedCount })}
      </span>
      <div className={sx("bulk-actions")}>
        <button type="button" className={sx("bulk-act")} onClick={bulkAddCal}>
          {t("myevents:bulk.addToCalendar")}
        </button>
        <button type="button" className={sx("bulk-act")} onClick={bulkExport}>
          {t("myevents:bulk.export")}
        </button>
        <button type="button" className={sx("bulk-act")} onClick={bulkCancel}>
          {t("myevents:bulk.cancelRsvps")}
        </button>
      </div>
      <button
        type="button"
        className={sx("bulk-close")}
        aria-label={t("myevents:bulk.doneAria")}
        onClick={closeBulk}
      >
        ×
      </button>
    </div>
  );
}
