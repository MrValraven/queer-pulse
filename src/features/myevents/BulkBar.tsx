import { BulkActionBar, Button } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyEvents } from "./MyEventsContext";

/** Floating action bar shown while selecting events. */
export function BulkBar() {
  const { t } = useTranslation();
  const fmt = useFormat();
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
      label={
        <Translation
          i18nKey="myevents:bulk.selected"
          values={{ count: selectedCount }}
          slots={{
            count: (
              <RollingNumber
                value={fmt.number(selectedCount)}
                numericValue={selectedCount}
              />
            ),
          }}
        />
      }
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
